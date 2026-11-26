SELECT dim_calendar.year, GROUPING(dim_calendar.year) AS is_total,
       AGG(sales_quantity) AS sales_quantity,
       AGG(sales_qty_ly) AS sales_qty_ly,
       AGG(sales_qty_yoy_pct) AS sales_qty_yoy_pct
FROM model
WHERE dim_calendar.year <= 2022
GROUP BY ROLLUP(dim_calendar.year)
ORDER BY is_total, year
