-- Last year in the query: a second GRAPH_EXPAND over last year's months, moved a year; the total is a third part.
WITH cur AS (
    SELECT calendar_month_start AS m, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'
    GROUP BY ALL
), ly AS (
    SELECT DATE_ADD(calendar_month_start, INTERVAL 1 YEAR) AS m, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_month_start BETWEEN DATE '2020-01-01' AND DATE '2020-04-01'
    GROUP BY ALL
), r AS (
    SELECT cur.m, cur.q, ly.q AS qly FROM cur LEFT JOIN ly USING (m)
    UNION ALL
    SELECT NULL, (SELECT SUM(q) FROM cur), (SELECT SUM(q) FROM ly)
)
SELECT m AS month_start, q AS sales_quantity, qly AS sales_qty_ly, SAFE_DIVIDE(q - qly, qly) AS sales_qty_yoy_pct
FROM r
ORDER BY month_start NULLS LAST
