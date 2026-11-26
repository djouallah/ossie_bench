SELECT dim_product.product_name, AGG(sales_quantity) AS sales_quantity
FROM model
WHERE dim_calendar.year = 2021
GROUP BY ALL
ORDER BY sales_quantity DESC
LIMIT 10
