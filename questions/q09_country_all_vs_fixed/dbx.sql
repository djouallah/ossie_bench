SELECT country, AGG(sales_quantity) AS sales_quantity, AGG(country_qty_all_customers) AS country_qty_all_customers,
       AGG(country_total_fixed) AS country_total_fixed
FROM databricks_ne.ossie_demo.sales_mv
WHERE month_start = DATE '2021-02-01' AND customer <> 'Tesco'
GROUP BY ROLLUP (country)
ORDER BY country NULLS LAST
