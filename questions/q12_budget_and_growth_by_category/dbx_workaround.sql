-- Three metric views, joined by the query: sales, the fact with its date moved one year (last year), and budget.
WITH s AS (
    SELECT category, AGG(sales_quantity) AS sales_quantity
    FROM databricks_ne.ossie_demo.sales_mv
    WHERE year = 2021
    GROUP BY ROLLUP (category)
), ly AS (
    SELECT category, AGG(sales_qty_ly) AS sales_qty_ly
    FROM databricks_ne.ossie_demo.sales_ly_mv
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
       ly.sales_qty_ly, (s.sales_quantity - ly.sales_qty_ly) / ly.sales_qty_ly AS sales_qty_yoy_pct
FROM s JOIN ly ON s.category <=> ly.category JOIN b ON s.category <=> b.category
ORDER BY category NULLS LAST
