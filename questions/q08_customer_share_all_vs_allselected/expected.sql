-- The reference answer: plain SQL over data/*.parquet (DuckDB).
-- One row per customer that has sales under the filters. Two denominators per country: every customer of the
-- country (the filtered-out ones too), and only the customers shown.
WITH base AS (
    SELECT s.country, s.customer, SUM(f.sales_qty) AS qty
    FROM 'data/fact_sales.parquet' f
    JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key
    JOIN 'data/dim_product.parquet' p ON f.product_id = p.product_id
    JOIN 'data/dim_store.parquet' s ON f.store_id = s.store_id
    WHERE c.month_start = DATE '2021-02-01' AND p.brand <> 'Somat'
    GROUP BY ALL
), r AS (
    SELECT country, customer, qty AS sales_quantity,
           SUM(qty) OVER (PARTITION BY country) AS country_qty_all_customers,
           customer NOT IN ('Zabka', 'Rewe', 'Superdrug') AS shown
    FROM base
)
SELECT country, customer, sales_quantity,
       sales_quantity / country_qty_all_customers AS customer_share_all,
       sales_quantity / SUM(sales_quantity) OVER (PARTITION BY country) AS customer_share_allselected
FROM r
WHERE shown
ORDER BY country, customer
