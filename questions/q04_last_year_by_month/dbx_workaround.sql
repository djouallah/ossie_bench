-- Last year as rows: sales_ly_mv is the fact with its date moved one year forward. Two views, joined by the query.
WITH cur AS (
    SELECT month_start, AGG(sales_quantity) AS sales_quantity FROM databricks_ne.ossie_demo.sales_mv WHERE month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01' GROUP BY ROLLUP (month_start)
), ly AS (
    SELECT month_start, AGG(sales_qty_ly) AS sales_qty_ly FROM databricks_ne.ossie_demo.sales_ly_mv WHERE month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01' GROUP BY ROLLUP (month_start)
)
SELECT COALESCE(cur.month_start, ly.month_start) AS month_start, cur.sales_quantity, ly.sales_qty_ly, (cur.sales_quantity - ly.sales_qty_ly) / ly.sales_qty_ly AS sales_qty_yoy_pct
FROM cur FULL OUTER JOIN ly ON cur.month_start <=> ly.month_start
ORDER BY month_start NULLS LAST
