-- One metric view per fact, joined by the query on the shared dimensions.
WITH s AS (
    SELECT country, category, AGG(sales_quantity) AS sales_quantity
    FROM databricks_ne.ossie_demo.sales_mv
    WHERE year = 2021
    GROUP BY ALL
), b AS (
    SELECT country, category, AGG(budget_quantity) AS budget_quantity
    FROM databricks_ne.ossie_demo.budget_mv
    WHERE year = 2021
    GROUP BY ALL
)
SELECT COALESCE(s.country, b.country) AS country, COALESCE(s.category, b.category) AS category,
       s.sales_quantity, b.budget_quantity,
       (s.sales_quantity - b.budget_quantity) / NULLIF(b.budget_quantity, 0) AS sales_vs_budget_pct
FROM s FULL OUTER JOIN b ON s.country = b.country AND s.category = b.category
ORDER BY country, category
