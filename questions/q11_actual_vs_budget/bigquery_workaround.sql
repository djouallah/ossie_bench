-- Two roots, two GRAPH_EXPANDs joined on the shared dimensions (the docs' pattern); the ratio is in the query.
WITH s AS (
    SELECT country_country AS country, category_category AS category, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_year = 2021
    GROUP BY ALL
), b AS (
    SELECT country_country AS country, category_category AS category, AGG(budget_budget_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "budget")
    WHERE calendar_year = 2021
    GROUP BY ALL
)
SELECT country, category, s.q AS sales_quantity, b.q AS budget_quantity, SAFE_DIVIDE(s.q - b.q, b.q) AS sales_vs_budget_pct
FROM s FULL JOIN b USING (country, category)
ORDER BY country, category
