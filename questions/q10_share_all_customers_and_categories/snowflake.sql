SELECT country, AGG(sales_quantity) AS sales_quantity, AGG(cust_cat_share_all) AS cust_cat_share_all
FROM DAX_DEMO.MODEL.SEMANTIC_VIEW
WHERE year = 2021 AND brand IN ('Tide', 'Dove') AND category = 'Laundry' AND customer <> 'Tesco'
GROUP BY ALL
ORDER BY country
