-- The reference answer: plain SQL over data/*.parquet (DuckDB).
-- Last year of a month is the whole same month one year earlier (February 2020 with its 29 days).
WITH m AS (
    SELECT c.month_start, SUM(f.sales_qty) AS qty
    FROM 'data/fact_sales.parquet' f JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key
    GROUP BY ALL
), r AS (
    SELECT cur.month_start, cur.qty AS sales_quantity, ly.qty AS sales_qty_ly
    FROM m cur LEFT JOIN m ly ON ly.month_start = cur.month_start - INTERVAL 1 YEAR
    WHERE cur.month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'
)
SELECT month_start, SUM(sales_quantity) AS sales_quantity, SUM(sales_qty_ly) AS sales_qty_ly,
       (SUM(sales_quantity) - SUM(sales_qty_ly)) / SUM(sales_qty_ly) AS sales_qty_yoy_pct
FROM r
GROUP BY ROLLUP (month_start)
ORDER BY month_start NULLS LAST
