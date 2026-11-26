SELECT category, AGG(budget_quantity) AS budget_quantity
FROM DAX_DEMO.MODEL.SEMANTIC_VIEW
WHERE year = 2022 AND category <> 'Laundry'
GROUP BY ALL
ORDER BY category