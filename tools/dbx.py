"""Databricks plumbing: Unity Catalog data, the metric views, SQL.

    python tools/dbx.py load      # data/*.parquet -> volume databricks_ne.ossie_demo.raw -> managed Delta tables
    python tools/dbx.py deploy    # semantic_model/dbx/<name>.metric_view.yaml -> metric view <name>_mv
    python tools/dbx.py ossie-out # export_to_ossie on sales_mv -> semantic_model/dbx/export_to_ossie_response.txt

Auth: the Databricks CLI, profile `analyst`; SQL warehouse 2x-small. Commands chain: `load deploy`.
DATABRICKS_FQ moves the loader, but the metric views and questions/*/dbx*.sql name databricks_ne.ossie_demo.
"""
import json
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROFILE = os.environ.get("DATABRICKS_PROFILE", "analyst")
WAREHOUSE_ID = os.environ.get("DATABRICKS_WAREHOUSE_ID", "9204c15809caaf4c")  # 2x-small
FQ = os.environ.get("DATABRICKS_FQ", "databricks_ne.ossie_demo")
TABLES = ["dim_calendar", "dim_product", "dim_category", "dim_store", "dim_country", "fact_sales", "fact_budget"]


def cli(*args, body=None):
    cmd = ["databricks", "-p", PROFILE, *args, "-o", "json"]
    if body is not None:
        cmd += ["--json", json.dumps(body)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr.strip() or r.stdout.strip())
    return json.loads(r.stdout) if r.stdout.strip() else None


def sql(statement):
    """(columns, rows) of one statement on the SQL warehouse (Statement Execution API), or RuntimeError."""
    res = cli("api", "post", "/api/2.0/sql/statements", body={
        "warehouse_id": WAREHOUSE_ID, "statement": statement, "wait_timeout": "50s",
        "on_wait_timeout": "CONTINUE", "format": "JSON_ARRAY", "disposition": "INLINE"})
    while res["status"]["state"] in ("PENDING", "RUNNING"):
        time.sleep(2)
        res = cli("api", "get", f"/api/2.0/sql/statements/{res['statement_id']}")
    if res["status"]["state"] != "SUCCEEDED":
        raise RuntimeError(res["status"].get("error", {}).get("message", res["status"]["state"]))
    cols = [c["name"] for c in res.get("manifest", {}).get("schema", {}).get("columns", [])]
    chunk = res.get("result", {})
    rows = list(chunk.get("data_array", []) or [])
    while chunk.get("next_chunk_internal_link"):
        chunk = cli("api", "get", chunk["next_chunk_internal_link"])
        rows += chunk.get("data_array", []) or []
    return cols, rows


def load():
    sql(f"CREATE SCHEMA IF NOT EXISTS {FQ}")
    sql(f"CREATE VOLUME IF NOT EXISTS {FQ}.raw")
    vol = "/Volumes/" + FQ.replace(".", "/") + "/raw"
    for t in TABLES:
        subprocess.run(["databricks", "-p", PROFILE, "fs", "cp", "--overwrite", str(ROOT / "data" / f"{t}.parquet"),
                        f"dbfs:{vol}/{t}.parquet"], check=True, capture_output=True)
        sql(f"CREATE OR REPLACE TABLE {FQ}.{t} AS SELECT * FROM read_files('{vol}/{t}.parquet', format => 'parquet')")
        print(f"{t}: {sql(f'SELECT COUNT(*) FROM {FQ}.{t}')[1][0][0]} rows -> {FQ}.{t}")


def deploy():
    """Every metric view of semantic_model/dbx/."""
    folder = ROOT / "semantic_model" / "dbx"
    for f in sorted(folder.glob("*.metric_view.yaml")):
        view = f"{FQ}.{f.name.removesuffix('.metric_view.yaml')}_mv"
        sql(f"CREATE OR REPLACE VIEW {view} WITH METRICS LANGUAGE YAML AS $$\n{f.read_text(encoding='utf-8')}$$")
        print(f"created {view}")


def ossie_out():
    """export_to_ossie on sales_mv, and the flag it asks for. -> semantic_model/dbx/export_to_ossie_response.txt"""
    out = []
    for st in [f"SELECT * FROM export_to_ossie(TABLE({FQ}.sales_mv))", "SET spark.databricks.sql.metricView.exportToOssie.enabled = true"]:
        try:
            cols, rows = sql(st)
            out.append(f"{st}\n  OK: {str(rows)[:2000]}")
        except RuntimeError as e:
            out.append(f"{st}\n  {' '.join(str(e).split())}")
    p = ROOT / "semantic_model" / "dbx" / "export_to_ossie_response.txt"
    p.write_text("On the SQL warehouse (2x-small):\n\n" + "\n\n".join(out) + "\n", encoding="utf-8")
    print(p.read_text(encoding="utf-8"))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
    for cmd in sys.argv[1:]:
        {"load": load, "deploy": deploy, "ossie-out": ossie_out}[cmd]()
