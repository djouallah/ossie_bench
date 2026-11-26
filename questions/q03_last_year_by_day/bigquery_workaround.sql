-- Last year in the query: a second GRAPH_EXPAND over last year's days, joined on the date a year back.
-- Joined that way, Feb 29 2020 has no day a year later and drops out, as in DAX.
WITH cur AS (
    SELECT calendar_date_key AS d, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_date_key BETWEEN DATE '2021-02-25' AND DATE '2021-03-03'
    GROUP BY ALL
), ly AS (
    SELECT calendar_date_key AS d, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_date_key BETWEEN DATE '2020-02-25' AND DATE '2020-03-03'
    GROUP BY ALL
)
SELECT cur.d AS date_key, cur.q AS sales_quantity, ly.q AS sales_qty_ly
FROM cur LEFT JOIN ly ON ly.d = DATE_SUB(cur.d, INTERVAL 1 YEAR)
ORDER BY date_key
