-- No last-year measure; the total row is a second query (ROLLUP is refused with AGG).
SELECT * FROM (
    SELECT calendar_month_start AS month_start, AGG(sales_sales_quantity) AS sales_quantity
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'
    GROUP BY ALL
    UNION ALL
    SELECT NULL, AGG(sales_sales_quantity)
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'
)
ORDER BY month_start NULLS LAST
