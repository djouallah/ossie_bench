SELECT country, year, AGG(sales_quantity) AS sales_quantity
FROM databricks_ne.ossie_demo.sales_mv
WHERE year <= 2022
GROUP BY ALL
ORDER BY country, year
