-- Count the calendar from the calendar's own metric view, then join the sales view on year.
WITH c AS (
    SELECT year, COUNT(*) AS day_count FROM databricks_ne.ossie_demo.calendar_mv GROUP BY ALL
), s AS (
    SELECT year, AGG(sales_quantity) AS sales_quantity FROM databricks_ne.ossie_demo.sales_mv GROUP BY ALL
)
SELECT COALESCE(c.year, s.year) AS year, c.day_count, s.sales_quantity
FROM c FULL OUTER JOIN s ON c.year = s.year
ORDER BY year
