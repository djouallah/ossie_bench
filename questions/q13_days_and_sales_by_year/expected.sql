-- The reference answer: plain SQL over data/*.parquet (DuckDB).
-- The calendar is counted on its own, then sales are joined to it.
SELECT c.year, COUNT(*) AS day_count, SUM(d.qty) AS sales_quantity
FROM 'data/dim_calendar.parquet' c
LEFT JOIN (SELECT sale_date, SUM(sales_qty) AS qty FROM 'data/fact_sales.parquet' GROUP BY ALL) d
       ON d.sale_date = c.date_key
GROUP BY ALL
ORDER BY c.year
