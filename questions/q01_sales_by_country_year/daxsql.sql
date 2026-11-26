SELECT dim_country.country, dim_calendar.year, AGG(sales_quantity) AS sales_quantity
FROM model
WHERE dim_calendar.year <= 2022
GROUP BY ALL
ORDER BY country, year
