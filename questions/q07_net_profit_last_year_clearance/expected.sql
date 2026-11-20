-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.
WITH m AS (
    SELECT c.month_start, SUM(f.net_profit) AS profit
    FROM 'data/fact_sales.parquet' f
    JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key
    JOIN 'data/dim_product.parquet' p ON f.product_id = p.product_id
    JOIN 'data/dim_store.parquet' s ON f.store_id = s.store_id
    WHERE p.category = 'Clearance'
    GROUP BY ALL
)
SELECT cur.month_start, cur.profit AS net_profit_total, ly.profit AS net_profit_ly
FROM m cur LEFT JOIN m ly ON ly.month_start = cur.month_start - INTERVAL 1 YEAR
WHERE cur.month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'
ORDER BY cur.month_start
