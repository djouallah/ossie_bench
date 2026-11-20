-- One metric view over both facts: the bridge (the shared keys as source, each fact a one_to_many join).
SELECT country, category, AGG(sales_quantity) AS sales_quantity, AGG(budget_quantity) AS budget_quantity,
       AGG(sales_vs_budget_pct) AS sales_vs_budget_pct
FROM databricks_ne.ossie_demo.bridge_mv
WHERE year = 2021
GROUP BY ALL
ORDER BY country, category
