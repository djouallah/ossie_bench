-- One query has one root: from sales, the budget is not reachable. A derived measure only reads its own table.
SELECT country_country AS country, category_category AS category, AGG(sales_sales_quantity) AS sales_quantity
FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
WHERE calendar_year = 2021
GROUP BY ALL
ORDER BY country, category
