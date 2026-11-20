SELECT country, category, AGG(sales_quantity) AS sales_quantity, AGG(budget_quantity) AS budget_quantity,
       AGG(sales_vs_budget_pct) AS sales_vs_budget_pct
FROM DAX_DEMO.MODEL.SEMANTIC_VIEW
WHERE year = 2021
GROUP BY ALL
ORDER BY country, category
