SELECT year, COUNT(date_key) AS day_count, AGG(sales_quantity) AS sales_quantity
FROM DAX_DEMO.MODEL.SEMANTIC_VIEW
GROUP BY ALL
ORDER BY year
