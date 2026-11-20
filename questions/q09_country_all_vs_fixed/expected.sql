-- The reference answer: plain SQL over data/*.parquet (DuckDB).
-- Three numbers per country: February without Tesco; February, every customer; the whole of 2021, every customer.
WITH r AS (
    SELECT s.country,
           SUM(f.sales_qty) FILTER (WHERE c.month_start = DATE '2021-02-01' AND s.customer <> 'Tesco') AS sales_quantity,
           SUM(f.sales_qty) FILTER (WHERE c.month_start = DATE '2021-02-01') AS country_qty_all_customers,
           SUM(f.sales_qty) AS country_total_fixed
    FROM 'data/fact_sales.parquet' f
    JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key
    JOIN 'data/dim_product.parquet' p ON f.product_id = p.product_id
    JOIN 'data/dim_store.parquet' s ON f.store_id = s.store_id
    WHERE c.year = 2021
    GROUP BY ALL
)
SELECT country, SUM(sales_quantity) AS sales_quantity, SUM(country_qty_all_customers) AS country_qty_all_customers,
       SUM(country_total_fixed) AS country_total_fixed
FROM r
GROUP BY ROLLUP (country)
ORDER BY country NULLS LAST
