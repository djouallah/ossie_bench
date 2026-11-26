# Actual vs budget, by country and category, 2021

Two facts at two grains: sales (day x store x product) and budget (month x country x category), through the
dimensions they share.

- Power BI and Snowflake: one model holds both facts; one query.
- Databricks: a metric view has one source fact, so `dbx.sql` queries the sales view and the budget view and joins them.
  `dbx_workaround.sql` uses a bridge view over both facts.
- BigQuery: a query has one root, and from sales the budget is out of reach. `bigquery_workaround.sql` adds a second
  `GRAPH_EXPAND` from the budget, joined in the query (the docs' pattern).
