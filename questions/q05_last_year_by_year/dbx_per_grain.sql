-- A third "last year" measure, ordered by year (offset -1): one measure per grain.
-- The years are right; the total row repeats the last year's value (a window measure keeps the last period).
SELECT year, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly_year) AS sales_qty_ly,
       (AGG(sales_quantity) - AGG(sales_qty_ly_year)) / AGG(sales_qty_ly_year) AS sales_qty_yoy_pct
FROM databricks_ne.ossie_demo.sales_mv
WHERE year <= 2022
GROUP BY ROLLUP (year)
ORDER BY year NULLS LAST
