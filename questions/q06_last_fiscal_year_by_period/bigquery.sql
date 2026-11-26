-- No last-fiscal-year measure.
SELECT calendar_fiscal_period_name AS fiscal_period_name, calendar_fiscal_period_start AS fiscal_period_start,
       AGG(sales_sales_quantity) AS sales_quantity
FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
WHERE calendar_fiscal_period_start BETWEEN DATE '2021-01-25' AND DATE '2021-05-24'
GROUP BY ALL
ORDER BY fiscal_period_start
