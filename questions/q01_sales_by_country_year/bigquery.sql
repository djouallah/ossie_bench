SELECT country_country AS country, calendar_year AS year, AGG(sales_sales_quantity) AS sales_quantity
FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
WHERE calendar_year <= 2022
GROUP BY ALL
ORDER BY country, year
