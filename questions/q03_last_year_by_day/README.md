# Sales vs last year, by day (Feb 25 - Mar 3, 2021)

Last year at the date grain. Watch Feb 28, 2021: 2020 was a leap year, so "last year" of Feb 28 is either
Feb 28, 2020 alone, or Feb 28 + Feb 29. The reference takes the first: the same calendar date one year earlier.

- DAX: `SAMEPERIODLASTYEAR` (shifts the date filter).
- Snowflake: `sales_qty_ly` is a second copy of the fact whose date key is moved forward one year, which puts
  Feb 29, 2020 on Feb 28, 2021. A second copy that drops Feb 29 matches the reference.
- Databricks: a window on `date_key` with `offset: -1 year`.
