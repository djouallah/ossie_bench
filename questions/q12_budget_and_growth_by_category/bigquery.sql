-- From sales the budget is not reachable, and there is no last-year measure; the total row is a second query.
SELECT * FROM (
    SELECT category_category AS category, AGG(sales_sales_quantity) AS sales_quantity
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_year = 2021
    GROUP BY ALL
    UNION ALL
    SELECT NULL, AGG(sales_sales_quantity)
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_year = 2021
)
ORDER BY category NULLS LAST
