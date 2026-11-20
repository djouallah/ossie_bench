SELECT * FROM (
    SELECT year, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly, AGG(sales_qty_yoy_pct) AS sales_qty_yoy_pct
    FROM DAX_DEMO.MODEL.SEMANTIC_VIEW
    WHERE year <= 2022
    GROUP BY ALL
    UNION ALL
    SELECT NULL, AGG(sales_quantity), AGG(sales_qty_ly), AGG(sales_qty_yoy_pct)
    FROM DAX_DEMO.MODEL.SEMANTIC_VIEW
    WHERE year <= 2022
)
ORDER BY year NULLS LAST
