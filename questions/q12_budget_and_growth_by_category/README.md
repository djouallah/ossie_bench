# Actual vs budget and growth on last year, by category, 2021, with a total

Three things in one answer: sales against the budget (two facts at two grains), sales against last year (a shift in
time), and a total row where both percentages are recomputed from the totals, not summed or averaged.

- Power BI and Snowflake: the five measures are in the one model; Snowflake's total row is a second query.
- Databricks: budget and last year live in other metric views. `dbx.sql` joins the sales and budget views and uses the
  window measure for last year; `dbx_workaround.sql` joins three views (sales, sales last year, budget).
