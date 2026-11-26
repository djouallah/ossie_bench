-- Last year in the query: a second GRAPH_EXPAND over last year's months, moved a year.
WITH cur AS (
    SELECT calendar_month_start AS m, AGG(sales_net_profit_total) AS p
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE category_category = 'Clearance' AND calendar_month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'
    GROUP BY ALL
), ly AS (
    SELECT DATE_ADD(calendar_month_start, INTERVAL 1 YEAR) AS m, AGG(sales_net_profit_total) AS p
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE category_category = 'Clearance' AND calendar_month_start BETWEEN DATE '2020-01-01' AND DATE '2020-04-01'
    GROUP BY ALL
)
SELECT cur.m AS month_start, cur.p AS net_profit_total, ly.p AS net_profit_ly
FROM cur LEFT JOIN ly USING (m)
ORDER BY month_start
