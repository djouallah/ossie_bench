-- No last-year measure, and from sales the calendar is reached only through sales rows (no 2023).
SELECT calendar_year AS year, AGG(sales_sales_quantity) AS sales_quantity
FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
GROUP BY ALL
ORDER BY year
