-- The share of the customers shown, computed by the query, not the model: a window over the metric view's result.
SELECT country, customer, sales_quantity, customer_share_all,
       sales_quantity / SUM(sales_quantity) OVER (PARTITION BY country) AS customer_share_allselected
FROM (
    SELECT country, customer,
           AGG(sales_quantity) AS sales_quantity,
           AGG(customer_share_all) AS customer_share_all
    FROM databricks_ne.ossie_demo.sales_mv
    WHERE customer NOT IN ('Zabka', 'Rewe', 'Superdrug')
      AND month_start = DATE '2021-02-01'
      AND brand <> 'Somat'
    GROUP BY ALL
)
ORDER BY country, customer
