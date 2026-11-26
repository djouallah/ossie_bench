# Growth on last year in units, by year (2020-2023): a measure minus a blank

`sales_quantity - sales_qty_ly`, written in the query. 2020 has no last year (the data starts in 2020) and 2023 has no
sales (they stop at 2022), so each end has one side blank.

DAX reads a blank as 0 in `+` and `-`: 2020's growth is all of its sales, 2023's is minus last year. SQL's NULL makes
the whole expression NULL: no growth either year. Neither is wrong; they are two languages. The reference, dax-sql, does
as DAX does, so a SQL engine matches only with `COALESCE`.

- Power BI: the expression in the DAX query.
- Snowflake: `AGG(a) - AGG(b)` in the semantic SQL; `snowflake_workaround.sql` wraps each side in `COALESCE(..., 0)`.
- Databricks: `dbx.sql` subtracts the window measure (wrong by year, as in q05, and NULL at both ends);
  `dbx_workaround.sql` joins the shifted fact's view (as q05) and uses `COALESCE`.
- BigQuery: no last-year measure, and from sales 2023 is missing. `bigquery_workaround.sql` takes the calendar as root,
  joins sales and sales a year back by year, and uses `COALESCE`.
