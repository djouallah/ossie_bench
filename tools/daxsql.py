"""The dax-sql client: a query on the baseline Ossie file, compiled by dax-sql, run on DuckDB over data/*.parquet.

    npm ci --prefix tools/daxsql            # once: dax-sql and yaml, from registry.npmjs.org
    python tools/daxsql.py questions/q01_sales_by_country_year/daxsql.sql

dax-sql (https://github.com/djouallah/dax-sql) reads the Ossie file with its measures in SQL and in DAX, and turns
a SQL query on the model (SELECT ... AGG(measure) FROM model ...) into one DuckDB SELECT. It only writes SQL;
DuckDB runs it, from the repo root, on the same parquet files as the reference.
"""
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODEL = ROOT / "semantic_model" / "a_baseline" / "model.ossie.yaml"
COMPILE = ROOT / "tools" / "daxsql" / "compile.mjs"


def compile_sql(query):
    """The DuckDB SQL dax-sql writes for a query on the model."""
    out = subprocess.run(["node", str(COMPILE), str(MODEL)], input=query, capture_output=True, text=True,
                         encoding="utf-8", check=False)
    if out.returncode:
        raise RuntimeError(out.stderr.strip())
    r = json.loads(out.stdout)
    if "error" in r:
        raise RuntimeError(r["error"])
    return r["sql"]


def query(text):
    """(columns, rows) of a query on the model."""
    import duckdb
    sql = compile_sql(text)
    os.chdir(ROOT)
    cur = duckdb.connect().execute(sql)
    return [d[0] for d in cur.description], cur.fetchall()


if __name__ == "__main__":
    cols, rows = query(Path(sys.argv[1]).read_text(encoding="utf-8"))
    print(cols)
    for r in rows:
        print(r)
