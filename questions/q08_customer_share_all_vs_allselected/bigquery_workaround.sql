-- All customers: a second GRAPH_EXPAND without the customer filter. The customers shown: a window in the query.
WITH cur AS (
    SELECT country_country AS country, store_customer AS customer, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE store_customer NOT IN ('Zabka', 'Rewe', 'Superdrug')
      AND calendar_month_start = DATE '2021-02-01' AND product_brand <> 'Somat'
    GROUP BY ALL
), every_customer AS (
    SELECT country_country AS country, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_month_start = DATE '2021-02-01' AND product_brand <> 'Somat'
    GROUP BY ALL
)
SELECT cur.country, cur.customer, cur.q AS sales_quantity,
       cur.q / a.q AS customer_share_all,
       cur.q / SUM(cur.q) OVER (PARTITION BY cur.country) AS customer_share_allselected
FROM cur JOIN every_customer AS a USING (country)
ORDER BY country, customer
