-- How Snowflake really models it: the semantic view, derived from dax_context_demo.ipynb (its SV_SQL).
-- Changes from the notebook are marked [added] / [removed] / [changed] (+ / - / ~ below):
--   + FACT_BUDGET, the second fact (month x country x category), its relationships and metrics
--   + product_name, and country_total_fixed (the neutral name of the notebook's FIXED metric)
--   + sales_ly_day, another copy of the fact for "last year" by day (Feb 29 dropped, as DAX does)
--   - the two time_shift metrics (Private Preview, not on this account)
--   ~ the LOD written inline in its metrics, not as three view-level facts
-- The copies of the fact stay. Last year: a copy joined to the calendar on a shifted date. Folding it into sales
-- (a second relationship to the calendar, metrics with USING) is refused: an LOD needs one join path to the
-- calendar (tests/inline_lod_response.txt). DAX ALL(customer): LOD keeps every filter (EXCLUDE) or drops every one
-- (FIXED), and ALL drops one, so a copy of the fact with no path from the customer.
-- {FQ} is filled by tools/sf.py (DAX_DEMO.MODEL).
CREATE OR REPLACE SEMANTIC VIEW {FQ}.SEMANTIC_VIEW
  TABLES (
    sales AS {FQ}.FACT_SALES PRIMARY KEY (sale_date, store_id, product_id),
    -- "Last year" copies of the fact (calendar year and 4-4-5 fiscal year)
    sales_ly  AS {FQ}.FACT_SALES PRIMARY KEY (sale_date, store_id, product_id),
    sales_fly AS {FQ}.FACT_SALES PRIMARY KEY (sale_date, store_id, product_id),
    -- [added] "last year" by day, as DAX: Feb 29 has no day a year later, so it is dropped (not moved to Feb 28)
    sales_ly_day AS {FQ}.FACT_SALES PRIMARY KEY (sale_date, store_id, product_id),
    -- Denominator copies for DAX ALL(Customer) and ALL(Customer, Category)
    sales_all_cust     AS {FQ}.FACT_SALES PRIMARY KEY (sale_date, store_id, product_id),
    sales_all_cust_cat AS {FQ}.FACT_SALES PRIMARY KEY (sale_date, store_id, product_id),
    calendar      AS {FQ}.DIM_CALENDAR    PRIMARY KEY (date_key),
    product       AS {FQ}.DIM_PRODUCT     PRIMARY KEY (product_id) COMMENT = 'Category path only; no dimensions',
    product_attrs AS {FQ}.DIM_PRODUCT     PRIMARY KEY (product_id) COMMENT = 'Product attributes ALL(category) keeps',
    brand         AS {FQ}.DIM_BRAND       PRIMARY KEY (brand),
    category      AS {FQ}.DIM_CATEGORY    PRIMARY KEY (category),
    all_members   AS {FQ}.DIM_ALL_MEMBERS PRIMARY KEY (all_key),
    store         AS {FQ}.DIM_STORE       PRIMARY KEY (store_id),
    store_geo     AS {FQ}.DIM_STORE       PRIMARY KEY (store_id) COMMENT = 'Country path only; no dimensions',
    country       AS {FQ}.DIM_COUNTRY     PRIMARY KEY (country),
    -- [added] second fact, at month x country x category
    budget        AS {FQ}.FACT_BUDGET     PRIMARY KEY (month_start, country, category)
  )
  RELATIONSHIPS (
    store_to_country       AS store (country) REFERENCES country,
    store_geo_to_country   AS store_geo (country) REFERENCES country,
    product_to_category    AS product (category) REFERENCES category,
    product_attrs_to_brand AS product_attrs (brand) REFERENCES brand,
    category_to_all        AS category (all_key) REFERENCES all_members,

    sales_to_calendar      AS sales (sale_date) REFERENCES calendar,
    sales_to_product       AS sales (product_id) REFERENCES product,
    sales_to_product_attrs AS sales (product_id) REFERENCES product_attrs,
    sales_to_store         AS sales (store_id) REFERENCES store,

    sales_ly_to_calendar      AS sales_ly (sale_date_ly) REFERENCES calendar,
    sales_ly_to_product       AS sales_ly (product_id) REFERENCES product,
    sales_ly_to_product_attrs AS sales_ly (product_id) REFERENCES product_attrs,
    sales_ly_to_store         AS sales_ly (store_id) REFERENCES store,
    sales_fly_to_calendar      AS sales_fly (sale_date_fly) REFERENCES calendar,
    sales_fly_to_product       AS sales_fly (product_id) REFERENCES product,
    sales_fly_to_product_attrs AS sales_fly (product_id) REFERENCES product_attrs,
    sales_fly_to_store         AS sales_fly (store_id) REFERENCES store,
    sales_ly_day_to_calendar      AS sales_ly_day (sale_date_ly_day) REFERENCES calendar,
    sales_ly_day_to_product       AS sales_ly_day (product_id) REFERENCES product,
    sales_ly_day_to_product_attrs AS sales_ly_day (product_id) REFERENCES product_attrs,
    sales_ly_day_to_store         AS sales_ly_day (store_id) REFERENCES store,

    all_cust_to_calendar      AS sales_all_cust (sale_date) REFERENCES calendar,
    all_cust_to_product       AS sales_all_cust (product_id) REFERENCES product,
    all_cust_to_product_attrs AS sales_all_cust (product_id) REFERENCES product_attrs,
    all_cust_to_store_geo     AS sales_all_cust (store_id) REFERENCES store_geo,

    all_cc_to_calendar      AS sales_all_cust_cat (sale_date) REFERENCES calendar,
    all_cc_to_all_members   AS sales_all_cust_cat (all_key) REFERENCES all_members,
    all_cc_to_product_attrs AS sales_all_cust_cat (product_id) REFERENCES product_attrs,
    all_cc_to_store_geo     AS sales_all_cust_cat (store_id) REFERENCES store_geo,

    -- [added] the budget shares calendar (by month start), category and country with sales
    budget_to_calendar AS budget (month_start) REFERENCES calendar,
    budget_to_category AS budget (category) REFERENCES category,
    budget_to_country  AS budget (country) REFERENCES country
  )
  FACTS (
    sales.sales_qty  AS sales_qty,
    sales.net_profit AS net_profit,
    sales_ly.sale_date_ly AS DATEADD('year', 1, sale_date),
    sales_ly.sales_qty    AS sales_qty,
    sales_ly.net_profit   AS net_profit,
    sales_fly.sale_date_fly AS DATEADD('day', 364, sale_date),
    sales_fly.sales_qty     AS sales_qty,
    sales_ly_day.sale_date_ly_day AS IFF(MONTH(sale_date) = 2 AND DAY(sale_date) = 29, NULL, DATEADD('year', 1, sale_date)),
    sales_ly_day.sales_qty        AS sales_qty,
    sales_all_cust.sales_qty     AS sales_qty,
    sales_all_cust_cat.sales_qty AS sales_qty,
    sales_all_cust_cat.all_key   AS 1,
    budget.budget_qty            AS budget_qty
  )
  DIMENSIONS (
    calendar.date_key            AS date_key,
    calendar.year                AS year,
    calendar.year_month_num      AS year_month_num,
    calendar.year_month_name     AS year_month_name,
    calendar.month_start         AS month_start,
    calendar.year_start          AS year_start,
    calendar.fiscal_year         AS fiscal_year,
    calendar.fiscal_period_name  AS fiscal_period_name,
    calendar.fiscal_period_start AS fiscal_period_start,
    product_attrs.product_id     AS product_id,
    product_attrs.manufacturer   AS manufacturer,
    product_attrs.product_name   AS product_name,
    category.category            AS category,
    brand.brand                  AS brand,
    store.store_id               AS store_id,
    store.customer               AS customer,
    country.country              AS country
  )
  METRICS (
    sales.sales_quantity   AS SUM(sales.sales_qty),
    sales.net_profit_total AS SUM(sales.net_profit),

    -- [removed] time_shift metrics (Private Preview, not enabled on this account):
    --   sales.sales_qty_ya_daily AS sales.sales_quantity WITH time_shift(calendar.date_key, year, -1),
    --   sales.sales_qty_ya_fiscal_period AS sales.sales_quantity WITH time_shift(calendar.fiscal_period_start, week, -52),

    -- "Last year" copy of the fact: one metric, any grain
    sales_ly.sales_qty_ly   AS SUM(sales_ly.sales_qty),
    sales_ly.net_profit_ly  AS SUM(sales_ly.net_profit),
    sales_fly.sales_qty_fly AS SUM(sales_fly.sales_qty),
    sales_ly_day.sales_qty_ly_day AS SUM(sales_ly_day.sales_qty),
    sales_qty_yoy_pct AS DIV0(sales.sales_quantity - sales_ly.sales_qty_ly, sales_ly.sales_qty_ly),

    -- DAX ALL(...): coarse-key denominators
    sales_all_cust.country_qty_all_customers    AS SUM(sales_all_cust.sales_qty),
    sales_all_cust_cat.country_qty_all_cust_cat AS SUM(sales_all_cust_cat.sales_qty),
    customer_share_all AS DIV0(sales.sales_quantity, sales_all_cust.country_qty_all_customers),
    cust_cat_share_all AS DIV0(sales.sales_quantity, sales_all_cust_cat.country_qty_all_cust_cat),

    -- DAX ALLEXCEPT (FIXED) and ALLSELECTED (EXCLUDE): LOD (Preview), written inline in each metric. [changed] The
    -- notebook declares each LOD once as a view-level fact; inline, a metric has no table prefix.
    country_total_allexcept   AS AVG(SUM(sales.sales_qty) FIXED DIMENSIONS (country.country, calendar.year)),
    country_total_allselected AS AVG(SUM(sales.sales_qty) EXCLUDE DIMENSIONS (store.customer)),
    customer_share_allexcept   AS SUM(sales.sales_qty) / AVG(SUM(sales.sales_qty) FIXED DIMENSIONS (country.country, calendar.year)),
    customer_share_allselected AS SUM(sales.sales_qty) / AVG(SUM(sales.sales_qty) EXCLUDE DIMENSIONS (store.customer)),
    cust_cat_share_allselected AS SUM(sales.sales_qty) / AVG(SUM(sales.sales_qty) EXCLUDE DIMENSIONS (store.customer, category.category)),
    -- [added] the neutral name for FIXED (country, year); the notebook calls it country_total_allexcept
    -- SUM(DISTINCT): one value per country-year in the query, so the total row is a sum (AVG would average them).
    -- It assumes no two country-years have exactly the same total.
    country_total_fixed AS SUM(DISTINCT SUM(sales.sales_qty) FIXED DIMENSIONS (country.country, calendar.year)),

    -- [added] budget, and actual vs budget across the two facts
    budget.budget_quantity AS SUM(budget.budget_qty),
    sales_vs_budget_pct    AS DIV0(sales.sales_quantity - budget.budget_quantity, budget.budget_quantity)
  )
  COMMENT = 'DAX context manipulation patterns (Year Ago, ALL, ALLEXCEPT, ALLSELECTED) on a Snowflake semantic view'
