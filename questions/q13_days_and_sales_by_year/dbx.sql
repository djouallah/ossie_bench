SELECT year, COUNT(DISTINCT date_key) AS day_count, AGG(sales_quantity) AS sales_quantity
FROM databricks_ne.ossie_demo.sales_mv
GROUP BY ALL
ORDER BY year
