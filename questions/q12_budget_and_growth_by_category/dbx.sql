-- Sales and last year from the sales view (last year is its window measure), budget from the budget view; joined here.
WITH s AS (
    SELECT category, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly
    FROM databricks_ne.ossie_demo.sales_mv
    WHERE year = 2021
    GROUP BY ROLLUP (category)
), b AS (
    SELECT category, AGG(budget_quantity) AS budget_quantity
    FROM databricks_ne.ossie_demo.budget_mv
    WHERE year = 2021
    GROUP BY ROLLUP (category)
)
SELECT s.category, s.sales_quantity, b.budget_quantity,
       (s.sales_quantity - b.budget_quantity) / b.budget_quantity AS sales_vs_budget_pct,
       s.sales_qty_ly, (s.sales_quantity - s.sales_qty_ly) / s.sales_qty_ly AS sales_qty_yoy_pct
FROM s JOIN b ON s.category <=> b.category
ORDER BY category NULLS LAST
