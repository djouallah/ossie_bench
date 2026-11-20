SELECT * FROM (
    SELECT country, AGG(sales_quantity) AS sales_quantity, AGG(country_qty_all_customers) AS country_qty_all_customers, AGG(country_total_fixed) AS country_total_fixed
    FROM DAX_DEMO.MODEL.SEMANTIC_VIEW
    WHERE month_start = DATE '2021-02-01' AND customer <> 'Tesco'
    GROUP BY ALL
    UNION ALL
    SELECT NULL, AGG(sales_quantity), AGG(country_qty_all_customers), AGG(country_total_fixed)
    FROM DAX_DEMO.MODEL.SEMANTIC_VIEW
    WHERE month_start = DATE '2021-02-01' AND customer <> 'Tesco'
)
ORDER BY country NULLS LAST
