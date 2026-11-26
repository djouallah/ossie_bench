-- No last-year measure; the total row is a second query (ROLLUP is refused with AGG).
SELECT * FROM (
    SELECT calendar_year AS year, AGG(sales_sales_quantity) AS sales_quantity
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_year <= 2022
    GROUP BY ALL
    UNION ALL
    SELECT NULL, AGG(sales_sales_quantity)
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_year <= 2022
)
ORDER BY year NULLS LAST
