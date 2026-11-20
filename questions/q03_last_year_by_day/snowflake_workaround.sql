-- A third copy of the fact (sales_ly_day) whose shifted date drops Feb 29: one more logical table, four more relationships.
SELECT date_key, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly_day) AS sales_qty_ly
FROM DAX_DEMO.MODEL.SEMANTIC_VIEW
WHERE date_key BETWEEN DATE '2021-02-25' AND DATE '2021-03-03'
GROUP BY ALL
ORDER BY date_key
