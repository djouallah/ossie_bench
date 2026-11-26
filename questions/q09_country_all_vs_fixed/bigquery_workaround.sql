-- All customers: a second GRAPH_EXPAND without the customer filter. Fixed at country and year: a third, on the
-- year of the month asked (2021), with no other filter. The total row is a fourth part.
WITH cur AS (
    SELECT country_country AS country, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_month_start = DATE '2021-02-01' AND store_customer <> 'Tesco'
    GROUP BY ALL
), every_customer AS (
    SELECT country_country AS country, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_month_start = DATE '2021-02-01'
    GROUP BY ALL
), fixed AS (
    SELECT country_country AS country, AGG(sales_sales_quantity) AS q
    FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
    WHERE calendar_year = 2021
    GROUP BY ALL
), r AS (
    SELECT cur.country, cur.q, a.q AS qa, f.q AS qf
    FROM cur JOIN every_customer AS a USING (country) JOIN fixed AS f USING (country)
)
SELECT * FROM (
    SELECT country, q AS sales_quantity, qa AS country_qty_all_customers, qf AS country_total_fixed FROM r
    UNION ALL
    SELECT NULL, SUM(q), SUM(qa), SUM(qf) FROM r
)
ORDER BY country NULLS LAST
