SELECT dim_country.country, dim_store.customer,
       AGG(sales_quantity) AS sales_quantity,
       AGG(customer_share_all) AS customer_share_all,
       AGG(customer_share_allselected) AS customer_share_allselected
FROM model
WHERE dim_store.customer NOT IN ('Zabka', 'Rewe', 'Superdrug')
  AND dim_calendar.month_start = DATE '2021-02-01'
  AND dim_product.brand <> 'Somat'
GROUP BY ALL
ORDER BY country, customer
