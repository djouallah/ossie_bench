-- The calendar as its own root (so 2023 stays), sales and sales a year back joined by year; a missing side counts as
-- 0, as DAX reads a blank.
WITH c AS (
    SELECT DISTINCT calendar_year AS year
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "calendar")
), s AS (
    SELECT calendar_year AS year, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    GROUP BY ALL
), ly AS (
    SELECT calendar_year + 1 AS year, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    GROUP BY ALL
)
SELECT year, s.q AS sales_quantity, ly.q AS sales_qty_ly, COALESCE(s.q, 0) - COALESCE(ly.q, 0) AS sales_qty_growth
FROM c LEFT JOIN s USING (year) LEFT JOIN ly USING (year)
ORDER BY year
