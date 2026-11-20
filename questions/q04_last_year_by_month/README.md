# Sales vs last year, by month (Jan - Apr 2021), with a total

The same "last year" measure as q03, asked by month. A semantic layer should give each month's last-year total.

- Total row: DAX `ROLLUPADDISSUBTOTAL`; Databricks `GROUP BY ROLLUP`; Snowflake refuses ROLLUP in a semantic query
  ("GROUPING SETS/CUBE/ROLLUP is not supported within semantic query blocks"), so its total is a second query.

- Databricks: the day-grain window measure returns one day's value per month, with no error. `dbx_per_grain.sql` uses a
  second measure ordered by month: the months match, the total repeats the last month. `dbx_workaround.sql` uses a
  second view of the fact with its date moved a year, joined in the query: it matches.
