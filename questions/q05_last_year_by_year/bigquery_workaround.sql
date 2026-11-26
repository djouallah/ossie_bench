-- Last year in the query: a second GRAPH_EXPAND, years moved by one; the total is a third part.
WITH cur AS (
    SELECT calendar_year AS y, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_year <= 2022
    GROUP BY ALL
), ly AS (
    SELECT calendar_year + 1 AS y, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_year <= 2021
    GROUP BY ALL
), r AS (
    SELECT cur.y, cur.q, ly.q AS qly FROM cur LEFT JOIN ly USING (y)
    UNION ALL
    SELECT NULL, (SELECT SUM(q) FROM cur), (SELECT SUM(q) FROM ly)
)
SELECT y AS year, q AS sales_quantity, qly AS sales_qty_ly, SAFE_DIVIDE(q - qly, qly) AS sales_qty_yoy_pct
FROM r
ORDER BY year NULLS LAST
