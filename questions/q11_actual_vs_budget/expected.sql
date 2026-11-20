-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.
-- Each fact is summed at its own grain, then the two are joined on what they share.
WITH a AS (
    SELECT s.country, p.category, SUM(f.sales_qty) AS sales_quantity
    FROM 'data/fact_sales.parquet' f
    JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key
    JOIN 'data/dim_product.parquet' p ON f.product_id = p.product_id
    JOIN 'data/dim_store.parquet' s ON f.store_id = s.store_id
    WHERE c.year = 2021
    GROUP BY ALL
), b AS (
    SELECT country, category, SUM(budget_qty) AS budget_quantity
    FROM 'data/fact_budget.parquet'
    WHERE YEAR(month_start) = 2021
    GROUP BY ALL
)
SELECT country, category, a.sales_quantity, b.budget_quantity,
       (a.sales_quantity - b.budget_quantity) / b.budget_quantity AS sales_vs_budget_pct
FROM a FULL OUTER JOIN b USING (country, category)
ORDER BY country, category
