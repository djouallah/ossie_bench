"""Fabric plumbing: OneLake data, the Ossie + DAX semantic view, DAX queries.

    python tools/fabric.py load       # data/*.parquet -> Delta tables in lakehouse `ossie` (workspace `app`)
    python tools/fabric.py publish    # semantic_model/fabric/oss_dax_dialect.ossie.yaml -> Context/Semantic Views/, then
                                      #   Fabric's Publish -> Direct Lake semantic model `dax_context`

Auth: `az login` (tenant fabriccat.net). Commands chain: `load publish`.
"""
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = os.environ.get("FABRIC_WORKSPACE_NAME", "app")
LAKEHOUSE = os.environ.get("FABRIC_LAKEHOUSE_NAME", "ossie")
VIEW = "dax_context"               # the semantic view, and the model Publish makes of it
TABLES = ["dim_calendar", "dim_product", "dim_category", "dim_store", "dim_country", "fact_sales", "fact_budget"]
API = "https://api.fabric.microsoft.com/v1"
PBI = "https://api.powerbi.com/v1.0/myorg"
DFS = "https://onelake.dfs.fabric.microsoft.com"


# --- HTTP ---------------------------------------------------------------------------------------------------------
_TOKENS = {}


def token(resource):
    """An `az login` token for `resource`, kept for 30 minutes (az is slow to start)."""
    tok, at = _TOKENS.get(resource, (None, 0))
    if not tok or time.time() - at > 1800:
        tok = subprocess.run(["az", "account", "get-access-token", "--resource", resource, "--query", "accessToken",
                              "-o", "tsv"], capture_output=True, text=True, check=True,
                             shell=(os.name == "nt")).stdout.strip()
        _TOKENS[resource] = (tok, time.time())
    return tok


def http(method, url, body=None, resource="https://api.fabric.microsoft.com", raw=None, headers=None):
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    req = urllib.request.Request(url, method=method, data=data, headers={
        "Authorization": f"Bearer {token(resource)}", "Content-Type": "application/json", **(headers or {})})
    with urllib.request.urlopen(req) as r:
        payload = r.read()
        return r.status, (json.loads(payload) if payload.strip().startswith((b"{", b"[")) else payload), r.headers


def wait_operation(headers):
    """Poll a Fabric long-running operation (202 + Location) until it ends."""
    loc = headers["Location"]
    while True:
        time.sleep(int(headers.get("Retry-After", 3) or 3))
        _, op, _ = http("GET", loc)
        if op.get("status") in ("Succeeded", "Failed"):
            if op["status"] == "Failed":
                sys.exit(f"operation failed: {json.dumps(op.get('error'))}")
            return op


def workspace_id():
    _, body, _ = http("GET", f"{API}/workspaces")
    return next(w["id"] for w in body["value"] if w["displayName"] == WORKSPACE)


def lakehouse_id(ws):
    def find():
        _, body, _ = http("GET", f"{API}/workspaces/{ws}/lakehouses")
        return next((l["id"] for l in body["value"] if l["displayName"] == LAKEHOUSE), None)
    lh = find()
    if not lh:
        print(f"creating lakehouse {LAKEHOUSE} (schemas enabled)")
        http("POST", f"{API}/workspaces/{ws}/lakehouses", {"displayName": LAKEHOUSE, "creationPayload": {"enableSchemas": True}})
        for _ in range(30):
            time.sleep(3)
            if (lh := find()):
                break
    return lh


# --- load ---------------------------------------------------------------------------------------------------------
def load():
    import pyarrow.parquet as pq
    from deltalake import write_deltalake
    ws, opts = workspace_id(), {"bearer_token": token("https://storage.azure.com"), "use_fabric_endpoint": "true"}
    lh = lakehouse_id(ws)
    for t in TABLES:
        tbl = pq.read_table(ROOT / "data" / f"{t}.parquet")
        write_deltalake(f"abfss://{ws}@onelake.dfs.fabric.microsoft.com/{lh}/Tables/dbo/{t}", tbl,
                        mode="overwrite", schema_mode="overwrite", storage_options=opts)
        print(f"{t}: {tbl.num_rows} rows -> {WORKSPACE}/{LAKEHOUSE}/Tables/dbo/{t}")


# --- publish the Ossie semantic view --------------------------------------------------------------------------------
def upload(ws, lh, rel_path, content):
    url = f"{DFS}/{ws}/{lh}/{urllib.parse.quote(rel_path)}"
    h = {"x-ms-version": "2023-11-03"}
    http("PUT", url + "?resource=file", raw=b"", resource="https://storage.azure.com", headers=h)
    http("PATCH", url + "?action=append&position=0", raw=content, resource="https://storage.azure.com", headers=h)
    http("PATCH", url + f"?action=flush&position={len(content)}", raw=b"", resource="https://storage.azure.com", headers=h)


def publish():
    """Fabric's Publish of a lakehouse semantic view (beta API): it compiles the Ossie YAML into a Direct Lake model.
    Tables written moments ago may not be discovered yet; Publish then says they don't exist, so it retries."""
    ws = workspace_id()
    lh = lakehouse_id(ws)
    y = (ROOT / "semantic_model" / "fabric" / "oss_dax_dialect.ossie.yaml").read_bytes()
    upload(ws, lh, f"Context/Semantic Views/{VIEW}/{VIEW}.yaml", y)
    print(f"uploaded Context/Semantic Views/{VIEW}/{VIEW}.yaml ({len(y)} bytes)")
    url = f"{API}/workspaces/{ws}/lakehouses/{lh}/semanticViews/{VIEW}/publish?beta=true"
    for attempt in range(10):
        try:
            status, body, headers = http("POST", url, raw=b"")
            result = wait_operation(headers) if status == 202 else body
            break
        except urllib.error.HTTPError as e:
            text = e.read().decode(errors="replace")
            if "do not exist or access was denied" in text:
                print(f"lakehouse has not discovered new tables yet; retrying in 30s ({attempt + 1}/10)")
                time.sleep(30)
                continue
            sys.exit(f"publish refused (HTTP {e.code}): {text[:3000]}")
    (ROOT / "semantic_model" / "fabric" / "publish_response.json").write_text(json.dumps(result, indent=1), encoding="utf-8")
    print("publish:", json.dumps(result.get("summary", result))[:500])



# --- DAX ------------------------------------------------------------------------------------------------------------
def dataset_id(ws, name):
    _, body, _ = http("GET", f"{PBI}/groups/{ws}/datasets", resource="https://analysis.windows.net/powerbi/api")
    return next(d["id"] for d in body["value"] if d["name"] == name)


_IDS = {}


def dax(query, model=VIEW):
    """(columns, rows) of one DAX query, through the executeQueries REST API."""
    if model not in _IDS:
        ws = _IDS.setdefault("ws", workspace_id())
        _IDS[model] = dataset_id(ws, model)
    try:
        _, res, _ = http("POST", f"{PBI}/groups/{_IDS['ws']}/datasets/{_IDS[model]}/executeQueries",
                         {"queries": [{"query": query}], "serializerSettings": {"includeNulls": True}},
                         resource="https://analysis.windows.net/powerbi/api")
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace")
        try:
            body = " | ".join(d["detail"]["value"] for d in json.loads(body)["error"]["pbi.error"]["details"]
                              if d.get("code") == "DetailsMessage")
        except Exception:  # noqa: BLE001
            pass
        raise RuntimeError(body) from None
    rows = res["results"][0]["tables"][0]["rows"]
    cols = [re.sub(r"^.*\[(.*)\]$", r"\1", c) for c in (rows[0].keys() if rows else [])]
    return cols, [list(r.values()) for r in rows]


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
    for cmd in sys.argv[1:]:
        {"load": load, "publish": publish}[cmd]()
