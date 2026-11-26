# Sales vs last year, by day (Feb 25 - Mar 3, 2021)

Last year at the date grain. Watch Feb 28, 2021: 2020 was a leap year, so "last year" of Feb 28 is either
Feb 28, 2020 alone, or Feb 28 + Feb 29. The reference takes the first: the same calendar date one year earlier.

- DAX: `SAMEPERIODLASTYEAR` (shifts the date filter).
- Snowflake: `sales_qty_ly` sums `sales_ly`, a copy of the fact whose date key is moved forward one year, which puts
  Feb 29, 2020 on Feb 28, 2021. Another copy that drops Feb 29 (`sales_ly_day`) matches the reference.
- Databricks: a window on `date_key` with `offset: -1 year`.
- BigQuery: no last-year measure (a measure can't shift dates). `bigquery_workaround.sql` adds a second `GRAPH_EXPAND`
  over last year's days, joined on the date a year back, so Feb 29, 2020 drops out.
