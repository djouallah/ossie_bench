-- The reference answer: plain SQL over data/*.parquet (DuckDB).
-- The total of last year is the sum of the rows above it (2019 has no sales, so 2020 + 2021).
WITH y AS (
    SELECT c.year, SUM(f.sales_qty) AS qty
    FROM 'data/fact_sales.parquet' f JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key
    GROUP BY ALL
), r AS (
    SELECT cur.year, cur.qty AS sales_quantity, ly.qty AS sales_qty_ly
    FROM y cur LEFT JOIN y ly ON ly.year = cur.year - 1
    WHERE cur.year <= 2022
)
SELECT year, SUM(sales_quantity) AS sales_quantity, SUM(sales_qty_ly) AS sales_qty_ly,
       (SUM(sales_quantity) - SUM(sales_qty_ly)) / SUM(sales_qty_ly) AS sales_qty_yoy_pct
FROM r
GROUP BY ROLLUP (year)
ORDER BY year NULLS LAST
