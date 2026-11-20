SELECT country, customer,
       AGG(sales_quantity) AS sales_quantity,
       AGG(customer_share_all) AS customer_share_all,
       AGG(customer_share_allselected) AS customer_share_allselected
FROM DAX_DEMO.MODEL.SEMANTIC_VIEW
WHERE customer NOT IN ('Zabka', 'Rewe', 'Superdrug')
  AND month_start = DATE '2021-02-01'
  AND brand <> 'Somat'
GROUP BY ALL
ORDER BY country, customer
