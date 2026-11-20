-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.
-- Last year of a day is the same calendar date one year earlier, so Feb 29, 2020 belongs to no day of 2021.
WITH day AS (
    SELECT sale_date, SUM(sales_qty) AS qty FROM 'data/fact_sales.parquet' GROUP BY ALL
)
SELECT c.date_key, cur.qty AS sales_quantity, ly.qty AS sales_qty_ly
FROM 'data/dim_calendar.parquet' c
LEFT JOIN day cur ON cur.sale_date = c.date_key
LEFT JOIN day ly ON ly.sale_date = c.date_key - INTERVAL 1 YEAR
WHERE c.date_key BETWEEN DATE '2021-02-25' AND DATE '2021-03-03'
ORDER BY c.date_key
