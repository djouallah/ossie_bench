-- Last fiscal year in the query: a second GRAPH_EXPAND, periods moved 364 days (4-4-5, 52 weeks).
WITH cur AS (
    SELECT calendar_fiscal_period_name AS n, calendar_fiscal_period_start AS s, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_fiscal_period_start BETWEEN DATE '2021-01-25' AND DATE '2021-05-24'
    GROUP BY ALL
), ly AS (
    SELECT DATE_ADD(calendar_fiscal_period_start, INTERVAL 364 DAY) AS s, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE DATE_ADD(calendar_fiscal_period_start, INTERVAL 364 DAY) BETWEEN DATE '2021-01-25' AND DATE '2021-05-24'
    GROUP BY ALL
)
SELECT cur.n AS fiscal_period_name, cur.s AS fiscal_period_start, cur.q AS sales_quantity, ly.q AS sales_qty_fly
FROM cur LEFT JOIN ly USING (s)
ORDER BY fiscal_period_start
