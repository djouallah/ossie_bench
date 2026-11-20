-- Last year as rows: sales_ly_mv is the fact with its date moved one year forward. Two views, joined by the query.
WITH cur AS (
    SELECT year, AGG(sales_quantity) AS sales_quantity FROM databricks_ne.ossie_demo.sales_mv WHERE year <= 2022 GROUP BY ROLLUP (year)
), ly AS (
    SELECT year, AGG(sales_qty_ly) AS sales_qty_ly FROM databricks_ne.ossie_demo.sales_ly_mv WHERE year <= 2022 GROUP BY ROLLUP (year)
)
SELECT COALESCE(cur.year, ly.year) AS year, cur.sales_quantity, ly.sales_qty_ly, (cur.sales_quantity - ly.sales_qty_ly) / ly.sales_qty_ly AS sales_qty_yoy_pct
FROM cur FULL OUTER JOIN ly ON cur.year <=> ly.year
ORDER BY year NULLS LAST
