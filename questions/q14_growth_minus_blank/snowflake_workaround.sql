-- A missing side counts as 0, as DAX reads a blank.
SELECT year, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly,
       COALESCE(AGG(sales_quantity), 0) - COALESCE(AGG(sales_qty_ly), 0) AS sales_qty_growth
FROM DAX_DEMO.MODEL.SEMANTIC_VIEW
GROUP BY ALL
ORDER BY year