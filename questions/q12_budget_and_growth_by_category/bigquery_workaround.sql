-- Three GRAPH_EXPANDs joined on category: sales, sales a year back, budget. The total row is a fourth part.
WITH s AS (
    SELECT category_category AS category, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_year = 2021
    GROUP BY ALL
), ly AS (
    SELECT category_category AS category, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_year = 2020
    GROUP BY ALL
), b AS (
    SELECT category_category AS category, AGG(budget_budget_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "budget")
    WHERE calendar_year = 2021
    GROUP BY ALL
), r AS (
    SELECT category, s.q, b.q AS qb, ly.q AS qly FROM s FULL JOIN b USING (category) LEFT JOIN ly USING (category)
    UNION ALL
    SELECT NULL, (SELECT SUM(q) FROM s), (SELECT SUM(q) FROM b), (SELECT SUM(q) FROM ly)
)
SELECT category, q AS sales_quantity, qb AS budget_quantity, SAFE_DIVIDE(q - qb, qb) AS sales_vs_budget_pct,
       qly AS sales_qty_ly, SAFE_DIVIDE(q - qly, qly) AS sales_qty_yoy_pct
FROM r
ORDER BY category NULLS LAST
