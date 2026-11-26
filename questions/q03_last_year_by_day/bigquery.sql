-- The graph has no last-year measure: a measure can't shift dates or hold a window.
SELECT calendar_date_key AS date_key, AGG(sales_sales_quantity) AS sales_quantity
FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
WHERE calendar_date_key BETWEEN DATE '2021-02-25' AND DATE '2021-03-03'
GROUP BY ALL
ORDER BY date_key
