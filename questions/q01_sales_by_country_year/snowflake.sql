SELECT country, year, AGG(sales_quantity) AS sales_quantity
FROM DAX_DEMO.MODEL.SEMANTIC_VIEW
WHERE year <= 2022
GROUP BY ALL
ORDER BY country, year
