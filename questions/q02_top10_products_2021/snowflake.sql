SELECT product_name, AGG(sales_quantity) AS sales_quantity
FROM DAX_DEMO.MODEL.SEMANTIC_VIEW
WHERE year = 2021
GROUP BY ALL
ORDER BY sales_quantity DESC
LIMIT 10
