-- No measure ignores a filter; the total row is a second query.
SELECT * FROM (
    SELECT country_country AS country, AGG(sales_sales_quantity) AS sales_quantity
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_month_start = DATE '2021-02-01' AND store_customer <> 'Tesco'
    GROUP BY ALL
    UNION ALL
    SELECT NULL, AGG(sales_sales_quantity)
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_month_start = DATE '2021-02-01' AND store_customer <> 'Tesco'
)
ORDER BY country NULLS LAST
