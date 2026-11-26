-- The model on BigQuery: a property graph with measures (GA 2026-11-10). {DS} is filled by tools/bq.py.
-- Nodes are the 7 tables of the baseline; edges go from the many side to the one side. A measure is declared on
-- its node and locked to that node's KEY, so a join never repeats it. What a measure can be: SUM, AVG, MIN, MAX,
-- COUNT, and a derived measure of measures on the same node; no window, no filter-ignoring, no period shift.
CREATE OR REPLACE PROPERTY GRAPH {DS}.sales_graph
  NODE TABLES (
    {DS}.fact_sales AS sales KEY (sale_date, store_id, product_id)
      PROPERTIES (sale_date, store_id, product_id, sales_qty, net_profit,
        MEASURE(SUM(sales_qty)) AS sales_quantity,
        MEASURE(SUM(net_profit)) AS net_profit_total),
    {DS}.fact_budget AS budget KEY (month_start, country, category)
      PROPERTIES (month_start, country, category, budget_qty,
        MEASURE(SUM(budget_qty)) AS budget_quantity),
    {DS}.dim_calendar AS calendar KEY (date_key) PROPERTIES ARE ALL COLUMNS,
    {DS}.dim_product AS product KEY (product_id) PROPERTIES ARE ALL COLUMNS,
    {DS}.dim_category AS category KEY (category) PROPERTIES ARE ALL COLUMNS,
    {DS}.dim_store AS store KEY (store_id) PROPERTIES ARE ALL COLUMNS,
    {DS}.dim_country AS country KEY (country) PROPERTIES ARE ALL COLUMNS
  )
  EDGE TABLES (
    {DS}.fact_sales AS sales_to_calendar KEY (sale_date, store_id, product_id)
      SOURCE KEY (sale_date, store_id, product_id) REFERENCES sales (sale_date, store_id, product_id)
      DESTINATION KEY (sale_date) REFERENCES calendar (date_key) NO PROPERTIES,
    {DS}.fact_sales AS sales_to_product KEY (sale_date, store_id, product_id)
      SOURCE KEY (sale_date, store_id, product_id) REFERENCES sales (sale_date, store_id, product_id)
      DESTINATION KEY (product_id) REFERENCES product (product_id) NO PROPERTIES,
    {DS}.fact_sales AS sales_to_store KEY (sale_date, store_id, product_id)
      SOURCE KEY (sale_date, store_id, product_id) REFERENCES sales (sale_date, store_id, product_id)
      DESTINATION KEY (store_id) REFERENCES store (store_id) NO PROPERTIES,
    {DS}.dim_product AS product_to_category KEY (product_id)
      SOURCE KEY (product_id) REFERENCES product (product_id)
      DESTINATION KEY (category) REFERENCES category (category) NO PROPERTIES,
    {DS}.dim_store AS store_to_country KEY (store_id)
      SOURCE KEY (store_id) REFERENCES store (store_id)
      DESTINATION KEY (country) REFERENCES country (country) NO PROPERTIES,
    {DS}.fact_budget AS budget_to_calendar KEY (month_start, country, category)
      SOURCE KEY (month_start, country, category) REFERENCES budget (month_start, country, category)
      DESTINATION KEY (month_start) REFERENCES calendar (date_key) NO PROPERTIES,
    {DS}.fact_budget AS budget_to_category KEY (month_start, country, category)
      SOURCE KEY (month_start, country, category) REFERENCES budget (month_start, country, category)
      DESTINATION KEY (category) REFERENCES category (category) NO PROPERTIES,
    {DS}.fact_budget AS budget_to_country KEY (month_start, country, category)
      SOURCE KEY (month_start, country, category) REFERENCES budget (month_start, country, category)
      DESTINATION KEY (country) REFERENCES country (country) NO PROPERTIES
  );
