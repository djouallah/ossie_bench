-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.
-- The denominator drops the customer and category filters and keeps year and brand.
WITH r AS (
    SELECT s.country,
           SUM(f.sales_qty) FILTER (WHERE p.category = 'Laundry' AND s.customer <> 'Tesco') AS sales_quantity,
           SUM(f.sales_qty) AS country_qty_all_cust_cat
    FROM 'data/fact_sales.parquet' f
    JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key
    JOIN 'data/dim_product.parquet' p ON f.product_id = p.product_id
    JOIN 'data/dim_store.parquet' s ON f.store_id = s.store_id
    WHERE c.year = 2021 AND p.brand IN ('Tide', 'Dove')
    GROUP BY ALL
)
SELECT country, sales_quantity, sales_quantity / country_qty_all_cust_cat AS cust_cat_share_all
FROM r
ORDER BY country
