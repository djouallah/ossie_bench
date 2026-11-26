SELECT dim_country.country, AGG(sales_quantity) AS sales_quantity, AGG(cust_cat_share_all) AS cust_cat_share_all
FROM model
WHERE dim_calendar.year = 2021
  AND dim_product.brand IN ('Tide', 'Dove')
  AND dim_category.category = 'Laundry'
  AND dim_store.customer <> 'Tesco'
GROUP BY ALL
ORDER BY country
