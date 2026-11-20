-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.
SELECT s.country, c.year, SUM(f.sales_qty) AS sales_quantity
FROM 'data/fact_sales.parquet' f
    JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key
    JOIN 'data/dim_product.parquet' p ON f.product_id = p.product_id
    JOIN 'data/dim_store.parquet' s ON f.store_id = s.store_id
WHERE c.year <= 2022
GROUP BY ALL
ORDER BY country, year
