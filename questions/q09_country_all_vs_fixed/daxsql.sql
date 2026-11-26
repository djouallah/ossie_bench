SELECT dim_country.country, GROUPING(dim_country.country) AS is_total,
       AGG(sales_quantity) AS sales_quantity,
       AGG(country_qty_all_customers) AS country_qty_all_customers,
       AGG(country_total_fixed) AS country_total_fixed
FROM model
WHERE dim_calendar.month_start = DATE '2021-02-01'
  AND dim_store.customer <> 'Tesco'
GROUP BY ROLLUP(dim_country.country)
ORDER BY is_total, country
