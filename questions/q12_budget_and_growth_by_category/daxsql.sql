SELECT dim_category.category, GROUPING(dim_category.category) AS is_total,
       AGG(sales_quantity) AS sales_quantity,
       AGG(budget_quantity) AS budget_quantity,
       AGG(sales_vs_budget_pct) AS sales_vs_budget_pct,
       AGG(sales_qty_ly) AS sales_qty_ly,
       AGG(sales_qty_yoy_pct) AS sales_qty_yoy_pct
FROM model
WHERE dim_calendar.year = 2021
GROUP BY ROLLUP(dim_category.category)
ORDER BY is_total, category
