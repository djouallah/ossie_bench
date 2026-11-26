-- From sales, the calendar is reached only through sales rows.
SELECT calendar_year AS year, COUNT(DISTINCT calendar_date_key) AS day_count, AGG(sales_sales_quantity) AS sales_quantity
FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
GROUP BY ALL
ORDER BY year
