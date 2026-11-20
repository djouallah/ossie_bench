SELECT product_name, AGG(sales_quantity) AS sales_quantity
FROM databricks_ne.ossie_demo.sales_mv
WHERE year = 2021
GROUP BY ALL
ORDER BY sales_quantity DESC
LIMIT 10
