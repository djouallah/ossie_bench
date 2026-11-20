-- The reference answer: plain SQL over data/*.parquet (DuckDB).
-- Each number is summed on its own, by category; the percentages are computed after, so the total row is right.
WITH s AS (
    SELECT p.category,
           SUM(f.sales_qty) FILTER (WHERE YEAR(f.sale_date) = 2021) AS sales_quantity,
           SUM(f.sales_qty) FILTER (WHERE YEAR(f.sale_date) = 2020) AS sales_qty_ly
    FROM 'data/fact_sales.parquet' f JOIN 'data/dim_product.parquet' p ON f.product_id = p.product_id
    GROUP BY ALL
), b AS (
    SELECT category, SUM(budget_qty) AS budget_quantity
    FROM 'data/fact_budget.parquet'
    WHERE YEAR(month_start) = 2021
    GROUP BY ALL
)
SELECT category, SUM(sales_quantity) AS sales_quantity, SUM(budget_quantity) AS budget_quantity,
       (SUM(sales_quantity) - SUM(budget_quantity)) / SUM(budget_quantity) AS sales_vs_budget_pct,
       SUM(sales_qty_ly) AS sales_qty_ly,
       (SUM(sales_quantity) - SUM(sales_qty_ly)) / SUM(sales_qty_ly) AS sales_qty_yoy_pct
FROM s JOIN b USING (category)
GROUP BY ROLLUP (category)
ORDER BY category NULLS LAST
