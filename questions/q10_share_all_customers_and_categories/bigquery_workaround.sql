-- All customers and categories: a second GRAPH_EXPAND without the customer and category filters.
WITH cur AS (
    SELECT country_country AS country, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_year = 2021 AND product_brand IN ('Tide', 'Dove')
      AND category_category = 'Laundry' AND store_customer <> 'Tesco'
    GROUP BY ALL
), every_customer_category AS (
    SELECT country_country AS country, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_year = 2021 AND product_brand IN ('Tide', 'Dove')
    GROUP BY ALL
)
SELECT cur.country, cur.q AS sales_quantity, cur.q / a.q AS cust_cat_share_all
FROM cur JOIN every_customer_category AS a USING (country)
ORDER BY country
