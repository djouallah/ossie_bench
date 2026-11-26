SELECT dim_category.category, AGG(budget_quantity) AS budget_quantity
FROM model
WHERE dim_calendar.year = 2022 AND dim_category.category <> 'Laundry'
GROUP BY ALL
ORDER BY category