-- A second "last year" measure, ordered by month_start (offset -12 month): one measure per grain.
-- The months are right; the total row repeats the last month's value (a window measure keeps the last period).
SELECT month_start, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly_month) AS sales_qty_ly,
       (AGG(sales_quantity) - AGG(sales_qty_ly_month)) / AGG(sales_qty_ly_month) AS sales_qty_yoy_pct
FROM databricks_ne.ossie_demo.sales_mv
WHERE month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'
GROUP BY ROLLUP (month_start)
ORDER BY month_start NULLS LAST
