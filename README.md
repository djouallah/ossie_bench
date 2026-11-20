# One semantic model, three platforms

One model, with two facts at two grains (daily sales, monthly budget), built natively on Power BI / Fabric, Snowflake
and Databricks, then asked the same 13 questions on each ([questions/](questions/)).

Every platform can reach every answer. What differs is how much has to be added to the model, or moved into the
query, to get there.

**[The dashboard](https://djouallah.github.io/semantic_models/)** explains how each model works, through
drill-across (group each table on its own, then merge), and shows every query and answer beside the reference.

## The model ([semantic_model/](semantic_model/))

| | Format | |
|---|---|---|
| [a_baseline](semantic_model/a_baseline/) | Standard Ossie (portable SQL) + definitions | The model without a vendor: [model.ossie.yaml](semantic_model/a_baseline/model.ossie.yaml) has 7 tables, 8 relationships and the 4 measures the standard can express (three sums over one table, and one ratio across the two facts). It follows the unreleased development version, `0.3.0.dev0`. [measures.md](semantic_model/a_baseline/measures.md) defines all 16 in words; the other 12 have no standard syntax yet. |
| [fabric](semantic_model/fabric/) | Ossie + DAX dialect | The baseline with the 16 measures in DAX. Fabric's Publish compiles the file into a Direct Lake model: 0 errors, 0 warnings. One extension, the measures' format strings (`POWER_BI`), which Publish drops without a warning. |
| [snowflake](semantic_model/snowflake/) | SQL (semantic view DDL) | Its Ossie import takes only 0.1.1 and doesn't accept Snowflake's own dialect (`FIXED` / `EXCLUDE DIMENSIONS`), so the view is written as DDL. It can't re-import its own Ossie export ([tests/](semantic_model/snowflake/tests/)). |
| [dbx](semantic_model/dbx/) | Metric view YAML | Databricks has no Ossie import. A metric view has one source, so the model is a set of views. |

## How an answer is judged

Each question has an `expected.sql`: plain SQL over the tables, run on DuckDB. No vendor owns it. Every platform's
answer is compared with it and gets a status in `results.csv`: `match`, `differs` (an answer, no error, other
numbers or rows), `partial` or `refused`.

## What it took ([full grid](questions/README.md))

| | Power BI | Snowflake | Databricks |
|---|---|---|---|
| Models | 1 | 1 semantic view | 5 metric views (sales, sales last year, budget, a bridge over both facts, calendar) |
| Tables | 7 | 16 logical over 9 physical: 5 copies of the fact, copies of store and product, 2 helper tables | one source per view |
| Measures | 16 | 19 (6 over LOD facts) | 20 across 4 views (9 with window specs) |
| Plain query matches the reference | 13 of 13 | 12 of 13 | 6 of 13 |
| Matches after more model or query logic | 13 of 13 | 13 of 13 | 13 of 13 |

- **Power BI:** the 7 tables and 16 measures, nothing added; one query per question.
- **Snowflake:** one view, with copies of the fact for last year, last fiscal year and two of the denominators.
  Total rows are a second query, because ROLLUP isn't allowed in a semantic query. One answer differs until
  another copy is added: last year by day, on Feb 28 (q03).
- **Databricks:** "last year" is a window measure tied to one grain. Asked at another grain it returns a number
  with no error, and the number is wrong (q04 to q07). A measure per grain fixes the rows but not the total; a
  second view of the shifted fact, joined in the query, fixes both. Two facts, or a count on the calendar, are
  also joins between views in the query; q12, which needs both, joins three.

## Rebuild
```
python tools/sf.py setup export          # Snowflake data (Iceberg) + semantic view; data/*.parquet for the others
python tools/fabric.py load publish      # Fabric: the Ossie + DAX file, published by Fabric
python tools/dbx.py load deploy
python tools/run_questions.py            # every question: the reference on DuckDB, then every platform
python tools/build_dashboard.py          # questions/ -> docs/data.js, the data of the dashboard (docs/index.html)
```
`setup` generates the data from the original Snowflake notebook (`dax_context_demo.ipynb`), which is not in this
repo; `view` re-creates only the semantic view on existing tables.
Credentials: Snowflake `~/.snowflake/config.toml`, Databricks `~/.databrickscfg` (`analyst`), Fabric `az login`.
