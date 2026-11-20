-- The share of the customers shown has no metric-view form: customer_share_allselected can't be asked.
SELECT country, customer,
       AGG(sales_quantity) AS sales_quantity,
       AGG(customer_share_all) AS customer_share_all
FROM databricks_ne.ossie_demo.sales_mv
WHERE customer NOT IN ('Zabka', 'Rewe', 'Superdrug')
  AND month_start = DATE '2021-02-01'
  AND brand <> 'Somat'
GROUP BY ALL
ORDER BY country, customer
