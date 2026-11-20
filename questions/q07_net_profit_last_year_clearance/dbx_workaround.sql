-- Last year as rows: sales_ly_mv is the fact with its date moved one year forward. Two views, joined by the query.
WITH cur AS (
    SELECT month_start, AGG(net_profit_total) AS net_profit_total FROM databricks_ne.ossie_demo.sales_mv WHERE category = 'Clearance' AND month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01' GROUP BY ALL
), ly AS (
    SELECT month_start, AGG(net_profit_ly) AS net_profit_ly FROM databricks_ne.ossie_demo.sales_ly_mv WHERE category = 'Clearance' AND month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01' GROUP BY ALL
)
SELECT COALESCE(cur.month_start, ly.month_start) AS month_start, cur.net_profit_total, ly.net_profit_ly
FROM cur FULL OUTER JOIN ly ON cur.month_start <=> ly.month_start
ORDER BY month_start
