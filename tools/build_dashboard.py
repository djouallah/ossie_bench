"""Build the data file of the dashboard (docs/index.html) from the questions.

    python tools/build_dashboard.py     # questions/q*/ -> docs/data.js

For every question: its title and text (README.md), each platform's query and its answer (results.csv), the
reference being dax-sql's, and the grid notes of questions/README.md. Run it after tools/run_questions.py.
"""
import csv
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from run_questions import REF, ROOT, files, num, same  # noqa: E402 - the labels and the comparison of the runner

# Columns that are answers, not groups: the 16 measures and the columns written in the query (q13's count, q14's
# growth). Every other column is a group.
MEASURES = {
    "sales_quantity", "net_profit_total", "budget_quantity", "sales_vs_budget_pct", "sales_qty_ly", "net_profit_ly",
    "sales_qty_fly", "sales_qty_yoy_pct", "country_qty_all_customers", "customer_share_all",
    "country_total_allselected", "customer_share_allselected", "country_total_allexcept", "country_total_fixed",
    "country_qty_all_cust_cat", "cust_cat_share_all", "day_count", "sales_qty_growth",
}
PLATFORMS = ["fabric", "snowflake", "dbx", "bigquery", "daxsql"]


def grid_notes():
    """{question id: {platform: the cell of the grid in questions/README.md}}."""
    out = {}
    for line in (ROOT / "questions" / "README.md").read_text(encoding="utf-8").splitlines():
        m = re.match(r"\| \[(q\d+)\]\([^)]*\)[^|]*\|(.*)\|\s*$", line)
        if m:
            cells = [c.strip() for c in m.group(2).split("|")]
            out[m.group(1)] = dict(zip(PLATFORMS, cells))
    return out


def measures():
    """[{name, meaning, standard}]: the table of semantic_model/a_baseline/measures.md."""
    out = []
    for line in (ROOT / "semantic_model" / "a_baseline" / "measures.md").read_text(encoding="utf-8").splitlines():
        m = re.match(r"\| `(\w+)` \|(.*)\|(.*)\|\s*$", line)
        if m:
            out.append({"name": m.group(1), "meaning": m.group(2).strip(), "standard": m.group(3).strip()})
    return out


def ossie():
    """The baseline Ossie file, and each measure it holds: {yaml, expr: {name: {lang, code, home}}}.
    lang is "sql" (expression.sql, the standard's portable SQL) or the dialect it is written in (DAX)."""
    import yaml
    path = ROOT / "semantic_model" / "a_baseline" / "model.ossie.yaml"
    text = path.read_text(encoding="utf-8")
    doc = yaml.safe_load(text)

    def one(m, home):
        e = m["expression"]
        if "sql" in e:
            return {"lang": "sql", "code": e["sql"], "home": home}
        d = e["dialects"][0]
        return {"lang": d["dialect"].lower(), "code": d["expression"], "home": home}
    expr = {m["name"]: one(m, d["name"]) for d in doc["datasets"] for m in d.get("metrics", [])}
    expr.update({m["name"]: one(m, "model") for m in doc.get("metrics", [])})
    return {"version": doc["version"], "yaml": text.strip(), "expr": expr}


def evidence():
    """What each platform answered when given Ossie: {name: text} of the response files in semantic_model/."""
    sm = ROOT / "semantic_model"
    paths = {
        "fabric_publish": sm / "fabric" / "publish_response.json",
        "sf_import": sm / "snowflake" / "tests" / "import_response.txt",
        "sf_reimport": sm / "snowflake" / "tests" / "export_reimport_response.txt",
        "sf_dialect": sm / "snowflake" / "tests" / "lod_via_ossie_response.txt",
        "sf_dialect_inline": sm / "snowflake" / "tests" / "lod_inline_via_ossie_response.txt",
        "sf_extensions": sm / "snowflake" / "tests" / "extensions_response.txt",
        "fabric_export": sm / "fabric" / "export_response.txt",
        "dbx_export": sm / "dbx" / "export_to_ossie_response.txt",
    }
    out = {k: p.read_text(encoding="utf-8").strip() for k, p in paths.items()}
    head = lambda p: next(x for x in p.read_text(encoding="utf-8").splitlines() if x.startswith("version:"))  # noqa: E731
    out["fabric_version"] = head(sm / "fabric" / "oss_dax_dialect.ossie.yaml")
    out["sf_export_version"] = head(sm / "snowflake" / "tests" / "export_from_semantic_view.ossie.yaml")
    # What dax-sql writes for q09's query on the Ossie file (it needs node and tools/daxsql/node_modules).
    try:
        import daxsql
        out["daxsql_q09"] = daxsql.compile_sql((ROOT / "questions" / "q09_country_all_vs_fixed" / "daxsql.sql").read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001 - the page then shows the query without its SQL
        print(f"dax-sql's SQL for q09 left out: {e}")
    return out


def question(qdir, notes):
    lines = (qdir / "README.md").read_text(encoding="utf-8").strip().splitlines()
    rows = list(csv.DictReader((qdir / "results.csv").open(encoding="utf-8")))
    cols = [c for c in rows[0] if c not in ("platform", "status", "error")]
    by = {}
    for r in rows:
        by.setdefault(r["platform"], []).append(r)
    ref = by[REF]
    dims = [c for c in cols if c not in MEASURES]

    def run(label, name):
        got = by.get(label, [])
        r = {"label": label, "platform": label.split(" ")[0], "file": name,
             "code": (qdir / name).read_text(encoding="utf-8").strip(), "status": got[0]["status"] if got else "",
             "rows": [[x.get(c, "") for c in cols] for x in got]}
        if got and got[0].get("error"):
            r["error"], r["rows"] = got[0]["error"], []
        # A cell differs when the reference row with the same groups holds another value (same test as the runner).
        want = {tuple(x[c] for c in dims): x for x in ref}
        r["diff"] = [[c in MEASURES and (k not in want or not same(x.get(c, ""), want[k][c])) for c in cols]
                     for x in got for k in [tuple(x[c] for c in dims)]]
        have = {tuple(x[c] for c in dims) for x in got}
        r["missing"] = [[x[c] for c in cols] for x in ref if tuple(x[c] for c in dims) not in have]
        if "error" in r:
            r["missing"] = []
        return r

    qid = qdir.name.split("_")[0]
    return {
        "id": qid, "folder": qdir.name, "title": lines[0].lstrip("# ").strip(),
        "text": " ".join(x.strip() for x in lines[1:] if x.strip()),
        "columns": cols, "measures": [c in MEASURES for c in cols],
        "reference": {"rows": [[x[c] for c in cols] for x in ref]},
        "runs": [run(label, name) for label, name in files(qdir)],
        "notes": notes.get(qid, {}),
    }


def main():
    notes = grid_notes()
    qs = [question(d, notes) for d in sorted((ROOT / "questions").glob("q*/")) if (d / "results.csv").exists()]
    out = ROOT / "docs" / "data.js"
    out.parent.mkdir(exist_ok=True)
    out.write_text("window.DATA = " + json.dumps({"measures": measures(), "ossie": ossie(), "evidence": evidence(), "questions": qs}, ensure_ascii=False, indent=1) + ";\n",
                   encoding="utf-8", newline="\n")
    plain = {p: sum(1 for q in qs for r in q["runs"] if r["label"] == p and r["status"] == "match") for p in PLATFORMS}
    print(f"{out.relative_to(ROOT)}: {len(qs)} questions; plain matches {plain}")


if __name__ == "__main__":
    main()
