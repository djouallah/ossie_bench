SELECT year, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly,
       AGG(sales_quantity) - AGG(sales_qty_ly) AS sales_qty_growth
FROM DAX_DEMO.MODEL.SEMANTIC_VIEW
GROUP BY ALL
ORDER BY year