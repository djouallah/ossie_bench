-- No last-year measure.
SELECT calendar_month_start AS month_start, AGG(sales_net_profit_total) AS net_profit_total
FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
WHERE category_category = 'Clearance'
  AND calendar_month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'
GROUP BY ALL
ORDER BY month_start
