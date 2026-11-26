-- The calendar as its own root, joined to the sales by year.
WITH c AS (
    SELECT calendar_year AS year, COUNT(*) AS day_count
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "calendar")
    GROUP BY ALL
), s AS (
    SELECT calendar_year AS year, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    GROUP BY ALL
)
SELECT year, c.day_count, s.q AS sales_quantity
FROM c LEFT JOIN s USING (year)
ORDER BY year
