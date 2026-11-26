SELECT category, AGG(budget_quantity) AS budget_quantity
FROM databricks_ne.ossie_demo.budget_mv
WHERE year = 2022 AND category <> 'Laundry'
GROUP BY ALL
ORDER BY category
