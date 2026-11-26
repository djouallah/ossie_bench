SELECT dim_calendar.year, COUNT(dim_calendar.date_key) AS day_count, AGG(sales_quantity) AS sales_quantity
FROM model
GROUP BY ALL
ORDER BY year
