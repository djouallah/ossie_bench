"""Build the data file of the dashboard (docs/index.html) from the questions.

    python tools/build_dashboard.py     # questions/q*/ -> docs/data.js

For every question: its title and text (README.md), the reference query, each platform's query and its answer
(results.csv), and the grid notes of questions/README.md. Run it after tools/run_questions.py.
"""
import csv
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from run_questions import ROOT, files, num, same  # noqa: E402 - the labels and the comparison of the runner

# Columns that are answers, not groups: the 16 measures and the count of q13. Every other column is a group.
MEASURES = {
    "sales_quantity", "net_profit_total", "budget_quantity", "sales_vs_budget_pct", "sales_qty_ly", "net_profit_ly",
    "sales_qty_fly", "sales_qty_yoy_pct", "country_qty_all_customers", "customer_share_all",
    "country_total_allselected", "customer_share_allselected", "country_total_allexcept", "country_total_fixed",
    "country_qty_all_cust_cat", "cust_cat_share_all", "day_count",
}
PLATFORMS = ["fabric", "snowflake", "dbx"]


def grid_notes():
    """{question id: {platform: the cell of the grid in questions/README.md}}."""
    out = {}
    for line in (ROOT / "questions" / "README.md").read_text(encoding="utf-8").splitlines():
        m = re.match(r"\| \[(q\d+)\]\([^)]*\)[^|]*\|(.*)\|\s*$", line)
        if m:
            cells = [c.strip() for c in m.group(2).split("|")]
            out[m.group(1)] = dict(zip(PLATFORMS, cells))
    return out


def question(qdir, notes):
    lines = (qdir / "README.md").read_text(encoding="utf-8").strip().splitlines()
    rows = list(csv.DictReader((qdir / "results.csv").open(encoding="utf-8")))
    cols = [c for c in rows[0] if c not in ("platform", "status", "error")]
    by = {}
    for r in rows:
        by.setdefault(r["platform"], []).append(r)
    ref = by["expected"]
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
        "expected": {"code": (qdir / "expected.sql").read_text(encoding="utf-8").strip(),
                     "rows": [[x[c] for c in cols] for x in ref]},
        "runs": [run(label, name) for label, name in files(qdir)],
        "notes": notes.get(qid, {}),
    }


def main():
    notes = grid_notes()
    qs = [question(d, notes) for d in sorted((ROOT / "questions").glob("q*/")) if (d / "results.csv").exists()]
    out = ROOT / "docs" / "data.js"
    out.parent.mkdir(exist_ok=True)
    out.write_text("window.DATA = " + json.dumps({"questions": qs}, ensure_ascii=False, indent=1) + ";\n",
                   encoding="utf-8", newline="\n")
    plain = {p: sum(1 for q in qs for r in q["runs"] if r["label"] == p and r["status"] == "match") for p in PLATFORMS}
    print(f"{out.relative_to(ROOT)}: {len(qs)} questions; plain matches {plain}")


if __name__ == "__main__":
    main()
