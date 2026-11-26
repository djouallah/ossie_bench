-- No measure ignores a filter.
SELECT country_country AS country, AGG(sales_sales_quantity) AS sales_quantity
FROM GRAPH_EXPAND("ossie_bench.sales_graph", start_node => "sales")
WHERE calendar_year = 2021
  AND product_brand IN ('Tide', 'Dove')
  AND category_category = 'Laundry'
  AND store_customer <> 'Tesco'
GROUP BY ALL
ORDER BY country
