-- The rows without a category are not Laundry either, as DAX reads its blank row.
SELECT category, AGG(budget_quantity) AS budget_quantity
FROM DAX_DEMO.MODEL.SEMANTIC_VIEW
WHERE year = 2022 AND (category <> 'Laundry' OR category IS NULL)
GROUP BY ALL
ORDER BY category