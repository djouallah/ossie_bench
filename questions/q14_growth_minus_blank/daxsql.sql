SELECT dim_calendar.year,
       AGG(sales_quantity) AS sales_quantity,
       AGG(sales_qty_ly) AS sales_qty_ly,
       AGG(sales_quantity) - AGG(sales_qty_ly) AS sales_qty_growth
FROM model
GROUP BY ALL
ORDER BY year