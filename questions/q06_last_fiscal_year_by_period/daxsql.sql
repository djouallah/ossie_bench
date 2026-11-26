SELECT dim_calendar.fiscal_period_name, dim_calendar.fiscal_period_start,
       AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_fly) AS sales_qty_fly
FROM model
WHERE dim_calendar.fiscal_period_start BETWEEN DATE '2021-01-25' AND DATE '2021-05-24'
GROUP BY ALL
ORDER BY fiscal_period_start
