SELECT date_key, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly
FROM databricks_ne.ossie_demo.sales_mv
WHERE date_key BETWEEN DATE '2021-02-25' AND DATE '2021-03-03'
GROUP BY ALL
ORDER BY date_key
