"""BigQuery plumbing: the data, the property graph with its measures, SQL.

    python tools/bq.py load     # data/*.parquet -> tables in <project>.ossie_bench
    python tools/bq.py graph    # semantic_model/bigquery/graph.sql -> the property graph ossie_bench.sales_graph

Auth: application default credentials (`gcloud auth application-default login`). On this laptop gcloud lives in WSL,
so when GOOGLE_APPLICATION_CREDENTIALS is unset the WSL file is used. Project: BIGQUERY_PROJECT (the default is the author's).
The dataset is BIGQUERY_DATASET for the loader, but questions/*/bigquery*.sql name ossie_bench.sales_graph.
Commands chain: `load graph`.
"""
import os
import sys
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")
ROOT = Path(__file__).resolve().parents[1]
PROJECT = os.environ.get("BIGQUERY_PROJECT", "crested-disk-417104")
DATASET = os.environ.get("BIGQUERY_DATASET", "ossie_bench")
LOCATION = os.environ.get("BIGQUERY_LOCATION", "US")
TABLES = ["dim_calendar", "dim_product", "dim_category", "dim_store", "dim_country", "fact_sales", "fact_budget"]
WSL_ADC = r"\\wsl.localhost\Ubuntu-22.04\root\.config\gcloud\application_default_credentials.json"
_client = {}


def client():
    from google.cloud import bigquery
    if "c" not in _client:
        if not os.environ.get("GOOGLE_APPLICATION_CREDENTIALS") and os.path.exists(WSL_ADC):
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = WSL_ADC
        _client["c"] = bigquery.Client(project=PROJECT, location=LOCATION)
    return _client["c"]


def sql(statement):
    """(columns, rows) of one query. No cache: a cached GRAPH_EXPAND result is not invalidated when the graph changes."""
    from google.cloud import bigquery
    cfg = bigquery.QueryJobConfig(use_query_cache=False, default_dataset=f"{PROJECT}.{DATASET}")
    res = client().query(statement, job_config=cfg).result()
    return [f.name for f in res.schema], [list(r.values()) for r in res]


def load():
    from google.cloud import bigquery
    c = client()
    c.create_dataset(bigquery.Dataset(f"{PROJECT}.{DATASET}"), exists_ok=True)
    cfg = bigquery.LoadJobConfig(source_format=bigquery.SourceFormat.PARQUET,
                                 write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE)
    for t in TABLES:
        with open(ROOT / "data" / f"{t}.parquet", "rb") as fh:
            c.load_table_from_file(fh, f"{PROJECT}.{DATASET}.{t}", job_config=cfg).result()
        print(f"{t}: {c.get_table(f'{PROJECT}.{DATASET}.{t}').num_rows} rows")


def graph():
    text = (ROOT / "semantic_model" / "bigquery" / "graph.sql").read_text(encoding="utf-8")
    client().query(text.replace("{DS}", f"`{PROJECT}.{DATASET}`")).result()
    print(f"property graph {DATASET}.sales_graph created")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
    for cmd in sys.argv[1:]:
        {"load": load, "graph": graph}[cmd]()
