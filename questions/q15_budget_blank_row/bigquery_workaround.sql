-- The rows without a category are not Laundry either, as DAX reads its blank row.
SELECT category_category AS category, AGG(budget_budget_quantity) AS budget_quantity
FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "budget")
WHERE calendar_year = 2022 AND (category_category <> 'Laundry' OR category_category IS NULL)
GROUP BY ALL
ORDER BY category
