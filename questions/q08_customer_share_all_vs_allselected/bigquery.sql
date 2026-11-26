-- No measure ignores a filter (ALL) or reads the rows shown (ALLSELECTED).
SELECT country_country AS country, store_customer AS customer, AGG(sales_sales_quantity) AS sales_quantity
FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
WHERE store_customer NOT IN ('Zabka', 'Rewe', 'Superdrug')
  AND calendar_month_start = DATE '2021-02-01'
  AND product_brand <> 'Somat'
GROUP BY ALL
ORDER BY country, customer
