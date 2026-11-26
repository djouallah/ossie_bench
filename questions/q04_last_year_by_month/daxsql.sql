SELECT dim_calendar.month_start, GROUPING(dim_calendar.month_start) AS is_total,
       AGG(sales_quantity) AS sales_quantity,
       AGG(sales_qty_ly) AS sales_qty_ly,
       AGG(sales_qty_yoy_pct) AS sales_qty_yoy_pct
FROM model
WHERE dim_calendar.month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'
GROUP BY ROLLUP(dim_calendar.month_start)
ORDER BY is_total, month_start
