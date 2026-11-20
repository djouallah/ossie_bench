SELECT fiscal_period_name, fiscal_period_start, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_fly) AS sales_qty_fly
FROM databricks_ne.ossie_demo.sales_mv
WHERE fiscal_period_start BETWEEN DATE '2021-01-25' AND DATE '2021-05-24'
GROUP BY ALL
ORDER BY fiscal_period_start
