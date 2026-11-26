SELECT product_product_name AS product_name, AGG(sales_sales_quantity) AS sales_quantity
FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
WHERE calendar_year = 2021
GROUP BY ALL
ORDER BY sales_quantity DESC
LIMIT 10
