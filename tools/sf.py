"""Snowflake plumbing: data, semantic view, Parquet export, Ossie in/out.

    python tools/sf.py setup       # the notebook's data + FACT_BUDGET as Iceberg tables, then
                                          #   semantic_model/snowflake/semantic_view.sql, in DAX_DEMO.MODEL
    python tools/sf.py orphans     # only q15's budget rows whose category DIM_CATEGORY lacks (part of setup)
    python tools/sf.py view       # only semantic_model/snowflake/semantic_view.sql, on the existing tables
    python tools/sf.py export      # the tables -> data/<table>.parquet (what Fabric and Databricks load)
    python tools/sf.py ossie-out   # SYSTEM$READ_OSSIE_YAML_FROM_SEMANTIC_VIEW
                                          #   -> semantic_model/snowflake/tests/export_from_semantic_view.ossie.yaml
    python tools/sf.py ossie-reimport  # the export above, imported back into a scratch view (then dropped)
                                          #   -> semantic_model/snowflake/tests/export_reimport_response.txt
    python tools/sf.py ossie-lod   # the import with the LOD inline in a model metric (SNOWFLAKE dialect), on a scratch view
                                          #   -> semantic_model/snowflake/tests/lod_inline_via_ossie_response.txt
    python tools/sf.py ossie-in    # SYSTEM$CREATE_SEMANTIC_VIEW_FROM_OSSIE_YAML(semantic_model/snowflake/tests/dax_context.ossie.yaml)
    python tools/sf.py ossie-ext   # the same import with vendor extensions, on a scratch view that is then dropped
                                          #   -> semantic_model/snowflake/tests/extensions_response.txt
    python tools/sf.py ossie-sql   # the import of Ossie in its own SQL (0.1.1 ANSI_SQL, 0.3.0.dev0 expression.sql)
                                          #   -> semantic_model/snowflake/tests/ossie_sql_response.txt

Connection: the default connection of ~/.snowflake/config.toml. Commands chain: `setup export`.
"""
import json
import os
import sys
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")
import pyarrow as pa  # noqa: E402
import pyarrow.parquet as pq  # noqa: E402
import snowflake.connector  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK = ROOT / "dax_context_demo.ipynb"
DATABASE = os.environ.get("SNOWFLAKE_DATABASE", "DAX_DEMO")
SCHEMA = os.environ.get("SNOWFLAKE_SCHEMA", "MODEL")
FQ = f"{DATABASE}.{SCHEMA}"
SV = f"{FQ}.SEMANTIC_VIEW"
TABLES = ["DIM_CALENDAR", "DIM_PRODUCT", "DIM_STORE", "FACT_SALES",
          "DIM_COUNTRY", "DIM_BRAND", "DIM_CATEGORY", "DIM_ALL_MEMBERS", "FACT_BUDGET"]

# The second fact: a monthly budget by country and category (432 rows), deterministic like the notebook's data:
# the month's actual quantity times a factor in [0.95, 1.05).
BUDGET_SQL = """
CREATE OR REPLACE ICEBERG TABLE {FQ}.FACT_BUDGET AS
SELECT c.month_start, s.country, p.category,
       ROUND(SUM(f.sales_qty) * (0.95 + 0.1 * UNIFORM(0::FLOAT, 1::FLOAT, HASH(c.month_start, s.country, p.category))))::INT
         AS budget_qty
FROM {FQ}.FACT_SALES f
JOIN {FQ}.DIM_CALENDAR c ON f.sale_date = c.date_key
JOIN {FQ}.DIM_STORE s    ON f.store_id = s.store_id
JOIN {FQ}.DIM_PRODUCT p  ON f.product_id = p.product_id
GROUP BY c.month_start, s.country, p.category
"""

# The orphans of q15: a 2022 budget for Germany in Skin Care, a category DIM_CATEGORY doesn't have (12 rows, 50,000 a
# month). Power BI shows them under a blank category; other models may drop them. Re-running replaces them.
ORPHAN_SQL = [
    "DELETE FROM {FQ}.FACT_BUDGET WHERE category = 'Skin Care'",
    "INSERT INTO {FQ}.FACT_BUDGET (month_start, country, category, budget_qty) "
    "SELECT DATEADD(month, column1, DATE '2022-01-01'), 'Germany', 'Skin Care', 50000 "
    "FROM VALUES (0), (1), (2), (3), (4), (5), (6), (7), (8), (9), (10), (11)",
]


def cells():
    nb = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
    return [c for c in nb["cells"] if c["cell_type"] == "code"]


def notebook_python_value(name):
    """DATA_SQL / SV_SQL: the literal assigned in the notebook's code cell."""
    for c in cells():
        src = "".join(c["source"])
        if src.startswith(f"{name} = "):
            scope = {}
            exec(src.split("\n\n")[0] if name == "DATA_SQL" else src.split("\n\nsession")[0], scope)
            return scope[name]
    raise KeyError(name)



def connect():
    # The default connection of ~/.snowflake/config.toml (`pat`: a PAT in the password slot), or SNOWFLAKE_CONNECTION.
    name = os.environ.get("SNOWFLAKE_CONNECTION")
    conn = snowflake.connector.connect(**({"connection_name": name} if name else {}))
    cur = conn.cursor()
    cur.execute("SELECT CURRENT_USER(), CURRENT_ROLE(), CURRENT_WAREHOUSE(), CURRENT_VERSION()")
    print("connected:", cur.fetchone())
    cur.execute(f"CREATE SCHEMA IF NOT EXISTS {FQ}")
    cur.execute(f"USE SCHEMA {FQ}")
    return conn


def setup(conn):
    """The notebook's tables, as Snowflake-managed Iceberg tables (Snowflake storage, no external volume)."""
    cur = conn.cursor()
    cur.execute(f"ALTER DATABASE {DATABASE} SET CATALOG = 'SNOWFLAKE' EXTERNAL_VOLUME = 'SNOWFLAKE_MANAGED'")
    cur.execute(f"SHOW TABLES IN SCHEMA {FQ}")
    cols = [d[0] for d in cur.description]
    for r in cur.fetchall():  # a plain table of the same name blocks CREATE OR REPLACE ICEBERG TABLE
        if r[cols.index("is_iceberg")] == "N" and r[cols.index("name")] in TABLES:
            cur.execute(f"DROP TABLE {FQ}.{r[cols.index('name')]}")
    for stmt in notebook_python_value("DATA_SQL"):
        stmt = stmt.replace("{FQ}", FQ).replace("CREATE OR REPLACE TABLE", "CREATE OR REPLACE ICEBERG TABLE", 1)
        cur.execute(stmt)
    cur.execute(BUDGET_SQL.replace("{FQ}", FQ))
    orphans(conn)
    sv_sql = (ROOT / "semantic_model" / "snowflake" / "semantic_view.sql").read_text(encoding="utf-8")
    cur.execute(sv_sql.replace("{FQ}", FQ))
    cur.execute(f"SELECT (SELECT COUNT(*) FROM {FQ}.FACT_SALES), (SELECT COUNT(*) FROM {FQ}.FACT_BUDGET)")
    print("setup done, sales / budget rows:", cur.fetchone())



def orphans(conn):
    """The budget rows of q15 whose category is in no row of DIM_CATEGORY (ORPHAN_SQL)."""
    cur = conn.cursor()
    for stmt in ORPHAN_SQL:
        cur.execute(stmt.replace("{FQ}", FQ))
    cur.execute(f"SELECT COUNT(*), SUM(budget_qty) FROM {FQ}.FACT_BUDGET WHERE category NOT IN (SELECT category FROM {FQ}.DIM_CATEGORY)")
    print("orphan budget rows, units:", cur.fetchone())


def view(conn):
    """Only the semantic view (semantic_model/snowflake/semantic_view.sql), on the existing tables."""
    sv_sql = (ROOT / "semantic_model" / "snowflake" / "semantic_view.sql").read_text(encoding="utf-8")
    conn.cursor().execute(sv_sql.replace("{FQ}", FQ))
    print(f"semantic view {SV} created")


def query(conn, sql):
    """(columns, rows) of one statement: the dumb client's entry point."""
    cur = conn.cursor()
    cur.execute(sql)
    return [d[0].lower() for d in cur.description], [list(r) for r in cur.fetchall()]


def arrow_types(t: pa.Table) -> pa.Table:
    """Snowflake NUMBER(38,0) and narrowed ints -> int64, NUMBER(p,s>0) -> float64, so every engine reads plain types."""
    fields = []
    for f in t.schema:
        typ = f.type
        if pa.types.is_decimal(typ):
            typ = pa.int64() if typ.scale == 0 else pa.float64()
        elif pa.types.is_integer(typ):  # the connector narrows small numbers to int8/int16: widen for every engine
            typ = pa.int64()
        fields.append(pa.field(f.name.lower(), typ))
    return t.rename_columns([f.name for f in fields]).cast(pa.schema(fields))


def export(conn):
    out = ROOT / "data"
    out.mkdir(exist_ok=True)
    cur = conn.cursor()
    for t in TABLES:
        tbl = arrow_types(cur.execute(f"SELECT * FROM {FQ}.{t}").fetch_arrow_all())
        pq.write_table(tbl, out / f"{t.lower()}.parquet", row_group_size=1 << 20)
        print(f"{t}: {tbl.num_rows} rows -> data/{t.lower()}.parquet  {tbl.schema}")


def ossie_out(conn):
    cur = conn.cursor()
    y = cur.execute(f"SELECT SYSTEM$READ_OSSIE_YAML_FROM_SEMANTIC_VIEW('{SV}')").fetchone()[0]
    p = ROOT / "semantic_model" / "snowflake" / "tests" / "export_from_semantic_view.ossie.yaml"
    p.parent.mkdir(exist_ok=True)
    p.write_text(y, encoding="utf-8")
    print(f"wrote {p.relative_to(ROOT)} ({len(y.splitlines())} lines)")


def ossie_in(conn):
    y = (ROOT / "semantic_model" / "snowflake" / "tests" / "dax_context.ossie.yaml").read_text(encoding="utf-8")
    target = FQ
    cur = conn.cursor()
    try:
        r = cur.execute("CALL SYSTEM$CREATE_SEMANTIC_VIEW_FROM_OSSIE_YAML(%s, %s)", (target, y)).fetchone()[0]
    except snowflake.connector.errors.ProgrammingError as e:
        r = "ERROR " + " ".join(str(e).split())
    (ROOT / "semantic_model" / "snowflake" / "tests" / "import_response.txt").write_text(r + "\n", encoding="utf-8")
    print(r)


def ossie_ext(conn):
    """Vendor extensions on import: the 0.1.1 test file with one extension at a time, imported into a scratch semantic
    view, read back (SYSTEM$READ_OSSIE_YAML + DESCRIBE), then dropped. -> tests/extensions_response.txt"""
    import copy
    import yaml
    base = yaml.safe_load((ROOT / "semantic_model" / "snowflake" / "tests" / "dax_context.ossie.yaml").read_text(encoding="utf-8"))
    name, cur, out = "OSSIE_EXT_TEST", conn.cursor(), []

    def ds(doc, n):
        return next(d for d in doc["datasets"] if d["name"] == n)

    def run(label, edit, check):
        doc = copy.deepcopy(base)
        doc["name"] = name
        for d in doc["datasets"]:
            d["source"] = d["source"].replace("DAX_CONTEXT_DEMO", SCHEMA)   # the test file's tables, now in DAX_DEMO.MODEL
        edit(doc)
        try:
            r = cur.execute("CALL SYSTEM$CREATE_SEMANTIC_VIEW_FROM_OSSIE_YAML(%s, %s)", (FQ, yaml.safe_dump(doc, sort_keys=False))).fetchone()[0]
            back = cur.execute(f"SELECT SYSTEM$READ_OSSIE_YAML_FROM_SEMANTIC_VIEW('{FQ}.{name}')").fetchone()[0]
            desc = [" ".join(str(x) for x in row) for row in cur.execute(f"DESCRIBE SEMANTIC VIEW {FQ}.{name}").fetchall()]
            out.append(f"{label}:\n  import: {r}\n  {check(back, desc)}")
        except snowflake.connector.errors.ProgrammingError as e:
            out.append(f"{label}:\n  import: ERROR {' '.join(str(e).split())}")
        finally:
            cur.execute(f"DROP SEMANTIC VIEW IF EXISTS {FQ}.{name}")

    run("SNOWFLAKE extension on a dataset, a table metric {metrics: [BUDGET_QTY_EXT]}",
        lambda d: ds(d, "fact_budget").__setitem__("custom_extensions", [{"vendor_name": "SNOWFLAKE", "data": json.dumps(
            {"metrics": [{"name": "BUDGET_QTY_EXT", "expr": "SUM(fact_budget.budget_qty)"}]})}]),
        lambda back, desc: "applied: DESCRIBE lists metric BUDGET_QTY_EXT" if any("BUDGET_QTY_EXT" in x for x in desc) else "not applied")
    run("SNOWFLAKE extension on a field, {access_modifier: private_access} on sales_qty",
        lambda d: next(f for f in ds(d, "fact_sales")["fields"] if f["name"] == "sales_qty").__setitem__(
            "custom_extensions", [{"vendor_name": "SNOWFLAKE", "data": json.dumps({"access_modifier": "private_access"})}]),
        lambda back, desc: ("kept in the export: " + str("private_access" in back) + "; applied: " +
                            str(not any("SALES_QTY" in x and "ACCESS_MODIFIER PUBLIC" in x for x in desc)) +
                            " (DESCRIBE: " + next((x for x in desc if "SALES_QTY" in x and "ACCESS_MODIFIER" in x), "") + ")"))
    run("POWER_BI extension on a metric, {formatString: #,##0}",
        lambda d: d["metrics"][0].__setitem__("custom_extensions", [{"vendor_name": "POWER_BI", "data": json.dumps({"formatString": "#,##0"})}]),
        lambda back, desc: "kept in the export: " + str("formatString" in back) + "; no warning")
    p = ROOT / "semantic_model" / "snowflake" / "tests" / "extensions_response.txt"
    p.write_text("SYSTEM$CREATE_SEMANTIC_VIEW_FROM_OSSIE_YAML with vendor extensions (tests/dax_context.ossie.yaml, one at a time):\n\n" +
                 "\n\n".join(out) + "\n", encoding="utf-8")
    print(p.read_text(encoding="utf-8"))


def ossie_reimport(conn):
    """Can Snowflake import its own Ossie export? tests/export_from_semantic_view.ossie.yaml, renamed, into a scratch view."""
    import yaml
    cur, name = conn.cursor(), "OSSIE_REIMPORT_TEST"
    doc = yaml.safe_load((ROOT / "semantic_model" / "snowflake" / "tests" / "export_from_semantic_view.ossie.yaml").read_text(encoding="utf-8"))
    doc["semantic_model"][0]["name"] = name
    try:
        r = cur.execute("CALL SYSTEM$CREATE_SEMANTIC_VIEW_FROM_OSSIE_YAML(%s, %s)", (FQ, yaml.safe_dump(doc, sort_keys=False))).fetchone()[0]
        q = cur.execute(f"SELECT * FROM SEMANTIC_VIEW({FQ}.{name} DIMENSIONS country METRICS country_total_allselected) ORDER BY 1").fetchall()
        out = f"{r}\nquery country_total_allselected by country: {q}"
    except snowflake.connector.errors.ProgrammingError as e:
        out = "ERROR " + " ".join(str(e).split())
    finally:
        cur.execute(f"DROP SEMANTIC VIEW IF EXISTS {FQ}.{name}")
    p = ROOT / "semantic_model" / "snowflake" / "tests" / "export_reimport_response.txt"
    p.write_text(out + "\n", encoding="utf-8")
    print(out)


LOD_INLINE = {  # model-level metrics of tests/dax_context.ossie.yaml, in the SNOWFLAKE dialect, the LOD inline
    "country_total_allselected": "AVG(SUM(fact_sales.sales_qty) EXCLUDE DIMENSIONS (dim_store.customer))",
    "country_total_fixed": "SUM(DISTINCT SUM(fact_sales.sales_qty) FIXED DIMENSIONS (dim_country.country, dim_calendar.year))",
}


def ossie_lod(conn):
    """Does the import take an LOD written inline in a model metric? tests/dax_context.ossie.yaml with LOD_INLINE,
    into a scratch view, queried as q09 asks (February 2021, without Tesco), then dropped."""
    import yaml
    cur, name = conn.cursor(), "LOD_INLINE_TEST"
    doc = yaml.safe_load((ROOT / "semantic_model" / "snowflake" / "tests" / "dax_context.ossie.yaml").read_text(encoding="utf-8"))
    for d in doc["datasets"]:
        d["source"] = d["source"].replace("DAX_CONTEXT_DEMO", SCHEMA)
    doc["name"] = name
    doc["metrics"] = [m for m in doc["metrics"] if m["name"] not in LOD_INLINE] + [
        {"name": n, "expression": {"dialects": [{"dialect": "SNOWFLAKE", "expression": e}]}} for n, e in LOD_INLINE.items()]
    out = ("SYSTEM$CREATE_SEMANTIC_VIEW_FROM_OSSIE_YAML, tests/dax_context.ossie.yaml (0.1.1) with two model metrics in the\n"
           "SNOWFLAKE dialect, the LOD inline (scratch view, dropped after):\n" +
           "".join(f"  {n}: {e}\n" for n, e in LOD_INLINE.items()))
    try:
        out += "import: " + cur.execute("CALL SYSTEM$CREATE_SEMANTIC_VIEW_FROM_OSSIE_YAML(%s, %s)", (FQ, yaml.safe_dump(doc, sort_keys=False))).fetchone()[0]
        q = cur.execute(f"SELECT * FROM SEMANTIC_VIEW({FQ}.{name} DIMENSIONS dim_country.country METRICS country_total_allselected, "
                        "country_total_fixed WHERE dim_calendar.month_start = DATE '2021-02-01' AND dim_store.customer <> 'Tesco') ORDER BY 1").fetchall()
        out += f"\nquery by country, February 2021 without Tesco (country_total_allselected, country_total_fixed): {q}"
    except snowflake.connector.errors.ProgrammingError as e:
        out += "ERROR " + " ".join(str(e).split())
    finally:
        cur.execute(f"DROP SEMANTIC VIEW IF EXISTS {FQ}.{name}")
    p = ROOT / "semantic_model" / "snowflake" / "tests" / "lod_inline_via_ossie_response.txt"
    p.write_text(out + "\n", encoding="utf-8")
    print(out)


def ossie_sql(conn):
    """Does the import take Ossie's own SQL? The 0.1.1 test file (every expression in ANSI_SQL) and the baseline in
    0.3.0.dev0 (SQL and DAX), each imported into a scratch view, queried, then dropped. -> tests/ossie_sql_response.txt"""
    import yaml
    name, cur, out = "OSSIE_SQL_TEST", conn.cursor(), []
    t011 = yaml.safe_load((ROOT / "semantic_model" / "snowflake" / "tests" / "dax_context.ossie.yaml").read_text(encoding="utf-8"))
    for d in t011["datasets"]:
        d["source"] = d["source"].replace("DAX_CONTEXT_DEMO", SCHEMA)
    base = yaml.safe_load((ROOT / "semantic_model" / "a_baseline" / "model.ossie.yaml").read_text(encoding="utf-8"))
    for d in base["datasets"]:
        d["source"] = f"{FQ}.{d['source'].upper()}"
    for label, doc in [(f"{t011['version']}, every expression in the ANSI_SQL dialect", t011),
                       (f"{base['version']}, the baseline as it is (4 measures in expression.sql, 12 in the DAX dialect)", base)]:
        doc["name"] = name
        line = f"{label}:\n  import: "
        try:
            line += cur.execute("CALL SYSTEM$CREATE_SEMANTIC_VIEW_FROM_OSSIE_YAML(%s, %s)", (FQ, yaml.safe_dump(doc, sort_keys=False))).fetchone()[0]
            q = cur.execute(f"SELECT * FROM SEMANTIC_VIEW({FQ}.{name} METRICS sales_quantity)").fetchall()
            line += f"\n  query sales_quantity: {q}"
        except snowflake.connector.errors.ProgrammingError as e:
            line += "ERROR " + " ".join(str(e).split())[:800]
        finally:
            cur.execute(f"DROP SEMANTIC VIEW IF EXISTS {FQ}.{name}")
        out.append(line)
    p = ROOT / "semantic_model" / "snowflake" / "tests" / "ossie_sql_response.txt"
    p.write_text("SYSTEM$CREATE_SEMANTIC_VIEW_FROM_OSSIE_YAML of Ossie in its own SQL (scratch view, dropped after):\n\n" +
                 "\n\n".join(out) + "\n", encoding="utf-8")
    print(p.read_text(encoding="utf-8"))


def main(argv):
    if not argv:
        print(__doc__)
        return
    conn = connect()
    for cmd in argv:
        {"setup": setup, "orphans": orphans, "view": view, "export": export, "ossie-out": ossie_out, "ossie-in": ossie_in, "ossie-ext": ossie_ext, "ossie-sql": ossie_sql, "ossie-reimport": ossie_reimport, "ossie-lod": ossie_lod}[cmd](conn)


if __name__ == "__main__":
    main(sys.argv[1:])
