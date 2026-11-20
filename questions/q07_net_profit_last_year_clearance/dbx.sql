SELECT month_start, AGG(net_profit_total) AS net_profit_total, AGG(net_profit_ly) AS net_profit_ly
FROM databricks_ne.ossie_demo.sales_mv
WHERE category = 'Clearance'
  AND month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'
GROUP BY ALL
ORDER BY month_start
