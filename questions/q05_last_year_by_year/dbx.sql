SELECT year, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly,
       AGG(sales_qty_yoy_pct) AS sales_qty_yoy_pct
FROM databricks_ne.ossie_demo.sales_mv
WHERE year <= 2022
GROUP BY ROLLUP (year)
ORDER BY year NULLS LAST
