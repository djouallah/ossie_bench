SELECT year, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly,
       AGG(sales_quantity) - AGG(sales_qty_ly) AS sales_qty_growth
FROM databricks_ne.ossie_demo.sales_mv
GROUP BY ALL
ORDER BY year