-- Last year from the shifted fact's view (as q05), joined by the query; a missing side counts as 0, as DAX reads a blank.
WITH cur AS (
    SELECT year, AGG(sales_quantity) AS sales_quantity FROM databricks_ne.ossie_demo.sales_mv GROUP BY ALL
), ly AS (
    SELECT year, AGG(sales_qty_ly) AS sales_qty_ly FROM databricks_ne.ossie_demo.sales_ly_mv GROUP BY ALL
)
SELECT COALESCE(cur.year, ly.year) AS year, cur.sales_quantity, ly.sales_qty_ly,
       COALESCE(cur.sales_quantity, 0) - COALESCE(ly.sales_qty_ly, 0) AS sales_qty_growth
FROM cur FULL OUTER JOIN ly ON cur.year = ly.year
ORDER BY year