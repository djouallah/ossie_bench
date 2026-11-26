# ossie_bench: one semantic model, in Ossie and on four platforms

One model, with two facts at two grains (daily sales, monthly budget), written once in Apache Ossie and built natively
on Power BI / Fabric, Snowflake, Databricks and BigQuery, then asked the same 15 questions on each ([questions/](questions/)).
The Ossie file itself is answered by [dax-sql](https://github.com/djouallah/dax-sql), a toy compiler, fully AI generated
and only a proof of concept, since Ossie is a specification and has no engine of its own.

**The Ossie file is a proof of concept. No platform imports it.** It is written against `0.3.0.dev0`, the unreleased
version on main, and 12 of its 16 measures are written in DAX, because we could not express them any other way yet:
Ossie's SQL has no form for them. Fabric reads no Ossie SQL measures, in any version (and refuses this one,
`OSSIE_VERSION_MISMATCH`). Snowflake reads `0.1.1` only, and no DAX. Databricks and BigQuery have no Ossie import.
dax-sql is the only tool that reads it. Each platform's model is built natively, Fabric's from a separate Ossie file
rewritten for it.

Every platform can reach every answer. What differs is how much has to be added to the model, or moved into the
query, to get there.

**[The dashboard](https://djouallah.github.io/ossie_bench/)** has three tabs:
- **Ossie open spec:** the baseline file as a graph, its 16 metrics, and what the standard covers today.
- **Implementations:** Power BI, Snowflake, Databricks, BigQuery and dax-sql, each with its model, how it answers
  (drill-across: group each table on its own, then merge) and a worked example.
- **Results:** every query and answer beside the reference, and the grid of statuses.

In the top bar, **Industry support** shows what each platform does with an Ossie file: import, export, and this
repo's file. **About** is next to it.

This is not a benchmark. It is an educational repo about semantic modeling. All the models were built with AI. I
know Power BI well. Any mistake is still mine. A personal project: the views are mine, not my employer's, and
nothing here is endorsed by Microsoft, Snowflake, Databricks, Google or the Apache Software Foundation. dax-sql was
started by N.S. Devaraj and I work on it. Its code is fully AI generated and it is just a proof of concept: not a
product, and not Ossie's.

## The model ([semantic_model/](semantic_model/))

| | Format | |
|---|---|---|
| [a_baseline](semantic_model/a_baseline/) | Ossie: portable SQL, and the DAX dialect | The model without a vendor: [model.ossie.yaml](semantic_model/a_baseline/model.ossie.yaml) has 7 tables, 8 relationships and all 16 measures. The 4 the standard can express are in its SQL (three sums over one table, and one ratio across the two facts); the other 12 need evaluation controls, which the standard defers, so they are in the DAX dialect. It follows the unreleased development version on main, `0.3.0.dev0`, and passes Ossie's validator. [measures.md](semantic_model/a_baseline/measures.md) defines all 16 in words. dax-sql answers from this file as it is. |
| [fabric](semantic_model/fabric/) | Ossie with the DAX dialect | Not the baseline: a rewrite of it in `0.2.0.dev0`, the version Fabric reads, with all 16 measures in DAX, since Fabric ignores Ossie's SQL measures, even in `0.2.0.dev0` ([ossie_sql_response.txt](semantic_model/fabric/ossie_sql_response.txt)). Fabric's Publish compiles this file into a Direct Lake model: 0 errors, 0 warnings. The baseline itself is also refused for its version. One extension, the measures' format strings (`POWER_BI`), which Publish drops without a warning. |
| [snowflake](semantic_model/snowflake/) | SQL (semantic view DDL) | Written as DDL, as in the Snowflake notebook it comes from, with the LOD inline in its metrics. Its Ossie import reads 0.1.1, the released version, and takes an inline LOD in a model metric (SNOWFLAKE dialect), but not one as a field. It can't re-import its own Ossie export ([tests/](semantic_model/snowflake/tests/)). |
| [dbx](semantic_model/dbx/) | Metric view YAML | Databricks has no Ossie import. A metric view has one source, so the model is a set of views. |
| [bigquery](semantic_model/bigquery/) | Property graph DDL | One property graph: the 7 tables as nodes, the 8 relationships as edges, and the 3 sums as measures, each on its table (`MEASURE`, GA in November 2026). A measure can't shift dates, hold a window, ignore a filter or read another table's measure, so the other 13 are written in the query. No Ossie import found. |

## How an answer is judged

The reference is dax-sql: each question's `daxsql.sql` on the Ossie baseline as it is, compiled to DuckDB SQL. Every
other platform's answer is compared with it and gets a status in `results.csv`: `match`, `differs` (an answer, no
error, other numbers or rows), `partial` or `refused`.

## What it took ([full grid](questions/README.md))

| | Power BI | Snowflake | Databricks | BigQuery | dax-sql (Ossie) |
|---|---|---|---|---|---|
| Models | 1 | 1 semantic view | 5 metric views (sales, sales last year, budget, a bridge over both facts, calendar) | 1 property graph | 1 Ossie file, the baseline |
| Tables | 7 | 16 logical over 9 physical: 5 copies of the fact, copies of store and product, 2 helper tables | one source per view | 7 node tables, 8 edges | 7 |
| Measures | 16 | 19 (6 with an LOD inline) | 20 across 4 views (9 with window specs) | 3 (the sums) | 16: 4 SQL, 12 DAX |
| Plain query matches the reference | 15 of 15 | 12 of 15 | 6 of 15 | 2 of 15 | the reference |
| Matches after more model or query logic | 15 of 15 | 15 of 15 | 15 of 15 | 15 of 15 | the reference |

- **Power BI:** the 7 tables and 16 measures, nothing added; one query per question.
- **dax-sql:** the Ossie file as it is, one SQL query per question (`SELECT ... AGG(measure) FROM model`), totals by
  `ROLLUP`. The DAX measures are compiled to DuckDB SQL with their filter context.
- **Snowflake:** one view, with copies of the fact for last year, last fiscal year and two of the denominators. The LOD
  is inline in each metric; the copies stay, because an LOD needs one join path to the calendar, and DAX `ALL` drops one
  filter where an LOD keeps them all or drops them all ([tests/inline_lod_response.txt](semantic_model/snowflake/tests/inline_lod_response.txt)).
  Total rows are a second query, because ROLLUP isn't allowed in a semantic query. One answer differs until
  another copy is added: last year by day, on Feb 28 (q03).
- **Databricks:** "last year" is a window measure tied to one grain. Asked at another grain it returns a number
  with no error, and the number is wrong (q04 to q07). A measure per grain fixes the rows but not the total; a
  second view of the shifted fact, joined in the query, fixes both. Two facts, or a count on the calendar, are
  also joins between views in the query; q12, which needs both, joins three.
- **BigQuery:** a query is `SELECT ... AGG(measure) FROM GRAPH_EXPAND(graph, start_node => root)`: it starts from one
  table and follows the edges to the one side, like a metric view's source. This model's measures are the 3 sums (a
  measure can't shift dates, hold a window or ignore a filter), so the plain query answers the 2 questions that are
  sums and part of 10 others; from sales, the budget and the calendar's 2023 are out of reach (q11 to q14).
  Everything else is another `GRAPH_EXPAND` (a year back, without a filter, from another root), joined in the query;
  ROLLUP is refused with `AGG`, so totals are a second query.

## Rebuild
```
python tools/sf.py setup export          # Snowflake data (Iceberg) + semantic view; data/*.parquet for the others
python tools/fabric.py load publish      # Fabric: the Ossie file with the DAX dialect, published by Fabric
python tools/dbx.py load deploy
python tools/bq.py load graph            # BigQuery: data/*.parquet -> ossie_bench, then the property graph
npm ci --prefix tools/daxsql             # dax-sql, from registry.npmjs.org (needs Node 18+)
python tools/run_questions.py            # every question: the reference (dax-sql), then every platform
python tools/run_questions.py --only=fabric   # one platform; the others' answers are kept and re-judged
python tools/build_dashboard.py          # questions/ -> docs/data.js, the data of the dashboard (docs/index.html)
```
`setup` generates the data from the original Snowflake notebook (`dax_context_demo.ipynb`), which is not in this
repo; `view` re-creates only the semantic view on existing tables.
Credentials: Snowflake `~/.snowflake/config.toml`, Databricks `~/.databrickscfg` (`analyst`), Fabric `az login`,
BigQuery `gcloud auth application-default login` (project in `BIGQUERY_PROJECT`).
