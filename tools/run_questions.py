"""Run every question on every platform; write one results.csv per question.

    python tools/run_questions.py                 # all questions
    python tools/run_questions.py q04 q11         # some questions (by prefix)
    python tools/run_questions.py --only=daxsql   # some platforms; the others' rows are kept from results.csv

In questions/<question>/: expected.sql -> the reference answer (plain SQL over data/*.parquet, on DuckDB);
fabric.dax -> Fabric (executeQueries), snowflake.sql -> Snowflake, dbx.sql -> Databricks, daxsql.sql -> dax-sql (the
baseline Ossie file compiled by dax-sql, run on DuckDB over data/*.parquet); <platform>_<route>.sql,
where there is one, is another route on that platform (more model, or logic in the query), e.g. dbx_workaround.sql.
results.csv has a `platform` column (`expected` first), a `status` column, then the columns of the answers.
status, against the reference: match, partial (what it returned matches, but not every column could be asked),
differs (an answer, no error, other rows or numbers), refused (one row, with the platform's own message in `error`).
"""
import csv
import datetime
import decimal
import os
import sys
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")
sys.path.insert(0, str(Path(__file__).resolve().parent))
ROOT = Path(__file__).resolve().parents[1]
PLAIN = [("fabric", "fabric.dax"), ("snowflake", "snowflake.sql"), ("dbx", "dbx.sql"), ("daxsql", "daxsql.sql")]


def files(qdir):
    """(label, file) of a question: each platform's plain query, then its other routes: dbx (workaround), ..."""
    out = []
    for plat, name in PLAIN:
        if (qdir / name).exists():
            out.append((plat, name))
        for f in sorted(qdir.glob(f"{plat}_*.sql")):
            out.append((f"{plat} ({f.stem[len(plat) + 1:].replace('_', ' ')})", f.name))
    return out


def runners(only=None):
    """{platform: run(query) -> (columns, rows)}, for the platforms asked (all by default)."""
    conn = {}
    def snow(q):
        import sf
        if "c" not in conn:
            conn["c"] = sf.connect()
        return sf.query(conn["c"], q)
    def lazy(mod, fn):
        return lambda q: getattr(__import__(mod), fn)(q)
    run = {"fabric": lazy("fabric", "dax"), "snowflake": snow, "dbx": lazy("dbx", "sql"), "daxsql": lazy("daxsql", "query")}
    return {k: v for k, v in run.items() if not only or k in only}


def cell(v):
    if v is None:
        return ""
    if isinstance(v, (datetime.date, datetime.datetime)):
        return v.isoformat()[:10]
    if isinstance(v, str) and len(v) >= 19 and v[10:19] == "T00:00:00":
        return v[:10]
    if isinstance(v, float):
        return f"{v:.12g}"
    if isinstance(v, decimal.Decimal):
        return format(v.normalize(), "f")
    return v


def expected(path):
    """[{column: value}] of the reference query, on DuckDB, from the repo root (its paths are data/*.parquet)."""
    import duckdb
    os.chdir(ROOT)
    cur = duckdb.connect().execute(path.read_text(encoding="utf-8"))
    cols = [d[0].lower() for d in cur.description]
    return [{c: cell(v) for c, v in zip(cols, r)} for r in cur.fetchall()]


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def same(a, b):
    """Equal cells: numbers within 1e-6 (Snowflake returns ratios with 6 decimals) or 1e-9 relative (float sums)."""
    x, y = num(a), num(b)
    if x is None or y is None:
        return str(a) == str(b)
    return abs(x - y) <= max(1e-6, 1e-9 * abs(y))


def status(answer, ref):
    if answer and "error" in answer[0]:
        return "refused"
    cols = [c for c in ref[0] if answer and c in answer[0]]
    def rows(rs):
        key = lambda r: [(0, round(num(v), 3), "") if num(v) is not None else (1, 0, str(v)) for v in r]
        return sorted(([r.get(c, "") for c in cols] for r in rs), key=key)
    got, want = rows(answer), rows(ref)
    if not cols or len(got) != len(want) or not all(same(a, b) for g, w in zip(got, want) for a, b in zip(g, w)):
        return "differs"
    return "match" if len(cols) == len(ref[0]) else "partial"


def ask(run, plat, path):
    """[{column: value}] of one query, or [{'error': message}]."""
    try:
        cols, rows = run[plat](path.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001 - a platform's error is its answer
        return [{"error": " ".join(str(e).split())}]
    cols = [c.lower() for c in cols]
    return [{c: cell(v) for c, v in zip(cols, r) if c != "is_total"} for r in rows]


def main(argv):
    picks = [a for a in argv if not a.startswith("--")]
    only = next((a.split("=", 1)[1].split(",") for a in argv if a.startswith("--only=")), None)
    run = runners(only)
    for qdir in sorted(p for p in (ROOT / "questions").iterdir() if p.is_dir()):
        if picks and not any(qdir.name.startswith(p) for p in picks):
            continue
        ref = expected(qdir / "expected.sql")
        rows = [{"platform": "expected", "status": "", **r} for r in ref]
        kept = {}
        if only and (qdir / "results.csv").exists():
            for r in csv.DictReader((qdir / "results.csv").open(encoding="utf-8")):
                kept.setdefault(r["platform"], []).append({k: v for k, v in r.items() if v != "" or k in ref[0]})
        for plat, name in files(qdir):
            if plat.split()[0] not in run:
                rows += kept.get(plat, [])
                continue
            answer = ask(run, plat.split()[0], qdir / name)
            st = status(answer, ref)
            rows += [{"platform": plat, "status": st, **r} for r in answer]
            print(f"{qdir.name}/{name}: {st}, " + (answer[0]["error"][:100] if st == "refused" else f"{len(answer)} rows"))
        cols = ["platform", "status"]
        for r in rows:
            cols += [c for c in r if c not in cols and c != "error"]
        if any("error" in r for r in rows):
            cols.append("error")
        with open(qdir / "results.csv", "w", newline="", encoding="utf-8") as fh:
            w = csv.DictWriter(fh, fieldnames=cols, restval="")
            w.writeheader()
            w.writerows(rows)


if __name__ == "__main__":
    main(sys.argv[1:])
