SELECT dim_country.country, dim_category.category,
       AGG(sales_quantity) AS sales_quantity,
       AGG(budget_quantity) AS budget_quantity,
       AGG(sales_vs_budget_pct) AS sales_vs_budget_pct
FROM model
WHERE dim_calendar.year = 2021
GROUP BY ALL
ORDER BY country, category
