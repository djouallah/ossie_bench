"""Snowflake plumbing: data, semantic view, Parquet export, Ossie in/out.

    python tools/sf.py setup       # the notebook's data + FACT_BUDGET as Iceberg tables, then
                                          #   semantic_model/snowflake/semantic_view.sql, in DAX_DEMO.MODEL
    python tools/sf.py view        # only semantic_model/snowflake/semantic_view.sql, on the existing tables
    python tools/sf.py export      # the tables -> data/<table>.parquet (what Fabric and Databricks load)
    python tools/sf.py ossie-out   # SYSTEM$READ_OSSIE_YAML_FROM_SEMANTIC_VIEW
                                          #   -> semantic_model/snowflake/tests/export_from_semantic_view.ossie.yaml
    python tools/sf.py ossie-in    # SYSTEM$CREATE_SEMANTIC_VIEW_FROM_OSSIE_YAML(semantic_model/snowflake/tests/dax_context.ossie.yaml)

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
    sv_sql = (ROOT / "semantic_model" / "snowflake" / "semantic_view.sql").read_text(encoding="utf-8")
    cur.execute(sv_sql.replace("{FQ}", FQ))
    cur.execute(f"SELECT (SELECT COUNT(*) FROM {FQ}.FACT_SALES), (SELECT COUNT(*) FROM {FQ}.FACT_BUDGET)")
    print("setup done, sales / budget rows:", cur.fetchone())



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


def main(argv):
    if not argv:
        print(__doc__)
        return
    conn = connect()
    for cmd in argv:
        {"setup": setup, "view": view, "export": export, "ossie-out": ossie_out, "ossie-in": ossie_in}[cmd](conn)


if __name__ == "__main__":
    main(sys.argv[1:])
