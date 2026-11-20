SELECT month_start, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly,
       AGG(sales_qty_yoy_pct) AS sales_qty_yoy_pct
FROM databricks_ne.ossie_demo.sales_mv
WHERE month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'
GROUP BY ROLLUP (month_start)
ORDER BY month_start NULLS LAST
