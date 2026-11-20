-- The reference answer: plain SQL over data/*.parquet (DuckDB).
-- A 4-4-5 fiscal year is 52 weeks: last fiscal year of a day is the day 364 days earlier.
WITH day AS (
    SELECT sale_date, SUM(sales_qty) AS qty FROM 'data/fact_sales.parquet' GROUP BY ALL
)
SELECT c.fiscal_period_name, c.fiscal_period_start, SUM(cur.qty) AS sales_quantity, SUM(ly.qty) AS sales_qty_fly
FROM 'data/dim_calendar.parquet' c
LEFT JOIN day cur ON cur.sale_date = c.date_key
LEFT JOIN day ly ON ly.sale_date = c.date_key - INTERVAL 364 DAY
WHERE c.fiscal_period_start BETWEEN DATE '2021-01-25' AND DATE '2021-05-24'
GROUP BY ALL
ORDER BY c.fiscal_period_start
