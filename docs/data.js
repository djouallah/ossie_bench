window.DATA = {
 "measures": [
  {
   "name": "sales_quantity",
   "meaning": "Units sold.",
   "standard": "SQL"
  },
  {
   "name": "net_profit_total",
   "meaning": "Net profit (negative for Clearance).",
   "standard": "SQL"
  },
  {
   "name": "budget_quantity",
   "meaning": "Budgeted units, by month, country and category.",
   "standard": "SQL"
  },
  {
   "name": "sales_vs_budget_pct",
   "meaning": "(sales - budget) / budget. Each side is summed at its own table's grain first.",
   "standard": "SQL: `AGG()` of the two measures above"
  },
  {
   "name": "sales_qty_ly",
   "meaning": "Units sold in the same period one calendar year earlier, at whatever grain is asked (day, month, year, total).",
   "standard": "DAX: period over period"
  },
  {
   "name": "net_profit_ly",
   "meaning": "Net profit in the same period one calendar year earlier.",
   "standard": "DAX: period over period"
  },
  {
   "name": "sales_qty_fly",
   "meaning": "Units sold in the same period of the last fiscal year: 364 days earlier (4-4-5, 52 weeks).",
   "standard": "DAX: period over period"
  },
  {
   "name": "sales_qty_yoy_pct",
   "meaning": "(sales - last year) / last year.",
   "standard": "DAX: period over period"
  },
  {
   "name": "country_qty_all_customers",
   "meaning": "Units sold to every customer, whatever customers the query filters or shows. Every other filter is kept.",
   "standard": "DAX: fields in or out of the grouping"
  },
  {
   "name": "customer_share_all",
   "meaning": "sales / `country_qty_all_customers`.",
   "standard": "DAX: fields in or out of the grouping"
  },
  {
   "name": "country_total_allselected",
   "meaning": "Units sold to the customers the query shows, taken together.",
   "standard": "DAX: fields in or out of the grouping"
  },
  {
   "name": "customer_share_allselected",
   "meaning": "sales / `country_total_allselected`.",
   "standard": "DAX: fields in or out of the grouping"
  },
  {
   "name": "country_total_allexcept",
   "meaning": "Units sold with every filter removed except those on country and year.",
   "standard": "DAX: fields in or out of the grouping"
  },
  {
   "name": "country_total_fixed",
   "meaning": "Units sold for the country and the year shown, whatever else is filtered.",
   "standard": "DAX: fields in or out of the grouping"
  },
  {
   "name": "country_qty_all_cust_cat",
   "meaning": "Units sold to every customer in every category. Every other filter is kept.",
   "standard": "DAX: fields in or out of the grouping"
  },
  {
   "name": "cust_cat_share_all",
   "meaning": "sales / `country_qty_all_cust_cat`.",
   "standard": "DAX: fields in or out of the grouping"
  }
 ],
 "ossie": {
  "version": "0.3.0.dev0",
  "yaml": "# The baseline: the model in Ossie, with all 16 measures. No extension.\n# Version 0.3.0.dev0 is the unreleased development version on apache/ossie main (read 2026-11-26, commit 7fb92a7);\n# it can still change. An open proposal (apache/ossie#817) would rename expression.dialects to nonportable_dialects.\n# 7 datasets and 8 relationships. 4 measures are in portable SQL (expression.sql): three sums, each declared on its\n# own dataset, and one ratio across the two facts that reads them with AGG(). The other 12 have no portable form\n# yet, so they are in the DAX dialect, and they read the SQL ones by name ([sales_quantity]). measures.md defines\n# all 16 in words. Sources are bare table names: each platform prefixes its own schema.\nversion: 0.3.0.dev0\nname: sales_and_budget\ndescription: Sales by day, store and product, and a monthly budget by country and category (2020-2022).\ndatasets:\n- name: fact_sales\n  source: fact_sales\n  primary_key:\n  - sale_date\n  - store_id\n  - product_id\n  description: One row per day, store and product.\n  fields:\n  - name: sale_date\n    expression:\n      sql: sale_date\n    datatype: Date\n  - name: store_id\n    expression:\n      sql: store_id\n    datatype: Integer\n  - name: product_id\n    expression:\n      sql: product_id\n    datatype: Integer\n  - name: sales_qty\n    expression:\n      sql: sales_qty\n    datatype: Integer\n  - name: net_profit\n    expression:\n      sql: net_profit\n    datatype: Float\n  metrics:\n  - name: sales_quantity\n    description: Units sold.\n    expression:\n      sql: SUM(sales_qty)\n  - name: net_profit_total\n    description: Net profit (negative for Clearance).\n    expression:\n      sql: SUM(net_profit)\n  # The 12 below have no SQL form in the standard: period over period, and fields taken out of the grouping, are\n  # its \"evaluation controls\", deferred to a later extension. They are written in the DAX dialect instead.\n  - name: sales_qty_ly\n    description: Units sold in the same period one calendar year earlier, at any grain.\n    expression:\n      dialects:\n      - dialect: DAX\n        expression: CALCULATE([sales_quantity], SAMEPERIODLASTYEAR(dim_calendar[date_key]))\n  - name: net_profit_ly\n    description: Net profit in the same period one calendar year earlier.\n    expression:\n      dialects:\n      - dialect: DAX\n        expression: CALCULATE([net_profit_total], SAMEPERIODLASTYEAR(dim_calendar[date_key]))\n  - name: sales_qty_fly\n    description: Units sold in the same period of the last fiscal year (4-4-5, 52 weeks, so 364 days earlier).\n    expression:\n      dialects:\n      - dialect: DAX\n        expression: CALCULATE([sales_quantity], DATEADD(dim_calendar[date_key], -364, DAY))\n  - name: sales_qty_yoy_pct\n    description: (sales - last year) / last year.\n    expression:\n      dialects:\n      - dialect: DAX\n        expression: DIVIDE([sales_quantity] - [sales_qty_ly], [sales_qty_ly])\n  - name: country_qty_all_customers\n    description: Units sold to every customer, whatever customers the query filters or shows. Every other filter is kept.\n    expression:\n      dialects:\n      - dialect: DAX\n        expression: CALCULATE([sales_quantity], ALL(dim_store[customer]))\n  - name: customer_share_all\n    description: sales / country_qty_all_customers.\n    expression:\n      dialects:\n      - dialect: DAX\n        expression: DIVIDE([sales_quantity], [country_qty_all_customers])\n  - name: country_total_allselected\n    description: Units sold to the customers the query shows, taken together.\n    expression:\n      dialects:\n      - dialect: DAX\n        expression: CALCULATE([sales_quantity], ALLSELECTED(dim_store[customer]))\n  - name: customer_share_allselected\n    description: sales / country_total_allselected.\n    expression:\n      dialects:\n      - dialect: DAX\n        expression: DIVIDE([sales_quantity], [country_total_allselected])\n  - name: country_total_allexcept\n    description: Units sold with every filter removed except those on country and year.\n    expression:\n      dialects:\n      - dialect: DAX\n        expression: CALCULATE([sales_quantity], ALLEXCEPT(fact_sales, dim_country[country], dim_calendar[year]))\n  - name: country_total_fixed\n    description: Units sold for the country and the year shown, whatever else is filtered.\n    expression:\n      dialects:\n      - dialect: DAX\n        expression: CALCULATE([sales_quantity], REMOVEFILTERS(), VALUES(dim_country[country]), VALUES(dim_calendar[year]))\n  - name: country_qty_all_cust_cat\n    description: Units sold to every customer in every category. Every other filter is kept.\n    expression:\n      dialects:\n      - dialect: DAX\n        expression: CALCULATE([sales_quantity], REMOVEFILTERS(dim_store[customer]), REMOVEFILTERS(dim_category[category]))\n  - name: cust_cat_share_all\n    description: sales / country_qty_all_cust_cat.\n    expression:\n      dialects:\n      - dialect: DAX\n        expression: DIVIDE([sales_quantity], [country_qty_all_cust_cat])\n- name: fact_budget\n  source: fact_budget\n  primary_key:\n  - month_start\n  - country\n  - category\n  description: One row per month, country and category. month_start is the first day of the month.\n  fields:\n  - name: month_start\n    expression:\n      sql: month_start\n    datatype: Date\n  - name: country\n    expression:\n      sql: country\n    datatype: String\n  - name: category\n    expression:\n      sql: category\n    datatype: String\n  - name: budget_qty\n    expression:\n      sql: budget_qty\n    datatype: Integer\n  metrics:\n  - name: budget_quantity\n    description: Budgeted units (month x country x category).\n    expression:\n      sql: SUM(budget_qty)\n- name: dim_calendar\n  source: dim_calendar\n  primary_key:\n  - date_key\n  description: Calendar 2020-2023, with 4-4-5 fiscal periods (52-week fiscal years starting 2019-12-30).\n  fields:\n  - name: date_key\n    expression:\n      sql: date_key\n    datatype: Date\n    dimension:\n      is_time: true\n  - name: year\n    expression:\n      sql: year\n    datatype: Integer\n    dimension:\n      is_time: false\n  - name: year_month_num\n    expression:\n      sql: year_month_num\n    datatype: Integer\n    dimension:\n      is_time: false\n  - name: year_month_name\n    expression:\n      sql: year_month_name\n    datatype: String\n    dimension:\n      is_time: false\n  - name: month_start\n    expression:\n      sql: month_start\n    datatype: Date\n    dimension:\n      is_time: true\n  - name: year_start\n    expression:\n      sql: year_start\n    datatype: Date\n    dimension:\n      is_time: true\n  - name: fiscal_year\n    expression:\n      sql: fiscal_year\n    datatype: Integer\n    dimension:\n      is_time: false\n  - name: fiscal_period\n    expression:\n      sql: fiscal_period\n    datatype: Integer\n    dimension:\n      is_time: false\n  - name: fiscal_period_name\n    expression:\n      sql: fiscal_period_name\n    datatype: String\n    dimension:\n      is_time: false\n  - name: fiscal_period_start\n    expression:\n      sql: fiscal_period_start\n    datatype: Date\n    dimension:\n      is_time: true\n  - name: fiscal_year_start\n    expression:\n      sql: fiscal_year_start\n    datatype: Date\n    dimension:\n      is_time: true\n- name: dim_product\n  source: dim_product\n  primary_key:\n  - product_id\n  description: 40 products, 8 brands. Its category is a key to dim_category (Clearance has negative margins).\n  fields:\n  - name: product_id\n    expression:\n      sql: product_id\n    datatype: Integer\n    dimension:\n      is_time: false\n  - name: product_name\n    expression:\n      sql: product_name\n    datatype: String\n    dimension:\n      is_time: false\n  - name: brand\n    expression:\n      sql: brand\n    datatype: String\n    dimension:\n      is_time: false\n  - name: manufacturer\n    expression:\n      sql: manufacturer\n    datatype: String\n    dimension:\n      is_time: false\n  # A key to dim_category, not a dimension: category is grouped and filtered from dim_category (see q10).\n  - name: category\n    expression:\n      sql: category\n    datatype: String\n- name: dim_category\n  source: dim_category\n  primary_key:\n  - category\n  description: 4 categories, shared by sales (through product) and budget.\n  fields:\n  - name: category\n    expression:\n      sql: category\n    datatype: String\n    dimension:\n      is_time: false\n- name: dim_store\n  source: dim_store\n  primary_key:\n  - store_id\n  description: 55 stores; a customer is a store chain within one country. Its country is a key to dim_country.\n  fields:\n  - name: store_id\n    expression:\n      sql: store_id\n    datatype: Integer\n    dimension:\n      is_time: false\n  - name: store_name\n    expression:\n      sql: store_name\n    datatype: String\n    dimension:\n      is_time: false\n  - name: customer\n    expression:\n      sql: customer\n    datatype: String\n    dimension:\n      is_time: false\n  # A key to dim_country, not a dimension: country is grouped and filtered from dim_country.\n  - name: country\n    expression:\n      sql: country\n    datatype: String\n- name: dim_country\n  source: dim_country\n  primary_key:\n  - country\n  description: 3 countries, shared by sales (through store) and budget.\n  fields:\n  - name: country\n    expression:\n      sql: country\n    datatype: String\n    dimension:\n      is_time: false\nrelationships:\n- name: sales_to_calendar\n  from: fact_sales\n  to: dim_calendar\n  from_columns:\n  - sale_date\n  to_columns:\n  - date_key\n- name: sales_to_product\n  from: fact_sales\n  to: dim_product\n  from_columns:\n  - product_id\n  to_columns:\n  - product_id\n- name: sales_to_store\n  from: fact_sales\n  to: dim_store\n  from_columns:\n  - store_id\n  to_columns:\n  - store_id\n- name: product_to_category\n  from: dim_product\n  to: dim_category\n  from_columns:\n  - category\n  to_columns:\n  - category\n- name: store_to_country\n  from: dim_store\n  to: dim_country\n  from_columns:\n  - country\n  to_columns:\n  - country\n- name: budget_to_calendar\n  from: fact_budget\n  to: dim_calendar\n  from_columns:\n  - month_start\n  to_columns:\n  - date_key\n- name: budget_to_category\n  from: fact_budget\n  to: dim_category\n  from_columns:\n  - category\n  to_columns:\n  - category\n- name: budget_to_country\n  from: fact_budget\n  to: dim_country\n  from_columns:\n  - country\n  to_columns:\n  - country\nmetrics:\n- name: sales_vs_budget_pct\n  description: (sales - budget) / budget. Each side is summed over its own table first.\n  expression:\n    sql: (AGG(fact_sales.sales_quantity) - AGG(fact_budget.budget_quantity)) / AGG(fact_budget.budget_quantity)",
  "expr": {
   "sales_quantity": {
    "lang": "sql",
    "code": "SUM(sales_qty)",
    "home": "fact_sales"
   },
   "net_profit_total": {
    "lang": "sql",
    "code": "SUM(net_profit)",
    "home": "fact_sales"
   },
   "sales_qty_ly": {
    "lang": "dax",
    "code": "CALCULATE([sales_quantity], SAMEPERIODLASTYEAR(dim_calendar[date_key]))",
    "home": "fact_sales"
   },
   "net_profit_ly": {
    "lang": "dax",
    "code": "CALCULATE([net_profit_total], SAMEPERIODLASTYEAR(dim_calendar[date_key]))",
    "home": "fact_sales"
   },
   "sales_qty_fly": {
    "lang": "dax",
    "code": "CALCULATE([sales_quantity], DATEADD(dim_calendar[date_key], -364, DAY))",
    "home": "fact_sales"
   },
   "sales_qty_yoy_pct": {
    "lang": "dax",
    "code": "DIVIDE([sales_quantity] - [sales_qty_ly], [sales_qty_ly])",
    "home": "fact_sales"
   },
   "country_qty_all_customers": {
    "lang": "dax",
    "code": "CALCULATE([sales_quantity], ALL(dim_store[customer]))",
    "home": "fact_sales"
   },
   "customer_share_all": {
    "lang": "dax",
    "code": "DIVIDE([sales_quantity], [country_qty_all_customers])",
    "home": "fact_sales"
   },
   "country_total_allselected": {
    "lang": "dax",
    "code": "CALCULATE([sales_quantity], ALLSELECTED(dim_store[customer]))",
    "home": "fact_sales"
   },
   "customer_share_allselected": {
    "lang": "dax",
    "code": "DIVIDE([sales_quantity], [country_total_allselected])",
    "home": "fact_sales"
   },
   "country_total_allexcept": {
    "lang": "dax",
    "code": "CALCULATE([sales_quantity], ALLEXCEPT(fact_sales, dim_country[country], dim_calendar[year]))",
    "home": "fact_sales"
   },
   "country_total_fixed": {
    "lang": "dax",
    "code": "CALCULATE([sales_quantity], REMOVEFILTERS(), VALUES(dim_country[country]), VALUES(dim_calendar[year]))",
    "home": "fact_sales"
   },
   "country_qty_all_cust_cat": {
    "lang": "dax",
    "code": "CALCULATE([sales_quantity], REMOVEFILTERS(dim_store[customer]), REMOVEFILTERS(dim_category[category]))",
    "home": "fact_sales"
   },
   "cust_cat_share_all": {
    "lang": "dax",
    "code": "DIVIDE([sales_quantity], [country_qty_all_cust_cat])",
    "home": "fact_sales"
   },
   "budget_quantity": {
    "lang": "sql",
    "code": "SUM(budget_qty)",
    "home": "fact_budget"
   },
   "sales_vs_budget_pct": {
    "lang": "sql",
    "code": "(AGG(fact_sales.sales_quantity) - AGG(fact_budget.budget_quantity)) / AGG(fact_budget.budget_quantity)",
    "home": "model"
   }
  }
 },
 "evidence": {
  "fabric_publish": "{\n \"semanticModel\": {\n  \"workspaceId\": \"8c945c1a-f25e-4f19-a7ad-c3a7bfbd0fc9\",\n  \"id\": \"b029eb6e-e318-4904-acfe-18f32bf069bd\"\n },\n \"summary\": {\n  \"errorCount\": 0,\n  \"warningCount\": 0\n },\n \"warnings\": []\n}",
  "sf_import": "Semantic view was successfully created from OSI YAML.",
  "sf_reimport": "ERROR 000904 (42000): Uncaught exception of type 'EXPRESSION_ERROR' on line 3 at position 23 : SQL compilation error: error line 15 at position 719 invalid identifier 'SALES.SALES_QUANTITY'",
  "sf_dialect": "SYSTEM$CREATE_SEMANTIC_VIEW_FROM_OSSIE_YAML, with FIXED / EXCLUDE DIMENSIONS in the SNOWFLAKE dialect:\n  as a metric:           ERROR 001003 (42000): Uncaught exception of type 'EXPRESSION_ERROR' on line 3 at position 23 : SQL compilation error: syntax error line 15 at position 350 unexpected 'FIXED'.\n  as a field + metric:   ERROR 001003 (42000): Uncaught exception of type 'EXPRESSION_ERROR' on line 3 at position 23 : SQL compilation error: syntax error line 9 at position 268 unexpected 'FIXED'. syntax error line 9 at position 305 unexpected ','. syntax error line 9 at position 324 unexpected ')'. syntax error line 9 at position 325 unexpected ','.\n\nThe same expressions in hand-written CREATE SEMANTIC VIEW DDL:\n  view-level fact (no table prefix, the notebook's way):  accepted\n  table-scoped fact (sales.x AS SUM(...) FIXED ...):       syntax error, unexpected 'FIXED'\n  metric (sales.m AS SUM(...) FIXED ...):                  syntax error, unexpected 'FIXED'\n\nAn LOD fact exists only at view level; Ossie has no place for a view-level fact (a field belongs to a dataset).",
  "sf_dialect_inline": "SYSTEM$CREATE_SEMANTIC_VIEW_FROM_OSSIE_YAML, tests/dax_context.ossie.yaml (0.1.1) with two model metrics in the\nSNOWFLAKE dialect, the LOD inline (scratch view, dropped after):\n  country_total_allselected: AVG(SUM(fact_sales.sales_qty) EXCLUDE DIMENSIONS (dim_store.customer))\n  country_total_fixed: SUM(DISTINCT SUM(fact_sales.sales_qty) FIXED DIMENSIONS (dim_country.country, dim_calendar.year))\nimport: Semantic view was successfully created from OSI YAML.\nquery by country, February 2021 without Tesco (country_total_allselected, country_total_fixed): [('Germany', Decimal('3164939.000000'), 36203407), ('Poland', Decimal('2686210.000000'), 30755062), ('UK', Decimal('1031214.000000'), 22111689)]",
  "sf_extensions": "SYSTEM$CREATE_SEMANTIC_VIEW_FROM_OSSIE_YAML with vendor extensions (tests/dax_context.ossie.yaml, one at a time):\n\nSNOWFLAKE extension on a dataset, a table metric {metrics: [BUDGET_QTY_EXT]}:\n  import: Semantic view was successfully created from OSI YAML.\n  applied: DESCRIBE lists metric BUDGET_QTY_EXT\n\nSNOWFLAKE extension on a field, {access_modifier: private_access} on sales_qty:\n  import: Semantic view was successfully created from OSI YAML.\n  kept in the export: True; applied: False (DESCRIBE: FACT SALES_QTY FACT_SALES ACCESS_MODIFIER PUBLIC)\n\nPOWER_BI extension on a metric, {formatString: #,##0}:\n  import: Semantic view was successfully created from OSI YAML.\n  kept in the export: False; no warning",
  "fabric_export": "Fabric semantic views API (beta), lakehouse ossie:\n\nGET list the semantic views: HTTP 200 {\"data\": [{\"name\": \"dax_context\"}]}\nGET read the semantic view dax_context: HTTP 404 EntityNotFound: The requested resource could not be found\n\nThe API publishes a view into a semantic model; it has no call that writes a model back out as Ossie.",
  "dbx_export": "On the SQL warehouse (2x-small):\n\nSELECT * FROM export_to_ossie(TABLE(databricks_ne.ossie_demo.sales_mv))\n  [EXPORT_TO_OSSIE.FEATURE_DISABLED] Cannot read Apache Ossie YAML from the metric view. The export_to_ossie function is disabled. Please make sure \"spark.databricks.sql.metricView.exportToOssie.enabled\" is set to true. SQLSTATE: 42K0E == SQL == SELECT * FROM export_to_ossie(TABLE(databricks_ne.ossie_demo.sales_mv))\n\nSET spark.databricks.sql.metricView.exportToOssie.enabled = true\n  [CONFIG_NOT_AVAILABLE.WITHOUT_SUGGESTION] Configuration spark.databricks.sql.metricView.exportToOssie.enabled is not available. SQLSTATE: 42K0I",
  "fabric_version": "version: 0.2.0.dev0",
  "sf_export_version": "version: 0.1.1",
  "daxsql_q09": "WITH f5 AS MATERIALIZED (SELECT j6.\"country\" AS \"g0\", SUM(t2.\"sales_qty\") FILTER (WHERE (((j4.\"customer\" <> 'Tesco' OR j4.\"customer\" IS NULL)))) AS \"a0\", SUM(t2.\"sales_qty\") AS \"a1\" FROM read_parquet('data/fact_sales.parquet') AS t2 LEFT JOIN read_parquet('data/dim_calendar.parquet') AS j3 ON j3.\"date_key\" = t2.\"sale_date\" LEFT JOIN read_parquet('data/dim_store.parquet') AS j4 ON j4.\"store_id\" = t2.\"store_id\" LEFT JOIN read_parquet('data/dim_country.parquet') AS j6 ON j6.\"country\" = j4.\"country\" WHERE ((j3.\"month_start\" = DATE '2021-02-01')) GROUP BY j6.\"country\"),\nf13 AS (SELECT j15.\"country\" AS \"g0\", SUM(t9.\"sales_qty\") AS \"a0\" FROM read_parquet('data/fact_sales.parquet') AS t9 LEFT JOIN read_parquet('data/dim_calendar.parquet') AS j12 ON j12.\"date_key\" = t9.\"sale_date\" LEFT JOIN read_parquet('data/dim_store.parquet') AS j14 ON j14.\"store_id\" = t9.\"store_id\" LEFT JOIN read_parquet('data/dim_country.parquet') AS j15 ON j15.\"country\" = j14.\"country\" WHERE j12.\"year\" IN (SELECT r11.\"year\" FROM (SELECT DISTINCT t10.\"year\" FROM read_parquet('data/dim_calendar.parquet') AS t10 WHERE ((t10.\"month_start\" = DATE '2021-02-01'))) AS r11) GROUP BY j15.\"country\"),\nf22 AS (SELECT SUM(f5.a0) AS a0 FROM f5),\nf25 AS (SELECT SUM(t23.\"sales_qty\") FILTER (WHERE (((j24.\"month_start\" = DATE '2021-02-01')))) AS \"a0\", SUM(t23.\"sales_qty\") FILTER (WHERE (j41.\"country\" IN (SELECT r39.\"country\" FROM (SELECT DISTINCT t38.\"country\" FROM read_parquet('data/dim_country.parquet') AS t38) AS r39)) AND (j24.\"year\" IN (SELECT r43.\"year\" FROM (SELECT DISTINCT t42.\"year\" FROM read_parquet('data/dim_calendar.parquet') AS t42 WHERE ((t42.\"month_start\" = DATE '2021-02-01'))) AS r43))) AS \"a1\" FROM read_parquet('data/fact_sales.parquet') AS t23 LEFT JOIN read_parquet('data/dim_calendar.parquet') AS j24 ON j24.\"date_key\" = t23.\"sale_date\" LEFT JOIN read_parquet('data/dim_store.parquet') AS j40 ON j40.\"store_id\" = t23.\"store_id\" LEFT JOIN read_parquet('data/dim_country.parquet') AS j41 ON j41.\"country\" = j40.\"country\")\nSELECT q46.\"country\" AS \"country\", q46.\"is_total\" AS \"is_total\", CAST(q46.\"sales_quantity\" AS BIGINT) AS \"sales_quantity\", CAST(q46.\"country_qty_all_customers\" AS BIGINT) AS \"country_qty_all_customers\", CAST(q46.\"country_total_fixed\" AS BIGINT) AS \"country_total_fixed\" FROM (SELECT s45.\"country\", s45.\"is_total\", s45.\"sales_quantity\", s45.\"country_qty_all_customers\", s45.\"country_total_fixed\" FROM (SELECT * FROM (SELECT k1.\"country\" AS \"country\", FALSE AS \"is_total\", f5.a0 AS \"sales_quantity\", f5.a1 AS \"country_qty_all_customers\", CASE WHEN (EXISTS (SELECT t16.\"country\" FROM read_parquet('data/dim_country.parquet') AS t16 WHERE t16.\"country\" = k1.\"country\")) THEN f13.a0 END AS \"country_total_fixed\" FROM (SELECT f5.g0 AS \"country\" FROM f5 UNION SELECT f13.g0 AS \"country\" FROM f13) AS k1 LEFT JOIN f5 ON f5.g0 IS NOT DISTINCT FROM k1.\"country\" LEFT JOIN f13 ON f13.g0 IS NOT DISTINCT FROM k1.\"country\") AS z17 WHERE z17.\"sales_quantity\" IS NOT NULL OR z17.\"country_qty_all_customers\" IS NOT NULL OR z17.\"country_total_fixed\" IS NOT NULL UNION ALL SELECT * FROM (SELECT NULL AS \"country\", TRUE AS \"is_total\", f22.a0 AS \"sales_quantity\", f25.a0 AS \"country_qty_all_customers\", f25.a1 AS \"country_total_fixed\" FROM (SELECT 1 AS one) AS k18 LEFT JOIN f22 ON TRUE LEFT JOIN f25 ON TRUE) AS z44 WHERE z44.\"sales_quantity\" IS NOT NULL OR z44.\"country_qty_all_customers\" IS NOT NULL OR z44.\"country_total_fixed\" IS NOT NULL) AS s45) AS q46 ORDER BY q46.\"is_total\" ASC NULLS FIRST, q46.\"country\" ASC NULLS FIRST"
 },
 "questions": [
  {
   "id": "q01",
   "folder": "q01_sales_by_country_year",
   "title": "Sales by country and year",
   "text": "The warm-up: one measure, two dimensions from two tables (country, year). Every platform should agree.",
   "columns": [
    "country",
    "year",
    "sales_quantity"
   ],
   "measures": [
    false,
    false,
    true
   ],
   "reference": {
    "rows": [
     [
      "Germany",
      "2020",
      "33714072"
     ],
     [
      "Germany",
      "2021",
      "36203407"
     ],
     [
      "Germany",
      "2022",
      "38577436"
     ],
     [
      "Poland",
      "2020",
      "28584270"
     ],
     [
      "Poland",
      "2021",
      "30755062"
     ],
     [
      "Poland",
      "2022",
      "32717852"
     ],
     [
      "UK",
      "2020",
      "20499603"
     ],
     [
      "UK",
      "2021",
      "22111689"
     ],
     [
      "UK",
      "2022",
      "23496958"
     ]
    ]
   },
   "runs": [
    {
     "label": "fabric",
     "platform": "fabric",
     "file": "fabric.dax",
     "code": "EVALUATE\nSUMMARIZECOLUMNS (\n    dim_country[country],\n    dim_calendar[year],\n    FILTER ( ALL ( dim_calendar[year] ), dim_calendar[year] <= 2022 ),\n    \"sales_quantity\", [sales_quantity]\n)\nORDER BY dim_country[country], dim_calendar[year]",
     "status": "match",
     "rows": [
      [
       "Germany",
       "2020",
       "33714072"
      ],
      [
       "Germany",
       "2021",
       "36203407"
      ],
      [
       "Germany",
       "2022",
       "38577436"
      ],
      [
       "Poland",
       "2020",
       "28584270"
      ],
      [
       "Poland",
       "2021",
       "30755062"
      ],
      [
       "Poland",
       "2022",
       "32717852"
      ],
      [
       "UK",
       "2020",
       "20499603"
      ],
      [
       "UK",
       "2021",
       "22111689"
      ],
      [
       "UK",
       "2022",
       "23496958"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake",
     "platform": "snowflake",
     "file": "snowflake.sql",
     "code": "SELECT country, year, AGG(sales_quantity) AS sales_quantity\nFROM DAX_DEMO.MODEL.SEMANTIC_VIEW\nWHERE year <= 2022\nGROUP BY ALL\nORDER BY country, year",
     "status": "match",
     "rows": [
      [
       "Germany",
       "2020",
       "33714072"
      ],
      [
       "Germany",
       "2021",
       "36203407"
      ],
      [
       "Germany",
       "2022",
       "38577436"
      ],
      [
       "Poland",
       "2020",
       "28584270"
      ],
      [
       "Poland",
       "2021",
       "30755062"
      ],
      [
       "Poland",
       "2022",
       "32717852"
      ],
      [
       "UK",
       "2020",
       "20499603"
      ],
      [
       "UK",
       "2021",
       "22111689"
      ],
      [
       "UK",
       "2022",
       "23496958"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx",
     "platform": "dbx",
     "file": "dbx.sql",
     "code": "SELECT country, year, AGG(sales_quantity) AS sales_quantity\nFROM databricks_ne.ossie_demo.sales_mv\nWHERE year <= 2022\nGROUP BY ALL\nORDER BY country, year",
     "status": "match",
     "rows": [
      [
       "Germany",
       "2020",
       "33714072"
      ],
      [
       "Germany",
       "2021",
       "36203407"
      ],
      [
       "Germany",
       "2022",
       "38577436"
      ],
      [
       "Poland",
       "2020",
       "28584270"
      ],
      [
       "Poland",
       "2021",
       "30755062"
      ],
      [
       "Poland",
       "2022",
       "32717852"
      ],
      [
       "UK",
       "2020",
       "20499603"
      ],
      [
       "UK",
       "2021",
       "22111689"
      ],
      [
       "UK",
       "2022",
       "23496958"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery",
     "platform": "bigquery",
     "file": "bigquery.sql",
     "code": "SELECT country_country AS country, calendar_year AS year, AGG(sales_sales_quantity) AS sales_quantity\nFROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\nWHERE calendar_year <= 2022\nGROUP BY ALL\nORDER BY country, year",
     "status": "match",
     "rows": [
      [
       "Germany",
       "2020",
       "33714072"
      ],
      [
       "Germany",
       "2021",
       "36203407"
      ],
      [
       "Germany",
       "2022",
       "38577436"
      ],
      [
       "Poland",
       "2020",
       "28584270"
      ],
      [
       "Poland",
       "2021",
       "30755062"
      ],
      [
       "Poland",
       "2022",
       "32717852"
      ],
      [
       "UK",
       "2020",
       "20499603"
      ],
      [
       "UK",
       "2021",
       "22111689"
      ],
      [
       "UK",
       "2022",
       "23496958"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "daxsql",
     "platform": "daxsql",
     "file": "daxsql.sql",
     "code": "SELECT dim_country.country, dim_calendar.year, AGG(sales_quantity) AS sales_quantity\nFROM model\nWHERE dim_calendar.year <= 2022\nGROUP BY ALL\nORDER BY country, year",
     "status": "reference",
     "rows": [
      [
       "Germany",
       "2020",
       "33714072"
      ],
      [
       "Germany",
       "2021",
       "36203407"
      ],
      [
       "Germany",
       "2022",
       "38577436"
      ],
      [
       "Poland",
       "2020",
       "28584270"
      ],
      [
       "Poland",
       "2021",
       "30755062"
      ],
      [
       "Poland",
       "2022",
       "32717852"
      ],
      [
       "UK",
       "2020",
       "20499603"
      ],
      [
       "UK",
       "2021",
       "22111689"
      ],
      [
       "UK",
       "2022",
       "23496958"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match",
    "dbx": "match",
    "bigquery": "match",
    "daxsql": "reference"
   }
  },
  {
   "id": "q02",
   "folder": "q02_top10_products_2021",
   "title": "Top 10 products by sales, 2021",
   "text": "Top N: rank on a measure, keep 10 rows.",
   "columns": [
    "product_name",
    "sales_quantity"
   ],
   "measures": [
    false,
    true
   ],
   "reference": {
    "rows": [
     [
      "Persil SKU 5",
      "2241203"
     ],
     [
      "Tide SKU 5",
      "2236090"
     ],
     [
      "Signal SKU 5",
      "2235736"
     ],
     [
      "Signal SKU 1",
      "2235406"
     ],
     [
      "Signal SKU 3",
      "2234314"
     ],
     [
      "Persil SKU 1",
      "2233483"
     ],
     [
      "Persil SKU 3",
      "2231938"
     ],
     [
      "Dove SKU 4",
      "2231607"
     ],
     [
      "Oral-B SKU 1",
      "2231300"
     ],
     [
      "Dove SKU 3",
      "2231090"
     ]
    ]
   },
   "runs": [
    {
     "label": "fabric",
     "platform": "fabric",
     "file": "fabric.dax",
     "code": "EVALUATE\nTOPN (\n    10,\n    SUMMARIZECOLUMNS (\n        dim_product[product_name],\n        TREATAS ( { 2021 }, dim_calendar[year] ),\n        \"sales_quantity\", [sales_quantity]\n    ),\n    [sales_quantity], DESC\n)\nORDER BY [sales_quantity] DESC",
     "status": "match",
     "rows": [
      [
       "Persil SKU 5",
       "2241203"
      ],
      [
       "Tide SKU 5",
       "2236090"
      ],
      [
       "Signal SKU 5",
       "2235736"
      ],
      [
       "Signal SKU 1",
       "2235406"
      ],
      [
       "Signal SKU 3",
       "2234314"
      ],
      [
       "Persil SKU 1",
       "2233483"
      ],
      [
       "Persil SKU 3",
       "2231938"
      ],
      [
       "Dove SKU 4",
       "2231607"
      ],
      [
       "Oral-B SKU 1",
       "2231300"
      ],
      [
       "Dove SKU 3",
       "2231090"
      ]
     ],
     "diff": [
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake",
     "platform": "snowflake",
     "file": "snowflake.sql",
     "code": "SELECT product_name, AGG(sales_quantity) AS sales_quantity\nFROM DAX_DEMO.MODEL.SEMANTIC_VIEW\nWHERE year = 2021\nGROUP BY ALL\nORDER BY sales_quantity DESC\nLIMIT 10",
     "status": "match",
     "rows": [
      [
       "Persil SKU 5",
       "2241203"
      ],
      [
       "Tide SKU 5",
       "2236090"
      ],
      [
       "Signal SKU 5",
       "2235736"
      ],
      [
       "Signal SKU 1",
       "2235406"
      ],
      [
       "Signal SKU 3",
       "2234314"
      ],
      [
       "Persil SKU 1",
       "2233483"
      ],
      [
       "Persil SKU 3",
       "2231938"
      ],
      [
       "Dove SKU 4",
       "2231607"
      ],
      [
       "Oral-B SKU 1",
       "2231300"
      ],
      [
       "Dove SKU 3",
       "2231090"
      ]
     ],
     "diff": [
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx",
     "platform": "dbx",
     "file": "dbx.sql",
     "code": "SELECT product_name, AGG(sales_quantity) AS sales_quantity\nFROM databricks_ne.ossie_demo.sales_mv\nWHERE year = 2021\nGROUP BY ALL\nORDER BY sales_quantity DESC\nLIMIT 10",
     "status": "match",
     "rows": [
      [
       "Persil SKU 5",
       "2241203"
      ],
      [
       "Tide SKU 5",
       "2236090"
      ],
      [
       "Signal SKU 5",
       "2235736"
      ],
      [
       "Signal SKU 1",
       "2235406"
      ],
      [
       "Signal SKU 3",
       "2234314"
      ],
      [
       "Persil SKU 1",
       "2233483"
      ],
      [
       "Persil SKU 3",
       "2231938"
      ],
      [
       "Dove SKU 4",
       "2231607"
      ],
      [
       "Oral-B SKU 1",
       "2231300"
      ],
      [
       "Dove SKU 3",
       "2231090"
      ]
     ],
     "diff": [
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery",
     "platform": "bigquery",
     "file": "bigquery.sql",
     "code": "SELECT product_product_name AS product_name, AGG(sales_sales_quantity) AS sales_quantity\nFROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\nWHERE calendar_year = 2021\nGROUP BY ALL\nORDER BY sales_quantity DESC\nLIMIT 10",
     "status": "match",
     "rows": [
      [
       "Persil SKU 5",
       "2241203"
      ],
      [
       "Tide SKU 5",
       "2236090"
      ],
      [
       "Signal SKU 5",
       "2235736"
      ],
      [
       "Signal SKU 1",
       "2235406"
      ],
      [
       "Signal SKU 3",
       "2234314"
      ],
      [
       "Persil SKU 1",
       "2233483"
      ],
      [
       "Persil SKU 3",
       "2231938"
      ],
      [
       "Dove SKU 4",
       "2231607"
      ],
      [
       "Oral-B SKU 1",
       "2231300"
      ],
      [
       "Dove SKU 3",
       "2231090"
      ]
     ],
     "diff": [
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "daxsql",
     "platform": "daxsql",
     "file": "daxsql.sql",
     "code": "SELECT dim_product.product_name, AGG(sales_quantity) AS sales_quantity\nFROM model\nWHERE dim_calendar.year = 2021\nGROUP BY ALL\nORDER BY sales_quantity DESC\nLIMIT 10",
     "status": "reference",
     "rows": [
      [
       "Persil SKU 5",
       "2241203"
      ],
      [
       "Tide SKU 5",
       "2236090"
      ],
      [
       "Signal SKU 5",
       "2235736"
      ],
      [
       "Signal SKU 1",
       "2235406"
      ],
      [
       "Signal SKU 3",
       "2234314"
      ],
      [
       "Persil SKU 1",
       "2233483"
      ],
      [
       "Persil SKU 3",
       "2231938"
      ],
      [
       "Dove SKU 4",
       "2231607"
      ],
      [
       "Oral-B SKU 1",
       "2231300"
      ],
      [
       "Dove SKU 3",
       "2231090"
      ]
     ],
     "diff": [
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ]
     ],
     "missing": []
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match",
    "dbx": "match",
    "bigquery": "match",
    "daxsql": "reference"
   }
  },
  {
   "id": "q03",
   "folder": "q03_last_year_by_day",
   "title": "Sales vs last year, by day (Feb 25 - Mar 3, 2021)",
   "text": "Last year at the date grain. Watch Feb 28, 2021: 2020 was a leap year, so \"last year\" of Feb 28 is either Feb 28, 2020 alone, or Feb 28 + Feb 29. The reference takes the first: the same calendar date one year earlier. - DAX: `SAMEPERIODLASTYEAR` (shifts the date filter). - Snowflake: `sales_qty_ly` sums `sales_ly`, a copy of the fact whose date key is moved forward one year, which puts Feb 29, 2020 on Feb 28, 2021. Another copy that drops Feb 29 (`sales_ly_day`) matches the reference. - Databricks: a window on `date_key` with `offset: -1 year`. - BigQuery: no last-year measure (a measure can't shift dates). `bigquery_workaround.sql` adds a second `GRAPH_EXPAND` over last year's days, joined on the date a year back, so Feb 29, 2020 drops out.",
   "columns": [
    "date_key",
    "sales_quantity",
    "sales_qty_ly"
   ],
   "measures": [
    false,
    true,
    true
   ],
   "reference": {
    "rows": [
     [
      "2021-02-25",
      "286490",
      "266431"
     ],
     [
      "2021-02-26",
      "283269",
      "260203"
     ],
     [
      "2021-02-27",
      "285994",
      "266208"
     ],
     [
      "2021-02-28",
      "288291",
      "262565"
     ],
     [
      "2021-03-01",
      "284680",
      "264495"
     ],
     [
      "2021-03-02",
      "283910",
      "269724"
     ],
     [
      "2021-03-03",
      "284445",
      "267063"
     ]
    ]
   },
   "runs": [
    {
     "label": "fabric",
     "platform": "fabric",
     "file": "fabric.dax",
     "code": "EVALUATE\nSUMMARIZECOLUMNS (\n    dim_calendar[date_key],\n    FILTER (\n        ALL ( dim_calendar[date_key] ),\n        dim_calendar[date_key] >= DATE ( 2021, 2, 25 ) && dim_calendar[date_key] <= DATE ( 2021, 3, 3 )\n    ),\n    \"sales_quantity\", [sales_quantity],\n    \"sales_qty_ly\", [sales_qty_ly]\n)\nORDER BY dim_calendar[date_key]",
     "status": "match",
     "rows": [
      [
       "2021-02-25",
       "286490",
       "266431"
      ],
      [
       "2021-02-26",
       "283269",
       "260203"
      ],
      [
       "2021-02-27",
       "285994",
       "266208"
      ],
      [
       "2021-02-28",
       "288291",
       "262565"
      ],
      [
       "2021-03-01",
       "284680",
       "264495"
      ],
      [
       "2021-03-02",
       "283910",
       "269724"
      ],
      [
       "2021-03-03",
       "284445",
       "267063"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake",
     "platform": "snowflake",
     "file": "snowflake.sql",
     "code": "SELECT date_key, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly\nFROM DAX_DEMO.MODEL.SEMANTIC_VIEW\nWHERE date_key BETWEEN DATE '2021-02-25' AND DATE '2021-03-03'\nGROUP BY ALL\nORDER BY date_key",
     "status": "differs",
     "rows": [
      [
       "2021-02-25",
       "286490",
       "266431"
      ],
      [
       "2021-02-26",
       "283269",
       "260203"
      ],
      [
       "2021-02-27",
       "285994",
       "266208"
      ],
      [
       "2021-02-28",
       "288291",
       "528780"
      ],
      [
       "2021-03-01",
       "284680",
       "264495"
      ],
      [
       "2021-03-02",
       "283910",
       "269724"
      ],
      [
       "2021-03-03",
       "284445",
       "267063"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       true
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake (workaround)",
     "platform": "snowflake",
     "file": "snowflake_workaround.sql",
     "code": "-- Another copy of the fact (sales_ly_day) whose shifted date drops Feb 29: one more logical table, four more relationships.\nSELECT date_key, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly_day) AS sales_qty_ly\nFROM DAX_DEMO.MODEL.SEMANTIC_VIEW\nWHERE date_key BETWEEN DATE '2021-02-25' AND DATE '2021-03-03'\nGROUP BY ALL\nORDER BY date_key",
     "status": "match",
     "rows": [
      [
       "2021-02-25",
       "286490",
       "266431"
      ],
      [
       "2021-02-26",
       "283269",
       "260203"
      ],
      [
       "2021-02-27",
       "285994",
       "266208"
      ],
      [
       "2021-02-28",
       "288291",
       "262565"
      ],
      [
       "2021-03-01",
       "284680",
       "264495"
      ],
      [
       "2021-03-02",
       "283910",
       "269724"
      ],
      [
       "2021-03-03",
       "284445",
       "267063"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx",
     "platform": "dbx",
     "file": "dbx.sql",
     "code": "SELECT date_key, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly\nFROM databricks_ne.ossie_demo.sales_mv\nWHERE date_key BETWEEN DATE '2021-02-25' AND DATE '2021-03-03'\nGROUP BY ALL\nORDER BY date_key",
     "status": "match",
     "rows": [
      [
       "2021-02-25",
       "286490",
       "266431"
      ],
      [
       "2021-02-26",
       "283269",
       "260203"
      ],
      [
       "2021-02-27",
       "285994",
       "266208"
      ],
      [
       "2021-02-28",
       "288291",
       "262565"
      ],
      [
       "2021-03-01",
       "284680",
       "264495"
      ],
      [
       "2021-03-02",
       "283910",
       "269724"
      ],
      [
       "2021-03-03",
       "284445",
       "267063"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery",
     "platform": "bigquery",
     "file": "bigquery.sql",
     "code": "-- The graph has no last-year measure: a measure can't shift dates or hold a window.\nSELECT calendar_date_key AS date_key, AGG(sales_sales_quantity) AS sales_quantity\nFROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\nWHERE calendar_date_key BETWEEN DATE '2021-02-25' AND DATE '2021-03-03'\nGROUP BY ALL\nORDER BY date_key",
     "status": "partial",
     "rows": [
      [
       "2021-02-25",
       "286490",
       ""
      ],
      [
       "2021-02-26",
       "283269",
       ""
      ],
      [
       "2021-02-27",
       "285994",
       ""
      ],
      [
       "2021-02-28",
       "288291",
       ""
      ],
      [
       "2021-03-01",
       "284680",
       ""
      ],
      [
       "2021-03-02",
       "283910",
       ""
      ],
      [
       "2021-03-03",
       "284445",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       true
      ],
      [
       false,
       false,
       true
      ],
      [
       false,
       false,
       true
      ],
      [
       false,
       false,
       true
      ],
      [
       false,
       false,
       true
      ],
      [
       false,
       false,
       true
      ],
      [
       false,
       false,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery (workaround)",
     "platform": "bigquery",
     "file": "bigquery_workaround.sql",
     "code": "-- Last year in the query: a second GRAPH_EXPAND over last year's days, joined on the date a year back.\n-- Joined that way, Feb 29 2020 has no day a year later and drops out, as in DAX.\nWITH cur AS (\n    SELECT calendar_date_key AS d, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_date_key BETWEEN DATE '2021-02-25' AND DATE '2021-03-03'\n    GROUP BY ALL\n), ly AS (\n    SELECT calendar_date_key AS d, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_date_key BETWEEN DATE '2020-02-25' AND DATE '2020-03-03'\n    GROUP BY ALL\n)\nSELECT cur.d AS date_key, cur.q AS sales_quantity, ly.q AS sales_qty_ly\nFROM cur LEFT JOIN ly ON ly.d = DATE_SUB(cur.d, INTERVAL 1 YEAR)\nORDER BY date_key",
     "status": "match",
     "rows": [
      [
       "2021-02-25",
       "286490",
       "266431"
      ],
      [
       "2021-02-26",
       "283269",
       "260203"
      ],
      [
       "2021-02-27",
       "285994",
       "266208"
      ],
      [
       "2021-02-28",
       "288291",
       "262565"
      ],
      [
       "2021-03-01",
       "284680",
       "264495"
      ],
      [
       "2021-03-02",
       "283910",
       "269724"
      ],
      [
       "2021-03-03",
       "284445",
       "267063"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "daxsql",
     "platform": "daxsql",
     "file": "daxsql.sql",
     "code": "SELECT dim_calendar.date_key, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly\nFROM model\nWHERE dim_calendar.date_key BETWEEN DATE '2021-02-25' AND DATE '2021-03-03'\nGROUP BY ALL\nORDER BY date_key",
     "status": "reference",
     "rows": [
      [
       "2021-02-25",
       "286490",
       "266431"
      ],
      [
       "2021-02-26",
       "283269",
       "260203"
      ],
      [
       "2021-02-27",
       "285994",
       "266208"
      ],
      [
       "2021-02-28",
       "288291",
       "262565"
      ],
      [
       "2021-03-01",
       "284680",
       "264495"
      ],
      [
       "2021-03-02",
       "283910",
       "269724"
      ],
      [
       "2021-03-03",
       "284445",
       "267063"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "**differs**: Feb 28 gets Feb 28 + Feb 29. Matches with another copy of the fact, without Feb 29 (`sales_ly_day`). Both use a copy of the fact with the date moved a year (`sales_ly`).",
    "dbx": "match",
    "bigquery": "**partial**: no last-year measure (a measure can't shift dates or hold a window). Matches with a second `GRAPH_EXPAND` over last year's days, joined in the query.",
    "daxsql": "reference"
   }
  },
  {
   "id": "q04",
   "folder": "q04_last_year_by_month",
   "title": "Sales vs last year, by month (Jan - Apr 2021), with a total",
   "text": "The same \"last year\" measure as q03, asked by month. A semantic layer should give each month's last-year total. - Total row: DAX `ROLLUPADDISSUBTOTAL`; Databricks `GROUP BY ROLLUP`; Snowflake refuses ROLLUP in a semantic query (\"GROUPING SETS/CUBE/ROLLUP is not supported within semantic query blocks\"), so its total is a second query; BigQuery refuses ROLLUP with `AGG`, so its total is a second query too. - Databricks: the day-grain window measure returns one day's value per month, with no error. `dbx_per_grain.sql` uses a second measure ordered by month: the months match, the total repeats the last month. `dbx_workaround.sql` uses a second view of the fact with its date moved a year, joined in the query: it matches. - BigQuery: no last-year measure. `bigquery_workaround.sql` adds a second `GRAPH_EXPAND` over last year's months, moved a year, joined in the query.",
   "columns": [
    "month_start",
    "sales_quantity",
    "sales_qty_ly",
    "sales_qty_yoy_pct"
   ],
   "measures": [
    false,
    true,
    true,
    true
   ],
   "reference": {
    "rows": [
     [
      "2021-01-01",
      "7988145",
      "7397227",
      "0.0798837185881"
     ],
     [
      "2021-02-01",
      "7782865",
      "7500387",
      "0.037661789985"
     ],
     [
      "2021-03-01",
      "8975512",
      "8366772",
      "0.0727568529416"
     ],
     [
      "2021-04-01",
      "8731733",
      "8069044",
      "0.0821273251205"
     ],
     [
      "",
      "33478255",
      "31333430",
      "0.0684516505215"
     ]
    ]
   },
   "runs": [
    {
     "label": "fabric",
     "platform": "fabric",
     "file": "fabric.dax",
     "code": "EVALUATE\nSUMMARIZECOLUMNS (\n    ROLLUPADDISSUBTOTAL ( dim_calendar[month_start], \"is_total\" ),\n    FILTER (\n        ALL ( dim_calendar[month_start] ),\n        dim_calendar[month_start] >= DATE ( 2021, 1, 1 ) && dim_calendar[month_start] <= DATE ( 2021, 4, 1 )\n    ),\n    \"sales_quantity\", [sales_quantity],\n    \"sales_qty_ly\", [sales_qty_ly],\n    \"sales_qty_yoy_pct\", [sales_qty_yoy_pct]\n)\nORDER BY [is_total], dim_calendar[month_start]",
     "status": "match",
     "rows": [
      [
       "2021-01-01",
       "7988145",
       "7397227",
       "0.0798837185881"
      ],
      [
       "2021-02-01",
       "7782865",
       "7500387",
       "0.037661789985"
      ],
      [
       "2021-03-01",
       "8975512",
       "8366772",
       "0.0727568529416"
      ],
      [
       "2021-04-01",
       "8731733",
       "8069044",
       "0.0821273251205"
      ],
      [
       "",
       "33478255",
       "31333430",
       "0.0684516505215"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake",
     "platform": "snowflake",
     "file": "snowflake.sql",
     "code": "SELECT * FROM (\n    SELECT month_start, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly, AGG(sales_qty_yoy_pct) AS sales_qty_yoy_pct\n    FROM DAX_DEMO.MODEL.SEMANTIC_VIEW\n    WHERE month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'\n    GROUP BY ALL\n    UNION ALL\n    SELECT NULL, AGG(sales_quantity), AGG(sales_qty_ly), AGG(sales_qty_yoy_pct)\n    FROM DAX_DEMO.MODEL.SEMANTIC_VIEW\n    WHERE month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'\n)\nORDER BY month_start NULLS LAST",
     "status": "match",
     "rows": [
      [
       "2021-01-01",
       "7988145",
       "7397227",
       "0.079884"
      ],
      [
       "2021-02-01",
       "7782865",
       "7500387",
       "0.037662"
      ],
      [
       "2021-03-01",
       "8975512",
       "8366772",
       "0.072757"
      ],
      [
       "2021-04-01",
       "8731733",
       "8069044",
       "0.082127"
      ],
      [
       "",
       "33478255",
       "31333430",
       "0.068452"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx",
     "platform": "dbx",
     "file": "dbx.sql",
     "code": "SELECT month_start, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly,\n       AGG(sales_qty_yoy_pct) AS sales_qty_yoy_pct\nFROM databricks_ne.ossie_demo.sales_mv\nWHERE month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'\nGROUP BY ROLLUP (month_start)\nORDER BY month_start NULLS LAST",
     "status": "differs",
     "rows": [
      [
       "2021-01-01",
       "7988145",
       "249581",
       "31.006222428790654"
      ],
      [
       "2021-02-01",
       "7782865",
       "262565",
       "28.64166968179308"
      ],
      [
       "2021-03-01",
       "8975512",
       "272077",
       "31.988867122174973"
      ],
      [
       "2021-04-01",
       "8731733",
       "267082",
       "31.69307927902292"
      ],
      [
       "",
       "33478255",
       "267082",
       "124.34822638740162"
      ]
     ],
     "diff": [
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx (per grain)",
     "platform": "dbx",
     "file": "dbx_per_grain.sql",
     "code": "-- A second \"last year\" measure, ordered by month_start (offset -12 month): one measure per grain.\n-- The months are right; the total row repeats the last month's value (a window measure keeps the last period).\nSELECT month_start, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly_month) AS sales_qty_ly,\n       (AGG(sales_quantity) - AGG(sales_qty_ly_month)) / AGG(sales_qty_ly_month) AS sales_qty_yoy_pct\nFROM databricks_ne.ossie_demo.sales_mv\nWHERE month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'\nGROUP BY ROLLUP (month_start)\nORDER BY month_start NULLS LAST",
     "status": "differs",
     "rows": [
      [
       "2021-01-01",
       "7988145",
       "7397227",
       "0.0798837185880601"
      ],
      [
       "2021-02-01",
       "7782865",
       "7500387",
       "0.03766178998497011"
      ],
      [
       "2021-03-01",
       "8975512",
       "8366772",
       "0.07275685294161237"
      ],
      [
       "2021-04-01",
       "8731733",
       "8069044",
       "0.08212732512054711"
      ],
      [
       "",
       "33478255",
       "8069044",
       "3.1489741535676345"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       true,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx (workaround)",
     "platform": "dbx",
     "file": "dbx_workaround.sql",
     "code": "-- Last year as rows: sales_ly_mv is the fact with its date moved one year forward. Two views, joined by the query.\nWITH cur AS (\n    SELECT month_start, AGG(sales_quantity) AS sales_quantity FROM databricks_ne.ossie_demo.sales_mv WHERE month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01' GROUP BY ROLLUP (month_start)\n), ly AS (\n    SELECT month_start, AGG(sales_qty_ly) AS sales_qty_ly FROM databricks_ne.ossie_demo.sales_ly_mv WHERE month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01' GROUP BY ROLLUP (month_start)\n)\nSELECT COALESCE(cur.month_start, ly.month_start) AS month_start, cur.sales_quantity, ly.sales_qty_ly, (cur.sales_quantity - ly.sales_qty_ly) / ly.sales_qty_ly AS sales_qty_yoy_pct\nFROM cur FULL OUTER JOIN ly ON cur.month_start <=> ly.month_start\nORDER BY month_start NULLS LAST",
     "status": "match",
     "rows": [
      [
       "2021-01-01",
       "7988145",
       "7397227",
       "0.0798837185880601"
      ],
      [
       "2021-02-01",
       "7782865",
       "7500387",
       "0.03766178998497011"
      ],
      [
       "2021-03-01",
       "8975512",
       "8366772",
       "0.07275685294161237"
      ],
      [
       "2021-04-01",
       "8731733",
       "8069044",
       "0.08212732512054711"
      ],
      [
       "",
       "33478255",
       "31333430",
       "0.0684516505215037"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery",
     "platform": "bigquery",
     "file": "bigquery.sql",
     "code": "-- No last-year measure; the total row is a second query (ROLLUP is refused with AGG).\nSELECT * FROM (\n    SELECT calendar_month_start AS month_start, AGG(sales_sales_quantity) AS sales_quantity\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'\n    GROUP BY ALL\n    UNION ALL\n    SELECT NULL, AGG(sales_sales_quantity)\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'\n)\nORDER BY month_start NULLS LAST",
     "status": "partial",
     "rows": [
      [
       "2021-01-01",
       "7988145",
       "",
       ""
      ],
      [
       "2021-02-01",
       "7782865",
       "",
       ""
      ],
      [
       "2021-03-01",
       "8975512",
       "",
       ""
      ],
      [
       "2021-04-01",
       "8731733",
       "",
       ""
      ],
      [
       "",
       "33478255",
       "",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery (workaround)",
     "platform": "bigquery",
     "file": "bigquery_workaround.sql",
     "code": "-- Last year in the query: a second GRAPH_EXPAND over last year's months, moved a year; the total is a third part.\nWITH cur AS (\n    SELECT calendar_month_start AS m, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'\n    GROUP BY ALL\n), ly AS (\n    SELECT DATE_ADD(calendar_month_start, INTERVAL 1 YEAR) AS m, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_month_start BETWEEN DATE '2020-01-01' AND DATE '2020-04-01'\n    GROUP BY ALL\n), r AS (\n    SELECT cur.m, cur.q, ly.q AS qly FROM cur LEFT JOIN ly USING (m)\n    UNION ALL\n    SELECT NULL, (SELECT SUM(q) FROM cur), (SELECT SUM(q) FROM ly)\n)\nSELECT m AS month_start, q AS sales_quantity, qly AS sales_qty_ly, SAFE_DIVIDE(q - qly, qly) AS sales_qty_yoy_pct\nFROM r\nORDER BY month_start NULLS LAST",
     "status": "match",
     "rows": [
      [
       "2021-01-01",
       "7988145",
       "7397227",
       "0.0798837185881"
      ],
      [
       "2021-02-01",
       "7782865",
       "7500387",
       "0.037661789985"
      ],
      [
       "2021-03-01",
       "8975512",
       "8366772",
       "0.0727568529416"
      ],
      [
       "2021-04-01",
       "8731733",
       "8069044",
       "0.0821273251205"
      ],
      [
       "",
       "33478255",
       "31333430",
       "0.0684516505215"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "daxsql",
     "platform": "daxsql",
     "file": "daxsql.sql",
     "code": "SELECT dim_calendar.month_start, GROUPING(dim_calendar.month_start) AS is_total,\n       AGG(sales_quantity) AS sales_quantity,\n       AGG(sales_qty_ly) AS sales_qty_ly,\n       AGG(sales_qty_yoy_pct) AS sales_qty_yoy_pct\nFROM model\nWHERE dim_calendar.month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'\nGROUP BY ROLLUP(dim_calendar.month_start)\nORDER BY is_total, month_start",
     "status": "reference",
     "rows": [
      [
       "2021-01-01",
       "7988145",
       "7397227",
       "0.0798837185881"
      ],
      [
       "2021-02-01",
       "7782865",
       "7500387",
       "0.037661789985"
      ],
      [
       "2021-03-01",
       "8975512",
       "8366772",
       "0.0727568529416"
      ],
      [
       "2021-04-01",
       "8731733",
       "8069044",
       "0.0821273251205"
      ],
      [
       "",
       "33478255",
       "31333430",
       "0.0684516505215"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match, with `sales_ly`; the total row is a second query (no ROLLUP)",
    "dbx": "**differs**: each month gets one day's value. A measure per grain: months match, total differs. Matches with a second view of the shifted fact (`sales_ly_mv`), joined in the query.",
    "bigquery": "**partial**: no last-year measure; the total row is a second query (ROLLUP is refused with `AGG`). Matches with a second `GRAPH_EXPAND`, months moved a year, joined in the query.",
    "daxsql": "reference"
   }
  },
  {
   "id": "q05",
   "folder": "q05_last_year_by_year",
   "title": "Sales vs last year, by year (2020-2022), with a total",
   "text": "The same measure again, by year. Databricks: as q04. `dbx_per_grain.sql` uses a third measure ordered by year (years match, the total repeats the last year); `dbx_workaround.sql` uses the second view and matches.",
   "columns": [
    "year",
    "sales_quantity",
    "sales_qty_ly",
    "sales_qty_yoy_pct"
   ],
   "measures": [
    false,
    true,
    true,
    true
   ],
   "reference": {
    "rows": [
     [
      "2020",
      "82797945",
      "",
      ""
     ],
     [
      "2021",
      "89070158",
      "82797945",
      "0.075753244842"
     ],
     [
      "2022",
      "94792246",
      "89070158",
      "0.0642424817524"
     ],
     [
      "",
      "266660349",
      "171868103",
      "0.551540654405"
     ]
    ]
   },
   "runs": [
    {
     "label": "fabric",
     "platform": "fabric",
     "file": "fabric.dax",
     "code": "EVALUATE\nSUMMARIZECOLUMNS (\n    ROLLUPADDISSUBTOTAL ( dim_calendar[year], \"is_total\" ),\n    FILTER ( ALL ( dim_calendar[year] ), dim_calendar[year] <= 2022 ),\n    \"sales_quantity\", [sales_quantity],\n    \"sales_qty_ly\", [sales_qty_ly],\n    \"sales_qty_yoy_pct\", [sales_qty_yoy_pct]\n)\nORDER BY [is_total], dim_calendar[year]",
     "status": "match",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       ""
      ],
      [
       "2021",
       "89070158",
       "82797945",
       "0.075753244842"
      ],
      [
       "2022",
       "94792246",
       "89070158",
       "0.0642424817524"
      ],
      [
       "",
       "266660349",
       "171868103",
       "0.551540654405"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake",
     "platform": "snowflake",
     "file": "snowflake.sql",
     "code": "SELECT * FROM (\n    SELECT year, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly, AGG(sales_qty_yoy_pct) AS sales_qty_yoy_pct\n    FROM DAX_DEMO.MODEL.SEMANTIC_VIEW\n    WHERE year <= 2022\n    GROUP BY ALL\n    UNION ALL\n    SELECT NULL, AGG(sales_quantity), AGG(sales_qty_ly), AGG(sales_qty_yoy_pct)\n    FROM DAX_DEMO.MODEL.SEMANTIC_VIEW\n    WHERE year <= 2022\n)\nORDER BY year NULLS LAST",
     "status": "match",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       ""
      ],
      [
       "2021",
       "89070158",
       "82797945",
       "0.075753"
      ],
      [
       "2022",
       "94792246",
       "89070158",
       "0.064242"
      ],
      [
       "",
       "266660349",
       "171868103",
       "0.551541"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx",
     "platform": "dbx",
     "file": "dbx.sql",
     "code": "SELECT year, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly,\n       AGG(sales_qty_yoy_pct) AS sales_qty_yoy_pct\nFROM databricks_ne.ossie_demo.sales_mv\nWHERE year <= 2022\nGROUP BY ROLLUP (year)\nORDER BY year NULLS LAST",
     "status": "differs",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       ""
      ],
      [
       "2021",
       "89070158",
       "225216",
       "394.48770069622054"
      ],
      [
       "2022",
       "94792246",
       "243036",
       "389.03376454517024"
      ],
      [
       "",
       "266660349",
       "243036",
       "1096.2051424480323"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx (per grain)",
     "platform": "dbx",
     "file": "dbx_per_grain.sql",
     "code": "-- A third \"last year\" measure, ordered by year (offset -1): one measure per grain.\n-- The years are right; the total row repeats the last year's value (a window measure keeps the last period).\nSELECT year, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly_year) AS sales_qty_ly,\n       (AGG(sales_quantity) - AGG(sales_qty_ly_year)) / AGG(sales_qty_ly_year) AS sales_qty_yoy_pct\nFROM databricks_ne.ossie_demo.sales_mv\nWHERE year <= 2022\nGROUP BY ROLLUP (year)\nORDER BY year NULLS LAST",
     "status": "differs",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       ""
      ],
      [
       "2021",
       "89070158",
       "82797945",
       "0.07575324484200664"
      ],
      [
       "2022",
       "94792246",
       "89070158",
       "0.06424248175241813"
      ],
      [
       "",
       "266660349",
       "89070158",
       "1.9938236889621326"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       true,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx (workaround)",
     "platform": "dbx",
     "file": "dbx_workaround.sql",
     "code": "-- Last year as rows: sales_ly_mv is the fact with its date moved one year forward. Two views, joined by the query.\nWITH cur AS (\n    SELECT year, AGG(sales_quantity) AS sales_quantity FROM databricks_ne.ossie_demo.sales_mv WHERE year <= 2022 GROUP BY ROLLUP (year)\n), ly AS (\n    SELECT year, AGG(sales_qty_ly) AS sales_qty_ly FROM databricks_ne.ossie_demo.sales_ly_mv WHERE year <= 2022 GROUP BY ROLLUP (year)\n)\nSELECT COALESCE(cur.year, ly.year) AS year, cur.sales_quantity, ly.sales_qty_ly, (cur.sales_quantity - ly.sales_qty_ly) / ly.sales_qty_ly AS sales_qty_yoy_pct\nFROM cur FULL OUTER JOIN ly ON cur.year <=> ly.year\nORDER BY year NULLS LAST",
     "status": "match",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       ""
      ],
      [
       "2021",
       "89070158",
       "82797945",
       "0.07575324484200664"
      ],
      [
       "2022",
       "94792246",
       "89070158",
       "0.06424248175241813"
      ],
      [
       "",
       "266660349",
       "171868103",
       "0.5515406544051982"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery",
     "platform": "bigquery",
     "file": "bigquery.sql",
     "code": "-- No last-year measure; the total row is a second query (ROLLUP is refused with AGG).\nSELECT * FROM (\n    SELECT calendar_year AS year, AGG(sales_sales_quantity) AS sales_quantity\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_year <= 2022\n    GROUP BY ALL\n    UNION ALL\n    SELECT NULL, AGG(sales_sales_quantity)\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_year <= 2022\n)\nORDER BY year NULLS LAST",
     "status": "partial",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       ""
      ],
      [
       "2021",
       "89070158",
       "",
       ""
      ],
      [
       "2022",
       "94792246",
       "",
       ""
      ],
      [
       "",
       "266660349",
       "",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery (workaround)",
     "platform": "bigquery",
     "file": "bigquery_workaround.sql",
     "code": "-- Last year in the query: a second GRAPH_EXPAND, years moved by one; the total is a third part.\nWITH cur AS (\n    SELECT calendar_year AS y, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_year <= 2022\n    GROUP BY ALL\n), ly AS (\n    SELECT calendar_year + 1 AS y, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_year <= 2021\n    GROUP BY ALL\n), r AS (\n    SELECT cur.y, cur.q, ly.q AS qly FROM cur LEFT JOIN ly USING (y)\n    UNION ALL\n    SELECT NULL, (SELECT SUM(q) FROM cur), (SELECT SUM(q) FROM ly)\n)\nSELECT y AS year, q AS sales_quantity, qly AS sales_qty_ly, SAFE_DIVIDE(q - qly, qly) AS sales_qty_yoy_pct\nFROM r\nORDER BY year NULLS LAST",
     "status": "match",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       ""
      ],
      [
       "2021",
       "89070158",
       "82797945",
       "0.075753244842"
      ],
      [
       "2022",
       "94792246",
       "89070158",
       "0.0642424817524"
      ],
      [
       "",
       "266660349",
       "171868103",
       "0.551540654405"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "daxsql",
     "platform": "daxsql",
     "file": "daxsql.sql",
     "code": "SELECT dim_calendar.year, GROUPING(dim_calendar.year) AS is_total,\n       AGG(sales_quantity) AS sales_quantity,\n       AGG(sales_qty_ly) AS sales_qty_ly,\n       AGG(sales_qty_yoy_pct) AS sales_qty_yoy_pct\nFROM model\nWHERE dim_calendar.year <= 2022\nGROUP BY ROLLUP(dim_calendar.year)\nORDER BY is_total, year",
     "status": "reference",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       ""
      ],
      [
       "2021",
       "89070158",
       "82797945",
       "0.075753244842"
      ],
      [
       "2022",
       "94792246",
       "89070158",
       "0.0642424817524"
      ],
      [
       "",
       "266660349",
       "171868103",
       "0.551540654405"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match, with `sales_ly`; the total row is a second query",
    "dbx": "**differs**. A measure per grain: years match, total differs. Matches with `sales_ly_mv`, joined in the query.",
    "bigquery": "**partial**, as q04. Matches with a second `GRAPH_EXPAND`, years moved by one, joined in the query.",
    "daxsql": "reference"
   }
  },
  {
   "id": "q06",
   "folder": "q06_last_fiscal_year_by_period",
   "title": "Sales vs last fiscal year (4-4-5), by fiscal period",
   "text": "A 4-4-5 fiscal year is 52 weeks, so \"last fiscal year\" is 364 days back, by fiscal period (name and start date).",
   "columns": [
    "fiscal_period_name",
    "fiscal_period_start",
    "sales_quantity",
    "sales_qty_fly"
   ],
   "measures": [
    false,
    false,
    true,
    true
   ],
   "reference": {
    "rows": [
     [
      "FY2021 P02",
      "2021-01-25",
      "7670122",
      "7155035"
     ],
     [
      "FY2021 P03",
      "2021-02-22",
      "10088929",
      "9405334"
     ],
     [
      "FY2021 P04",
      "2021-03-29",
      "8170304",
      "7550820"
     ],
     [
      "FY2021 P05",
      "2021-04-26",
      "7922491",
      "7290218"
     ],
     [
      "FY2021 P06",
      "2021-05-24",
      "9156415",
      "8424597"
     ]
    ]
   },
   "runs": [
    {
     "label": "fabric",
     "platform": "fabric",
     "file": "fabric.dax",
     "code": "EVALUATE\nSUMMARIZECOLUMNS (\n    dim_calendar[fiscal_period_name],\n    dim_calendar[fiscal_period_start],\n    FILTER (\n        ALL ( dim_calendar[fiscal_period_start] ),\n        dim_calendar[fiscal_period_start] >= DATE ( 2021, 1, 25 ) && dim_calendar[fiscal_period_start] <= DATE ( 2021, 5, 24 )\n    ),\n    \"sales_quantity\", [sales_quantity],\n    \"sales_qty_fly\", [sales_qty_fly]\n)\nORDER BY dim_calendar[fiscal_period_start]",
     "status": "match",
     "rows": [
      [
       "FY2021 P02",
       "2021-01-25",
       "7670122",
       "7155035"
      ],
      [
       "FY2021 P03",
       "2021-02-22",
       "10088929",
       "9405334"
      ],
      [
       "FY2021 P04",
       "2021-03-29",
       "8170304",
       "7550820"
      ],
      [
       "FY2021 P05",
       "2021-04-26",
       "7922491",
       "7290218"
      ],
      [
       "FY2021 P06",
       "2021-05-24",
       "9156415",
       "8424597"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake",
     "platform": "snowflake",
     "file": "snowflake.sql",
     "code": "SELECT fiscal_period_name, fiscal_period_start, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_fly) AS sales_qty_fly\nFROM DAX_DEMO.MODEL.SEMANTIC_VIEW\nWHERE fiscal_period_start BETWEEN DATE '2021-01-25' AND DATE '2021-05-24'\nGROUP BY ALL\nORDER BY fiscal_period_start",
     "status": "match",
     "rows": [
      [
       "FY2021 P02",
       "2021-01-25",
       "7670122",
       "7155035"
      ],
      [
       "FY2021 P03",
       "2021-02-22",
       "10088929",
       "9405334"
      ],
      [
       "FY2021 P04",
       "2021-03-29",
       "8170304",
       "7550820"
      ],
      [
       "FY2021 P05",
       "2021-04-26",
       "7922491",
       "7290218"
      ],
      [
       "FY2021 P06",
       "2021-05-24",
       "9156415",
       "8424597"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx",
     "platform": "dbx",
     "file": "dbx.sql",
     "code": "SELECT fiscal_period_name, fiscal_period_start, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_fly) AS sales_qty_fly\nFROM databricks_ne.ossie_demo.sales_mv\nWHERE fiscal_period_start BETWEEN DATE '2021-01-25' AND DATE '2021-05-24'\nGROUP BY ALL\nORDER BY fiscal_period_start",
     "status": "differs",
     "rows": [
      [
       "FY2021 P02",
       "2021-01-25",
       "7670122",
       "264043"
      ],
      [
       "FY2021 P03",
       "2021-02-22",
       "10088929",
       "270452"
      ],
      [
       "FY2021 P04",
       "2021-03-29",
       "8170304",
       "268077"
      ],
      [
       "FY2021 P05",
       "2021-04-26",
       "7922491",
       "254412"
      ],
      [
       "FY2021 P06",
       "2021-05-24",
       "9156415",
       "227111"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx (workaround)",
     "platform": "dbx",
     "file": "dbx_workaround.sql",
     "code": "-- A second \"last fiscal year\" measure ordered by fiscal_period_start (offset -364 day), with range all over\n-- fiscal_period_name: one measure per grain.\nSELECT fiscal_period_name, fiscal_period_start, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_fly_period) AS sales_qty_fly\nFROM databricks_ne.ossie_demo.sales_mv\nWHERE fiscal_period_start BETWEEN DATE '2021-01-25' AND DATE '2021-05-24'\nGROUP BY ALL\nORDER BY fiscal_period_start",
     "status": "match",
     "rows": [
      [
       "FY2021 P02",
       "2021-01-25",
       "7670122",
       "7155035"
      ],
      [
       "FY2021 P03",
       "2021-02-22",
       "10088929",
       "9405334"
      ],
      [
       "FY2021 P04",
       "2021-03-29",
       "8170304",
       "7550820"
      ],
      [
       "FY2021 P05",
       "2021-04-26",
       "7922491",
       "7290218"
      ],
      [
       "FY2021 P06",
       "2021-05-24",
       "9156415",
       "8424597"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery",
     "platform": "bigquery",
     "file": "bigquery.sql",
     "code": "-- No last-fiscal-year measure.\nSELECT calendar_fiscal_period_name AS fiscal_period_name, calendar_fiscal_period_start AS fiscal_period_start,\n       AGG(sales_sales_quantity) AS sales_quantity\nFROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\nWHERE calendar_fiscal_period_start BETWEEN DATE '2021-01-25' AND DATE '2021-05-24'\nGROUP BY ALL\nORDER BY fiscal_period_start",
     "status": "partial",
     "rows": [
      [
       "FY2021 P02",
       "2021-01-25",
       "7670122",
       ""
      ],
      [
       "FY2021 P03",
       "2021-02-22",
       "10088929",
       ""
      ],
      [
       "FY2021 P04",
       "2021-03-29",
       "8170304",
       ""
      ],
      [
       "FY2021 P05",
       "2021-04-26",
       "7922491",
       ""
      ],
      [
       "FY2021 P06",
       "2021-05-24",
       "9156415",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery (workaround)",
     "platform": "bigquery",
     "file": "bigquery_workaround.sql",
     "code": "-- Last fiscal year in the query: a second GRAPH_EXPAND, periods moved 364 days (4-4-5, 52 weeks).\nWITH cur AS (\n    SELECT calendar_fiscal_period_name AS n, calendar_fiscal_period_start AS s, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_fiscal_period_start BETWEEN DATE '2021-01-25' AND DATE '2021-05-24'\n    GROUP BY ALL\n), ly AS (\n    SELECT DATE_ADD(calendar_fiscal_period_start, INTERVAL 364 DAY) AS s, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE DATE_ADD(calendar_fiscal_period_start, INTERVAL 364 DAY) BETWEEN DATE '2021-01-25' AND DATE '2021-05-24'\n    GROUP BY ALL\n)\nSELECT cur.n AS fiscal_period_name, cur.s AS fiscal_period_start, cur.q AS sales_quantity, ly.q AS sales_qty_fly\nFROM cur LEFT JOIN ly USING (s)\nORDER BY fiscal_period_start",
     "status": "match",
     "rows": [
      [
       "FY2021 P02",
       "2021-01-25",
       "7670122",
       "7155035"
      ],
      [
       "FY2021 P03",
       "2021-02-22",
       "10088929",
       "9405334"
      ],
      [
       "FY2021 P04",
       "2021-03-29",
       "8170304",
       "7550820"
      ],
      [
       "FY2021 P05",
       "2021-04-26",
       "7922491",
       "7290218"
      ],
      [
       "FY2021 P06",
       "2021-05-24",
       "9156415",
       "8424597"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "daxsql",
     "platform": "daxsql",
     "file": "daxsql.sql",
     "code": "SELECT dim_calendar.fiscal_period_name, dim_calendar.fiscal_period_start,\n       AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_fly) AS sales_qty_fly\nFROM model\nWHERE dim_calendar.fiscal_period_start BETWEEN DATE '2021-01-25' AND DATE '2021-05-24'\nGROUP BY ALL\nORDER BY fiscal_period_start",
     "status": "reference",
     "rows": [
      [
       "FY2021 P02",
       "2021-01-25",
       "7670122",
       "7155035"
      ],
      [
       "FY2021 P03",
       "2021-02-22",
       "10088929",
       "9405334"
      ],
      [
       "FY2021 P04",
       "2021-03-29",
       "8170304",
       "7550820"
      ],
      [
       "FY2021 P05",
       "2021-04-26",
       "7922491",
       "7290218"
      ],
      [
       "FY2021 P06",
       "2021-05-24",
       "9156415",
       "8424597"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match, with a copy of the fact, date moved 364 days (`sales_fly`)",
    "dbx": "**differs**. Matches with a second measure ordered by fiscal period.",
    "bigquery": "**partial**: no last-fiscal-year measure. Matches with a second `GRAPH_EXPAND`, periods moved 364 days.",
    "daxsql": "reference"
   }
  },
  {
   "id": "q07",
   "folder": "q07_net_profit_last_year_clearance",
   "title": "Net profit vs last year, by month, Clearance only",
   "text": "A measure that goes negative (Clearance has negative margins), under a category filter.",
   "columns": [
    "month_start",
    "net_profit_total",
    "net_profit_ly"
   ],
   "measures": [
    false,
    true,
    true
   ],
   "reference": {
    "rows": [
     [
      "2021-01-01",
      "-1317217.69",
      "-1218381.18"
     ],
     [
      "2021-02-01",
      "-1282598.66",
      "-1235702.25"
     ],
     [
      "2021-03-01",
      "-1478052.7",
      "-1379603.66"
     ],
     [
      "2021-04-01",
      "-1438620.61",
      "-1333741.88"
     ]
    ]
   },
   "runs": [
    {
     "label": "fabric",
     "platform": "fabric",
     "file": "fabric.dax",
     "code": "EVALUATE\nSUMMARIZECOLUMNS (\n    dim_calendar[month_start],\n    TREATAS ( { \"Clearance\" }, dim_category[category] ),\n    FILTER (\n        ALL ( dim_calendar[month_start] ),\n        dim_calendar[month_start] >= DATE ( 2021, 1, 1 ) && dim_calendar[month_start] <= DATE ( 2021, 4, 1 )\n    ),\n    \"net_profit_total\", [net_profit_total],\n    \"net_profit_ly\", [net_profit_ly]\n)\nORDER BY dim_calendar[month_start]",
     "status": "match",
     "rows": [
      [
       "2021-01-01",
       "-1317217.69",
       "-1218381.18"
      ],
      [
       "2021-02-01",
       "-1282598.66",
       "-1235702.25"
      ],
      [
       "2021-03-01",
       "-1478052.7",
       "-1379603.66"
      ],
      [
       "2021-04-01",
       "-1438620.61",
       "-1333741.88"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake",
     "platform": "snowflake",
     "file": "snowflake.sql",
     "code": "SELECT month_start, AGG(net_profit_total) AS net_profit_total, AGG(net_profit_ly) AS net_profit_ly\nFROM DAX_DEMO.MODEL.SEMANTIC_VIEW\nWHERE category = 'Clearance'\n  AND month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'\nGROUP BY ALL\nORDER BY month_start",
     "status": "match",
     "rows": [
      [
       "2021-01-01",
       "-1317217.69",
       "-1218381.18"
      ],
      [
       "2021-02-01",
       "-1282598.66",
       "-1235702.25"
      ],
      [
       "2021-03-01",
       "-1478052.7",
       "-1379603.66"
      ],
      [
       "2021-04-01",
       "-1438620.61",
       "-1333741.88"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx",
     "platform": "dbx",
     "file": "dbx.sql",
     "code": "SELECT month_start, AGG(net_profit_total) AS net_profit_total, AGG(net_profit_ly) AS net_profit_ly\nFROM databricks_ne.ossie_demo.sales_mv\nWHERE category = 'Clearance'\n  AND month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'\nGROUP BY ALL\nORDER BY month_start",
     "status": "differs",
     "rows": [
      [
       "2021-01-01",
       "-1317217.6900000013",
       "-39889.26000000004"
      ],
      [
       "2021-02-01",
       "-1282598.65999999",
       "-43307.909999999945"
      ],
      [
       "2021-03-01",
       "-1478052.7000000058",
       "-44230.149999999994"
      ],
      [
       "2021-04-01",
       "-1438620.6099999978",
       "-45425.40000000005"
      ]
     ],
     "diff": [
      [
       false,
       false,
       true
      ],
      [
       false,
       false,
       true
      ],
      [
       false,
       false,
       true
      ],
      [
       false,
       false,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx (workaround)",
     "platform": "dbx",
     "file": "dbx_workaround.sql",
     "code": "-- Last year as rows: sales_ly_mv is the fact with its date moved one year forward. Two views, joined by the query.\nWITH cur AS (\n    SELECT month_start, AGG(net_profit_total) AS net_profit_total FROM databricks_ne.ossie_demo.sales_mv WHERE category = 'Clearance' AND month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01' GROUP BY ALL\n), ly AS (\n    SELECT month_start, AGG(net_profit_ly) AS net_profit_ly FROM databricks_ne.ossie_demo.sales_ly_mv WHERE category = 'Clearance' AND month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01' GROUP BY ALL\n)\nSELECT COALESCE(cur.month_start, ly.month_start) AS month_start, cur.net_profit_total, ly.net_profit_ly\nFROM cur FULL OUTER JOIN ly ON cur.month_start <=> ly.month_start\nORDER BY month_start",
     "status": "match",
     "rows": [
      [
       "2021-01-01",
       "-1317217.6900000013",
       "-1218381.1800000018"
      ],
      [
       "2021-02-01",
       "-1282598.65999999",
       "-1235702.2500000023"
      ],
      [
       "2021-03-01",
       "-1478052.7000000058",
       "-1379603.660000005"
      ],
      [
       "2021-04-01",
       "-1438620.6099999978",
       "-1333741.879999996"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery",
     "platform": "bigquery",
     "file": "bigquery.sql",
     "code": "-- No last-year measure.\nSELECT calendar_month_start AS month_start, AGG(sales_net_profit_total) AS net_profit_total\nFROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\nWHERE category_category = 'Clearance'\n  AND calendar_month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'\nGROUP BY ALL\nORDER BY month_start",
     "status": "partial",
     "rows": [
      [
       "2021-01-01",
       "-1317217.69",
       ""
      ],
      [
       "2021-02-01",
       "-1282598.66",
       ""
      ],
      [
       "2021-03-01",
       "-1478052.7",
       ""
      ],
      [
       "2021-04-01",
       "-1438620.61",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       true
      ],
      [
       false,
       false,
       true
      ],
      [
       false,
       false,
       true
      ],
      [
       false,
       false,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery (workaround)",
     "platform": "bigquery",
     "file": "bigquery_workaround.sql",
     "code": "-- Last year in the query: a second GRAPH_EXPAND over last year's months, moved a year.\nWITH cur AS (\n    SELECT calendar_month_start AS m, AGG(sales_net_profit_total) AS p\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE category_category = 'Clearance' AND calendar_month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'\n    GROUP BY ALL\n), ly AS (\n    SELECT DATE_ADD(calendar_month_start, INTERVAL 1 YEAR) AS m, AGG(sales_net_profit_total) AS p\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE category_category = 'Clearance' AND calendar_month_start BETWEEN DATE '2020-01-01' AND DATE '2020-04-01'\n    GROUP BY ALL\n)\nSELECT cur.m AS month_start, cur.p AS net_profit_total, ly.p AS net_profit_ly\nFROM cur LEFT JOIN ly USING (m)\nORDER BY month_start",
     "status": "match",
     "rows": [
      [
       "2021-01-01",
       "-1317217.69",
       "-1218381.18"
      ],
      [
       "2021-02-01",
       "-1282598.66",
       "-1235702.25"
      ],
      [
       "2021-03-01",
       "-1478052.7",
       "-1379603.66"
      ],
      [
       "2021-04-01",
       "-1438620.61",
       "-1333741.88"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "daxsql",
     "platform": "daxsql",
     "file": "daxsql.sql",
     "code": "SELECT dim_calendar.month_start, AGG(net_profit_total) AS net_profit_total, AGG(net_profit_ly) AS net_profit_ly\nFROM model\nWHERE dim_category.category = 'Clearance'\n  AND dim_calendar.month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'\nGROUP BY ALL\nORDER BY month_start",
     "status": "reference",
     "rows": [
      [
       "2021-01-01",
       "-1317217.69",
       "-1218381.18"
      ],
      [
       "2021-02-01",
       "-1282598.66",
       "-1235702.25"
      ],
      [
       "2021-03-01",
       "-1478052.7",
       "-1379603.66"
      ],
      [
       "2021-04-01",
       "-1438620.61",
       "-1333741.88"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match, with `sales_ly`",
    "dbx": "**differs**. Matches with `sales_ly_mv`, joined in the query.",
    "bigquery": "**partial**: no last-year measure. Matches with a second `GRAPH_EXPAND`, joined in the query.",
    "daxsql": "reference"
   }
  },
  {
   "id": "q08",
   "folder": "q08_customer_share_all_vs_allselected",
   "title": "Customer share of its country: all customers vs the visible ones",
   "text": "February 2021, without Zabka, Rewe and Superdrug, and without the Somat brand. - `ALL(customer)`: the denominator is every customer of the country (the filtered-out ones too); month and brand kept. - `ALLSELECTED(customer)`: the denominator is the customers the query shows. - Databricks: a `range: all` window over customer gives ALL; ALLSELECTED has no metric-view form. The answer is three columns per customer: sales and the two shares. The denominators are not part of it; a platform that needs them as intermediate columns keeps them inside its model or its query.",
   "columns": [
    "country",
    "customer",
    "sales_quantity",
    "customer_share_all",
    "customer_share_allselected"
   ],
   "measures": [
    false,
    false,
    true,
    true,
    true
   ],
   "reference": {
    "rows": [
     [
      "Germany",
      "Edeka",
      "599134",
      "0.216475952697",
      "0.268969560712"
     ],
     [
      "Germany",
      "Rossmann DE",
      "721869",
      "0.260821918798",
      "0.324069052703"
     ],
     [
      "Germany",
      "dm",
      "906513",
      "0.327536519889",
      "0.406961386585"
     ],
     [
      "Poland",
      "Biedronka",
      "845866",
      "0.359804721845",
      "0.425928126586"
     ],
     [
      "Poland",
      "Lidl PL",
      "659874",
      "0.28068959034",
      "0.332273547587"
     ],
     [
      "Poland",
      "Rossmann PL",
      "480196",
      "0.204260235322",
      "0.241798325827"
     ],
     [
      "UK",
      "Boots",
      "540694",
      "0.319720095462",
      "0.406791622121"
     ],
     [
      "UK",
      "Tesco",
      "788473",
      "0.466235362014",
      "0.593208377879"
     ]
    ]
   },
   "runs": [
    {
     "label": "fabric",
     "platform": "fabric",
     "file": "fabric.dax",
     "code": "EVALUATE\nSUMMARIZECOLUMNS (\n    dim_country[country],\n    dim_store[customer],\n    FILTER ( ALL ( dim_store[customer] ), NOT dim_store[customer] IN { \"Zabka\", \"Rewe\", \"Superdrug\" } ),\n    TREATAS ( { DATE ( 2021, 2, 1 ) }, dim_calendar[month_start] ),\n    FILTER ( ALL ( dim_product[brand] ), dim_product[brand] <> \"Somat\" ),\n    \"sales_quantity\", [sales_quantity],\n    \"customer_share_all\", [customer_share_all],\n    \"customer_share_allselected\", [customer_share_allselected]\n)\nORDER BY dim_country[country], dim_store[customer]",
     "status": "match",
     "rows": [
      [
       "Germany",
       "dm",
       "906513",
       "0.327536519889",
       "0.406961386585"
      ],
      [
       "Germany",
       "Edeka",
       "599134",
       "0.216475952697",
       "0.268969560712"
      ],
      [
       "Germany",
       "Rossmann DE",
       "721869",
       "0.260821918798",
       "0.324069052703"
      ],
      [
       "Poland",
       "Biedronka",
       "845866",
       "0.359804721845",
       "0.425928126586"
      ],
      [
       "Poland",
       "Lidl PL",
       "659874",
       "0.28068959034",
       "0.332273547587"
      ],
      [
       "Poland",
       "Rossmann PL",
       "480196",
       "0.204260235322",
       "0.241798325827"
      ],
      [
       "UK",
       "Boots",
       "540694",
       "0.319720095462",
       "0.406791622121"
      ],
      [
       "UK",
       "Tesco",
       "788473",
       "0.466235362014",
       "0.593208377879"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake",
     "platform": "snowflake",
     "file": "snowflake.sql",
     "code": "SELECT country, customer,\n       AGG(sales_quantity) AS sales_quantity,\n       AGG(customer_share_all) AS customer_share_all,\n       AGG(customer_share_allselected) AS customer_share_allselected\nFROM DAX_DEMO.MODEL.SEMANTIC_VIEW\nWHERE customer NOT IN ('Zabka', 'Rewe', 'Superdrug')\n  AND month_start = DATE '2021-02-01'\n  AND brand <> 'Somat'\nGROUP BY ALL\nORDER BY country, customer",
     "status": "match",
     "rows": [
      [
       "Germany",
       "Edeka",
       "599134",
       "0.216476",
       "0.26897"
      ],
      [
       "Germany",
       "Rossmann DE",
       "721869",
       "0.260822",
       "0.324069"
      ],
      [
       "Germany",
       "dm",
       "906513",
       "0.327537",
       "0.406961"
      ],
      [
       "Poland",
       "Biedronka",
       "845866",
       "0.359805",
       "0.425928"
      ],
      [
       "Poland",
       "Lidl PL",
       "659874",
       "0.28069",
       "0.332274"
      ],
      [
       "Poland",
       "Rossmann PL",
       "480196",
       "0.20426",
       "0.241798"
      ],
      [
       "UK",
       "Boots",
       "540694",
       "0.31972",
       "0.406792"
      ],
      [
       "UK",
       "Tesco",
       "788473",
       "0.466235",
       "0.593208"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx",
     "platform": "dbx",
     "file": "dbx.sql",
     "code": "-- The share of the customers shown has no metric-view form: customer_share_allselected can't be asked.\nSELECT country, customer,\n       AGG(sales_quantity) AS sales_quantity,\n       AGG(customer_share_all) AS customer_share_all\nFROM databricks_ne.ossie_demo.sales_mv\nWHERE customer NOT IN ('Zabka', 'Rewe', 'Superdrug')\n  AND month_start = DATE '2021-02-01'\n  AND brand <> 'Somat'\nGROUP BY ALL\nORDER BY country, customer",
     "status": "partial",
     "rows": [
      [
       "Germany",
       "Edeka",
       "599134",
       "0.21647595269667266",
       ""
      ],
      [
       "Germany",
       "Rossmann DE",
       "721869",
       "0.2608219187981226",
       ""
      ],
      [
       "Germany",
       "dm",
       "906513",
       "0.3275365198885705",
       ""
      ],
      [
       "Poland",
       "Biedronka",
       "845866",
       "0.35980472184518036",
       ""
      ],
      [
       "Poland",
       "Lidl PL",
       "659874",
       "0.2806895903403926",
       ""
      ],
      [
       "Poland",
       "Rossmann PL",
       "480196",
       "0.20426023532234208",
       ""
      ],
      [
       "UK",
       "Boots",
       "540694",
       "0.319720095461781",
       ""
      ],
      [
       "UK",
       "Tesco",
       "788473",
       "0.46623536201444227",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       false,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx (workaround)",
     "platform": "dbx",
     "file": "dbx_workaround.sql",
     "code": "-- The share of the customers shown, computed by the query, not the model: a window over the metric view's result.\nSELECT country, customer, sales_quantity, customer_share_all,\n       sales_quantity / SUM(sales_quantity) OVER (PARTITION BY country) AS customer_share_allselected\nFROM (\n    SELECT country, customer,\n           AGG(sales_quantity) AS sales_quantity,\n           AGG(customer_share_all) AS customer_share_all\n    FROM databricks_ne.ossie_demo.sales_mv\n    WHERE customer NOT IN ('Zabka', 'Rewe', 'Superdrug')\n      AND month_start = DATE '2021-02-01'\n      AND brand <> 'Somat'\n    GROUP BY ALL\n)\nORDER BY country, customer",
     "status": "match",
     "rows": [
      [
       "Germany",
       "Edeka",
       "599134",
       "0.21647595269667266",
       "0.26896956071247075"
      ],
      [
       "Germany",
       "Rossmann DE",
       "721869",
       "0.2608219187981226",
       "0.32406905270265174"
      ],
      [
       "Germany",
       "dm",
       "906513",
       "0.3275365198885705",
       "0.4069613865848775"
      ],
      [
       "Poland",
       "Biedronka",
       "845866",
       "0.35980472184518036",
       "0.4259281265861538"
      ],
      [
       "Poland",
       "Lidl PL",
       "659874",
       "0.2806895903403926",
       "0.3322735475866292"
      ],
      [
       "Poland",
       "Rossmann PL",
       "480196",
       "0.20426023532234208",
       "0.241798325827217"
      ],
      [
       "UK",
       "Boots",
       "540694",
       "0.319720095461781",
       "0.4067916221212233"
      ],
      [
       "UK",
       "Tesco",
       "788473",
       "0.46623536201444227",
       "0.5932083778787767"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery",
     "platform": "bigquery",
     "file": "bigquery.sql",
     "code": "-- No measure ignores a filter (ALL) or reads the rows shown (ALLSELECTED).\nSELECT country_country AS country, store_customer AS customer, AGG(sales_sales_quantity) AS sales_quantity\nFROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\nWHERE store_customer NOT IN ('Zabka', 'Rewe', 'Superdrug')\n  AND calendar_month_start = DATE '2021-02-01'\n  AND product_brand <> 'Somat'\nGROUP BY ALL\nORDER BY country, customer",
     "status": "partial",
     "rows": [
      [
       "Germany",
       "Edeka",
       "599134",
       "",
       ""
      ],
      [
       "Germany",
       "Rossmann DE",
       "721869",
       "",
       ""
      ],
      [
       "Germany",
       "dm",
       "906513",
       "",
       ""
      ],
      [
       "Poland",
       "Biedronka",
       "845866",
       "",
       ""
      ],
      [
       "Poland",
       "Lidl PL",
       "659874",
       "",
       ""
      ],
      [
       "Poland",
       "Rossmann PL",
       "480196",
       "",
       ""
      ],
      [
       "UK",
       "Boots",
       "540694",
       "",
       ""
      ],
      [
       "UK",
       "Tesco",
       "788473",
       "",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery (workaround)",
     "platform": "bigquery",
     "file": "bigquery_workaround.sql",
     "code": "-- All customers: a second GRAPH_EXPAND without the customer filter. The customers shown: a window in the query.\nWITH cur AS (\n    SELECT country_country AS country, store_customer AS customer, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE store_customer NOT IN ('Zabka', 'Rewe', 'Superdrug')\n      AND calendar_month_start = DATE '2021-02-01' AND product_brand <> 'Somat'\n    GROUP BY ALL\n), every_customer AS (\n    SELECT country_country AS country, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_month_start = DATE '2021-02-01' AND product_brand <> 'Somat'\n    GROUP BY ALL\n)\nSELECT cur.country, cur.customer, cur.q AS sales_quantity,\n       cur.q / a.q AS customer_share_all,\n       cur.q / SUM(cur.q) OVER (PARTITION BY cur.country) AS customer_share_allselected\nFROM cur JOIN every_customer AS a USING (country)\nORDER BY country, customer",
     "status": "match",
     "rows": [
      [
       "Germany",
       "Edeka",
       "599134",
       "0.216475952697",
       "0.268969560712"
      ],
      [
       "Germany",
       "Rossmann DE",
       "721869",
       "0.260821918798",
       "0.324069052703"
      ],
      [
       "Germany",
       "dm",
       "906513",
       "0.327536519889",
       "0.406961386585"
      ],
      [
       "Poland",
       "Biedronka",
       "845866",
       "0.359804721845",
       "0.425928126586"
      ],
      [
       "Poland",
       "Lidl PL",
       "659874",
       "0.28068959034",
       "0.332273547587"
      ],
      [
       "Poland",
       "Rossmann PL",
       "480196",
       "0.204260235322",
       "0.241798325827"
      ],
      [
       "UK",
       "Boots",
       "540694",
       "0.319720095462",
       "0.406791622121"
      ],
      [
       "UK",
       "Tesco",
       "788473",
       "0.466235362014",
       "0.593208377879"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "daxsql",
     "platform": "daxsql",
     "file": "daxsql.sql",
     "code": "SELECT dim_country.country, dim_store.customer,\n       AGG(sales_quantity) AS sales_quantity,\n       AGG(customer_share_all) AS customer_share_all,\n       AGG(customer_share_allselected) AS customer_share_allselected\nFROM model\nWHERE dim_store.customer NOT IN ('Zabka', 'Rewe', 'Superdrug')\n  AND dim_calendar.month_start = DATE '2021-02-01'\n  AND dim_product.brand <> 'Somat'\nGROUP BY ALL\nORDER BY country, customer",
     "status": "reference",
     "rows": [
      [
       "Germany",
       "Edeka",
       "599134",
       "0.216475952697",
       "0.268969560712"
      ],
      [
       "Germany",
       "Rossmann DE",
       "721869",
       "0.260821918798",
       "0.324069052703"
      ],
      [
       "Germany",
       "dm",
       "906513",
       "0.327536519889",
       "0.406961386585"
      ],
      [
       "Poland",
       "Biedronka",
       "845866",
       "0.359804721845",
       "0.425928126586"
      ],
      [
       "Poland",
       "Lidl PL",
       "659874",
       "0.28068959034",
       "0.332273547587"
      ],
      [
       "Poland",
       "Rossmann PL",
       "480196",
       "0.204260235322",
       "0.241798325827"
      ],
      [
       "UK",
       "Boots",
       "540694",
       "0.319720095462",
       "0.406791622121"
      ],
      [
       "UK",
       "Tesco",
       "788473",
       "0.466235362014",
       "0.593208377879"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match. All customers: a copy of the fact through a copy of the store table (`store_geo`). Customers shown: LOD.",
    "dbx": "**partial**: all customers by a window; customers shown has no metric-view form. Matches with a window function in the query.",
    "bigquery": "**partial**: no measure ignores a filter. Matches with a second `GRAPH_EXPAND` without the customer filter, and a window in the query.",
    "daxsql": "reference"
   }
  },
  {
   "id": "q09",
   "folder": "q09_country_all_vs_fixed",
   "title": "Country total: all customers vs fixed at country and year, with a total",
   "text": "February 2021, without Tesco. `ALL(customer)` keeps the month (February, all customers); `FIXED (country, year)` ignores every filter but country and year (the whole of 2021).",
   "columns": [
    "country",
    "sales_quantity",
    "country_qty_all_customers",
    "country_total_fixed"
   ],
   "measures": [
    false,
    true,
    true,
    true
   ],
   "reference": {
    "rows": [
     [
      "Germany",
      "3164939",
      "3164939",
      "36203407"
     ],
     [
      "Poland",
      "2686210",
      "2686210",
      "30755062"
     ],
     [
      "UK",
      "1031214",
      "1931716",
      "22111689"
     ],
     [
      "",
      "6882363",
      "7782865",
      "89070158"
     ]
    ]
   },
   "runs": [
    {
     "label": "fabric",
     "platform": "fabric",
     "file": "fabric.dax",
     "code": "EVALUATE\nSUMMARIZECOLUMNS (\n    ROLLUPADDISSUBTOTAL ( dim_country[country], \"is_total\" ),\n    TREATAS ( { DATE ( 2021, 2, 1 ) }, dim_calendar[month_start] ),\n    FILTER ( ALL ( dim_store[customer] ), dim_store[customer] <> \"Tesco\" ),\n    \"sales_quantity\", [sales_quantity],\n    \"country_qty_all_customers\", [country_qty_all_customers],\n    \"country_total_fixed\", [country_total_fixed]\n)\nORDER BY [is_total], dim_country[country]",
     "status": "match",
     "rows": [
      [
       "Germany",
       "3164939",
       "3164939",
       "36203407"
      ],
      [
       "Poland",
       "2686210",
       "2686210",
       "30755062"
      ],
      [
       "UK",
       "1031214",
       "1931716",
       "22111689"
      ],
      [
       "",
       "6882363",
       "7782865",
       "89070158"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake",
     "platform": "snowflake",
     "file": "snowflake.sql",
     "code": "SELECT * FROM (\n    SELECT country, AGG(sales_quantity) AS sales_quantity, AGG(country_qty_all_customers) AS country_qty_all_customers, AGG(country_total_fixed) AS country_total_fixed\n    FROM DAX_DEMO.MODEL.SEMANTIC_VIEW\n    WHERE month_start = DATE '2021-02-01' AND customer <> 'Tesco'\n    GROUP BY ALL\n    UNION ALL\n    SELECT NULL, AGG(sales_quantity), AGG(country_qty_all_customers), AGG(country_total_fixed)\n    FROM DAX_DEMO.MODEL.SEMANTIC_VIEW\n    WHERE month_start = DATE '2021-02-01' AND customer <> 'Tesco'\n)\nORDER BY country NULLS LAST",
     "status": "match",
     "rows": [
      [
       "Germany",
       "3164939",
       "3164939",
       "36203407"
      ],
      [
       "Poland",
       "2686210",
       "2686210",
       "30755062"
      ],
      [
       "UK",
       "1031214",
       "1931716",
       "22111689"
      ],
      [
       "",
       "6882363",
       "7782865",
       "89070158"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx",
     "platform": "dbx",
     "file": "dbx.sql",
     "code": "SELECT country, AGG(sales_quantity) AS sales_quantity, AGG(country_qty_all_customers) AS country_qty_all_customers,\n       AGG(country_total_fixed) AS country_total_fixed\nFROM databricks_ne.ossie_demo.sales_mv\nWHERE month_start = DATE '2021-02-01' AND customer <> 'Tesco'\nGROUP BY ROLLUP (country)\nORDER BY country NULLS LAST",
     "status": "match",
     "rows": [
      [
       "Germany",
       "3164939",
       "3164939",
       "36203407"
      ],
      [
       "Poland",
       "2686210",
       "2686210",
       "30755062"
      ],
      [
       "UK",
       "1031214",
       "1931716",
       "22111689"
      ],
      [
       "",
       "6882363",
       "7782865",
       "89070158"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery",
     "platform": "bigquery",
     "file": "bigquery.sql",
     "code": "-- No measure ignores a filter; the total row is a second query.\nSELECT * FROM (\n    SELECT country_country AS country, AGG(sales_sales_quantity) AS sales_quantity\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_month_start = DATE '2021-02-01' AND store_customer <> 'Tesco'\n    GROUP BY ALL\n    UNION ALL\n    SELECT NULL, AGG(sales_sales_quantity)\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_month_start = DATE '2021-02-01' AND store_customer <> 'Tesco'\n)\nORDER BY country NULLS LAST",
     "status": "partial",
     "rows": [
      [
       "Germany",
       "3164939",
       "",
       ""
      ],
      [
       "Poland",
       "2686210",
       "",
       ""
      ],
      [
       "UK",
       "1031214",
       "",
       ""
      ],
      [
       "",
       "6882363",
       "",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery (workaround)",
     "platform": "bigquery",
     "file": "bigquery_workaround.sql",
     "code": "-- All customers: a second GRAPH_EXPAND without the customer filter. Fixed at country and year: a third, on the\n-- year of the month asked (2021), with no other filter. The total row is a fourth part.\nWITH cur AS (\n    SELECT country_country AS country, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_month_start = DATE '2021-02-01' AND store_customer <> 'Tesco'\n    GROUP BY ALL\n), every_customer AS (\n    SELECT country_country AS country, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_month_start = DATE '2021-02-01'\n    GROUP BY ALL\n), fixed AS (\n    SELECT country_country AS country, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_year = 2021\n    GROUP BY ALL\n), r AS (\n    SELECT cur.country, cur.q, a.q AS qa, f.q AS qf\n    FROM cur JOIN every_customer AS a USING (country) JOIN fixed AS f USING (country)\n)\nSELECT * FROM (\n    SELECT country, q AS sales_quantity, qa AS country_qty_all_customers, qf AS country_total_fixed FROM r\n    UNION ALL\n    SELECT NULL, SUM(q), SUM(qa), SUM(qf) FROM r\n)\nORDER BY country NULLS LAST",
     "status": "match",
     "rows": [
      [
       "Germany",
       "3164939",
       "3164939",
       "36203407"
      ],
      [
       "Poland",
       "2686210",
       "2686210",
       "30755062"
      ],
      [
       "UK",
       "1031214",
       "1931716",
       "22111689"
      ],
      [
       "",
       "6882363",
       "7782865",
       "89070158"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "daxsql",
     "platform": "daxsql",
     "file": "daxsql.sql",
     "code": "SELECT dim_country.country, GROUPING(dim_country.country) AS is_total,\n       AGG(sales_quantity) AS sales_quantity,\n       AGG(country_qty_all_customers) AS country_qty_all_customers,\n       AGG(country_total_fixed) AS country_total_fixed\nFROM model\nWHERE dim_calendar.month_start = DATE '2021-02-01'\n  AND dim_store.customer <> 'Tesco'\nGROUP BY ROLLUP(dim_country.country)\nORDER BY is_total, country",
     "status": "reference",
     "rows": [
      [
       "Germany",
       "3164939",
       "3164939",
       "36203407"
      ],
      [
       "Poland",
       "2686210",
       "2686210",
       "30755062"
      ],
      [
       "UK",
       "1031214",
       "1931716",
       "22111689"
      ],
      [
       "",
       "6882363",
       "7782865",
       "89070158"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match (LOD; the total row is a second query)",
    "dbx": "match",
    "bigquery": "**partial**: no measure ignores a filter; the total row is a second query. Matches with two more `GRAPH_EXPAND`s (no customer filter; the whole year), joined in the query.",
    "daxsql": "reference"
   }
  },
  {
   "id": "q10",
   "folder": "q10_share_all_customers_and_categories",
   "title": "Share of the country across all customers and categories",
   "text": "2021, brands Tide and Dove, category Laundry, without Tesco. The denominator drops the customer and category filters but keeps the brand filter, so Dove (a Hair Care brand) counts in it. In the first build `category` was a column of `dim_product`, the same table as `brand`, and DAX's SUMMARIZECOLUMNS auto-exist merged the two filters (Dove dropped out of the denominator). With `dim_category` a table of its own the trap is gone: the shape of the model changes the answer.",
   "columns": [
    "country",
    "sales_quantity",
    "cust_cat_share_all"
   ],
   "measures": [
    false,
    true,
    true
   ],
   "reference": {
    "rows": [
     [
      "Germany",
      "4521959",
      "0.499347485395"
     ],
     [
      "Poland",
      "3837141",
      "0.498927222365"
     ],
     [
      "UK",
      "1482182",
      "0.26811639164"
     ]
    ]
   },
   "runs": [
    {
     "label": "fabric",
     "platform": "fabric",
     "file": "fabric.dax",
     "code": "EVALUATE\nSUMMARIZECOLUMNS (\n    dim_country[country],\n    TREATAS ( { 2021 }, dim_calendar[year] ),\n    TREATAS ( { \"Tide\", \"Dove\" }, dim_product[brand] ),\n    TREATAS ( { \"Laundry\" }, dim_category[category] ),\n    FILTER ( ALL ( dim_store[customer] ), dim_store[customer] <> \"Tesco\" ),\n    \"sales_quantity\", [sales_quantity],\n    \"cust_cat_share_all\", [cust_cat_share_all]\n)\nORDER BY dim_country[country]",
     "status": "match",
     "rows": [
      [
       "Germany",
       "4521959",
       "0.499347485395"
      ],
      [
       "Poland",
       "3837141",
       "0.498927222365"
      ],
      [
       "UK",
       "1482182",
       "0.26811639164"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake",
     "platform": "snowflake",
     "file": "snowflake.sql",
     "code": "SELECT country, AGG(sales_quantity) AS sales_quantity, AGG(cust_cat_share_all) AS cust_cat_share_all\nFROM DAX_DEMO.MODEL.SEMANTIC_VIEW\nWHERE year = 2021 AND brand IN ('Tide', 'Dove') AND category = 'Laundry' AND customer <> 'Tesco'\nGROUP BY ALL\nORDER BY country",
     "status": "match",
     "rows": [
      [
       "Germany",
       "4521959",
       "0.499347"
      ],
      [
       "Poland",
       "3837141",
       "0.498927"
      ],
      [
       "UK",
       "1482182",
       "0.268116"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx",
     "platform": "dbx",
     "file": "dbx.sql",
     "code": "SELECT country, AGG(sales_quantity) AS sales_quantity, AGG(cust_cat_share_all) AS cust_cat_share_all\nFROM databricks_ne.ossie_demo.sales_mv\nWHERE year = 2021 AND brand IN ('Tide', 'Dove') AND category = 'Laundry' AND customer <> 'Tesco'\nGROUP BY ALL\nORDER BY country",
     "status": "match",
     "rows": [
      [
       "Germany",
       "4521959",
       "0.49934748539489227"
      ],
      [
       "Poland",
       "3837141",
       "0.4989272223647449"
      ],
      [
       "UK",
       "1482182",
       "0.2681163916399201"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery",
     "platform": "bigquery",
     "file": "bigquery.sql",
     "code": "-- No measure ignores a filter.\nSELECT country_country AS country, AGG(sales_sales_quantity) AS sales_quantity\nFROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\nWHERE calendar_year = 2021\n  AND product_brand IN ('Tide', 'Dove')\n  AND category_category = 'Laundry'\n  AND store_customer <> 'Tesco'\nGROUP BY ALL\nORDER BY country",
     "status": "partial",
     "rows": [
      [
       "Germany",
       "4521959",
       ""
      ],
      [
       "Poland",
       "3837141",
       ""
      ],
      [
       "UK",
       "1482182",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       true
      ],
      [
       false,
       false,
       true
      ],
      [
       false,
       false,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery (workaround)",
     "platform": "bigquery",
     "file": "bigquery_workaround.sql",
     "code": "-- All customers and categories: a second GRAPH_EXPAND without the customer and category filters.\nWITH cur AS (\n    SELECT country_country AS country, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_year = 2021 AND product_brand IN ('Tide', 'Dove')\n      AND category_category = 'Laundry' AND store_customer <> 'Tesco'\n    GROUP BY ALL\n), every_customer_category AS (\n    SELECT country_country AS country, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_year = 2021 AND product_brand IN ('Tide', 'Dove')\n    GROUP BY ALL\n)\nSELECT cur.country, cur.q AS sales_quantity, cur.q / a.q AS cust_cat_share_all\nFROM cur JOIN every_customer_category AS a USING (country)\nORDER BY country",
     "status": "match",
     "rows": [
      [
       "Germany",
       "4521959",
       "0.499347485395"
      ],
      [
       "Poland",
       "3837141",
       "0.498927222365"
      ],
      [
       "UK",
       "1482182",
       "0.26811639164"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "daxsql",
     "platform": "daxsql",
     "file": "daxsql.sql",
     "code": "SELECT dim_country.country, AGG(sales_quantity) AS sales_quantity, AGG(cust_cat_share_all) AS cust_cat_share_all\nFROM model\nWHERE dim_calendar.year = 2021\n  AND dim_product.brand IN ('Tide', 'Dove')\n  AND dim_category.category = 'Laundry'\n  AND dim_store.customer <> 'Tesco'\nGROUP BY ALL\nORDER BY country",
     "status": "reference",
     "rows": [
      [
       "Germany",
       "4521959",
       "0.499347485395"
      ],
      [
       "Poland",
       "3837141",
       "0.498927222365"
      ],
      [
       "UK",
       "1482182",
       "0.26811639164"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match, with a copy of the fact through a one-row `all_members` table",
    "dbx": "match",
    "bigquery": "**partial**: no measure ignores a filter. Matches with a second `GRAPH_EXPAND` without the customer and category filters.",
    "daxsql": "reference"
   }
  },
  {
   "id": "q11",
   "folder": "q11_actual_vs_budget",
   "title": "Actual vs budget, by country and category, 2021",
   "text": "Two facts at two grains: sales (day x store x product) and budget (month x country x category), through the dimensions they share. - Power BI and Snowflake: one model holds both facts; one query. - Databricks: a metric view has one source fact, so `dbx.sql` queries the sales view and the budget view and joins them. `dbx_workaround.sql` uses a bridge view over both facts. - BigQuery: a query has one root, and from sales the budget is out of reach. `bigquery_workaround.sql` adds a second `GRAPH_EXPAND` from the budget, joined in the query (the docs' pattern).",
   "columns": [
    "country",
    "category",
    "sales_quantity",
    "budget_quantity",
    "sales_vs_budget_pct"
   ],
   "measures": [
    false,
    false,
    true,
    true,
    true
   ],
   "reference": {
    "rows": [
     [
      "Germany",
      "Clearance",
      "9037851",
      "9019629",
      "0.00202026047856"
     ],
     [
      "Germany",
      "Hair Care",
      "9055308",
      "9096916",
      "-0.00457385777773"
     ],
     [
      "Germany",
      "Laundry",
      "9061647",
      "9124124",
      "-0.00684745187593"
     ],
     [
      "Germany",
      "Oral Care",
      "9048601",
      "9083304",
      "-0.00382052609931"
     ],
     [
      "Poland",
      "Clearance",
      "7674383",
      "7664571",
      "0.00128017602029"
     ],
     [
      "Poland",
      "Hair Care",
      "7693248",
      "7666825",
      "0.00344640708507"
     ],
     [
      "Poland",
      "Laundry",
      "7688170",
      "7732939",
      "-0.00578939003657"
     ],
     [
      "Poland",
      "Oral Care",
      "7699261",
      "7709646",
      "-0.00134701385771"
     ],
     [
      "UK",
      "Clearance",
      "5534210",
      "5575135",
      "-0.00734062941974"
     ],
     [
      "UK",
      "Hair Care",
      "5512252",
      "5523247",
      "-0.00199067686091"
     ],
     [
      "UK",
      "Laundry",
      "5535746",
      "5480303",
      "0.0101167763899"
     ],
     [
      "UK",
      "Oral Care",
      "5529481",
      "5572849",
      "-0.007782015985"
     ]
    ]
   },
   "runs": [
    {
     "label": "fabric",
     "platform": "fabric",
     "file": "fabric.dax",
     "code": "EVALUATE\nSUMMARIZECOLUMNS (\n    dim_country[country],\n    dim_category[category],\n    TREATAS ( { 2021 }, dim_calendar[year] ),\n    \"sales_quantity\", [sales_quantity],\n    \"budget_quantity\", [budget_quantity],\n    \"sales_vs_budget_pct\", [sales_vs_budget_pct]\n)\nORDER BY dim_country[country], dim_category[category]",
     "status": "match",
     "rows": [
      [
       "Germany",
       "Clearance",
       "9037851",
       "9019629",
       "0.00202026047856"
      ],
      [
       "Germany",
       "Hair Care",
       "9055308",
       "9096916",
       "-0.00457385777773"
      ],
      [
       "Germany",
       "Laundry",
       "9061647",
       "9124124",
       "-0.00684745187593"
      ],
      [
       "Germany",
       "Oral Care",
       "9048601",
       "9083304",
       "-0.00382052609931"
      ],
      [
       "Poland",
       "Clearance",
       "7674383",
       "7664571",
       "0.00128017602029"
      ],
      [
       "Poland",
       "Hair Care",
       "7693248",
       "7666825",
       "0.00344640708507"
      ],
      [
       "Poland",
       "Laundry",
       "7688170",
       "7732939",
       "-0.00578939003657"
      ],
      [
       "Poland",
       "Oral Care",
       "7699261",
       "7709646",
       "-0.00134701385771"
      ],
      [
       "UK",
       "Clearance",
       "5534210",
       "5575135",
       "-0.00734062941974"
      ],
      [
       "UK",
       "Hair Care",
       "5512252",
       "5523247",
       "-0.00199067686091"
      ],
      [
       "UK",
       "Laundry",
       "5535746",
       "5480303",
       "0.0101167763899"
      ],
      [
       "UK",
       "Oral Care",
       "5529481",
       "5572849",
       "-0.007782015985"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake",
     "platform": "snowflake",
     "file": "snowflake.sql",
     "code": "SELECT country, category, AGG(sales_quantity) AS sales_quantity, AGG(budget_quantity) AS budget_quantity,\n       AGG(sales_vs_budget_pct) AS sales_vs_budget_pct\nFROM DAX_DEMO.MODEL.SEMANTIC_VIEW\nWHERE year = 2021\nGROUP BY ALL\nORDER BY country, category",
     "status": "match",
     "rows": [
      [
       "Germany",
       "Clearance",
       "9037851",
       "9019629",
       "0.00202"
      ],
      [
       "Germany",
       "Hair Care",
       "9055308",
       "9096916",
       "-0.004574"
      ],
      [
       "Germany",
       "Laundry",
       "9061647",
       "9124124",
       "-0.006847"
      ],
      [
       "Germany",
       "Oral Care",
       "9048601",
       "9083304",
       "-0.003821"
      ],
      [
       "Poland",
       "Clearance",
       "7674383",
       "7664571",
       "0.00128"
      ],
      [
       "Poland",
       "Hair Care",
       "7693248",
       "7666825",
       "0.003446"
      ],
      [
       "Poland",
       "Laundry",
       "7688170",
       "7732939",
       "-0.005789"
      ],
      [
       "Poland",
       "Oral Care",
       "7699261",
       "7709646",
       "-0.001347"
      ],
      [
       "UK",
       "Clearance",
       "5534210",
       "5575135",
       "-0.007341"
      ],
      [
       "UK",
       "Hair Care",
       "5512252",
       "5523247",
       "-0.001991"
      ],
      [
       "UK",
       "Laundry",
       "5535746",
       "5480303",
       "0.010117"
      ],
      [
       "UK",
       "Oral Care",
       "5529481",
       "5572849",
       "-0.007782"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx",
     "platform": "dbx",
     "file": "dbx.sql",
     "code": "-- One metric view per fact, joined by the query on the shared dimensions.\nWITH s AS (\n    SELECT country, category, AGG(sales_quantity) AS sales_quantity\n    FROM databricks_ne.ossie_demo.sales_mv\n    WHERE year = 2021\n    GROUP BY ALL\n), b AS (\n    SELECT country, category, AGG(budget_quantity) AS budget_quantity\n    FROM databricks_ne.ossie_demo.budget_mv\n    WHERE year = 2021\n    GROUP BY ALL\n)\nSELECT COALESCE(s.country, b.country) AS country, COALESCE(s.category, b.category) AS category,\n       s.sales_quantity, b.budget_quantity,\n       (s.sales_quantity - b.budget_quantity) / NULLIF(b.budget_quantity, 0) AS sales_vs_budget_pct\nFROM s FULL OUTER JOIN b ON s.country = b.country AND s.category = b.category\nORDER BY country, category",
     "status": "match",
     "rows": [
      [
       "Germany",
       "Clearance",
       "9037851",
       "9019629",
       "0.002020260478562921"
      ],
      [
       "Germany",
       "Hair Care",
       "9055308",
       "9096916",
       "-0.004573857777734784"
      ],
      [
       "Germany",
       "Laundry",
       "9061647",
       "9124124",
       "-0.006847451875928034"
      ],
      [
       "Germany",
       "Oral Care",
       "9048601",
       "9083304",
       "-0.003820526099313642"
      ],
      [
       "Poland",
       "Clearance",
       "7674383",
       "7664571",
       "0.0012801760202886764"
      ],
      [
       "Poland",
       "Hair Care",
       "7693248",
       "7666825",
       "0.003446407085071069"
      ],
      [
       "Poland",
       "Laundry",
       "7688170",
       "7732939",
       "-0.0057893900365695375"
      ],
      [
       "Poland",
       "Oral Care",
       "7699261",
       "7709646",
       "-0.00134701385770501"
      ],
      [
       "UK",
       "Clearance",
       "5534210",
       "5575135",
       "-0.007340629419736024"
      ],
      [
       "UK",
       "Hair Care",
       "5512252",
       "5523247",
       "-0.0019906768609117063"
      ],
      [
       "UK",
       "Laundry",
       "5535746",
       "5480303",
       "0.010116776389918586"
      ],
      [
       "UK",
       "Oral Care",
       "5529481",
       "5572849",
       "-0.007782015985001567"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx (workaround)",
     "platform": "dbx",
     "file": "dbx_workaround.sql",
     "code": "-- One metric view over both facts: the bridge (the shared keys as source, each fact a one_to_many join).\nSELECT country, category, AGG(sales_quantity) AS sales_quantity, AGG(budget_quantity) AS budget_quantity,\n       AGG(sales_vs_budget_pct) AS sales_vs_budget_pct\nFROM databricks_ne.ossie_demo.bridge_mv\nWHERE year = 2021\nGROUP BY ALL\nORDER BY country, category",
     "status": "match",
     "rows": [
      [
       "Germany",
       "Clearance",
       "9037851",
       "9019629",
       "0.002020260478562921"
      ],
      [
       "Germany",
       "Hair Care",
       "9055308",
       "9096916",
       "-0.004573857777734784"
      ],
      [
       "Germany",
       "Laundry",
       "9061647",
       "9124124",
       "-0.006847451875928034"
      ],
      [
       "Germany",
       "Oral Care",
       "9048601",
       "9083304",
       "-0.003820526099313642"
      ],
      [
       "Poland",
       "Clearance",
       "7674383",
       "7664571",
       "0.0012801760202886764"
      ],
      [
       "Poland",
       "Hair Care",
       "7693248",
       "7666825",
       "0.003446407085071069"
      ],
      [
       "Poland",
       "Laundry",
       "7688170",
       "7732939",
       "-0.0057893900365695375"
      ],
      [
       "Poland",
       "Oral Care",
       "7699261",
       "7709646",
       "-0.00134701385770501"
      ],
      [
       "UK",
       "Clearance",
       "5534210",
       "5575135",
       "-0.007340629419736024"
      ],
      [
       "UK",
       "Hair Care",
       "5512252",
       "5523247",
       "-0.0019906768609117063"
      ],
      [
       "UK",
       "Laundry",
       "5535746",
       "5480303",
       "0.010116776389918586"
      ],
      [
       "UK",
       "Oral Care",
       "5529481",
       "5572849",
       "-0.007782015985001567"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery",
     "platform": "bigquery",
     "file": "bigquery.sql",
     "code": "-- One query has one root: from sales, the budget is not reachable. A derived measure only reads its own table.\nSELECT country_country AS country, category_category AS category, AGG(sales_sales_quantity) AS sales_quantity\nFROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\nWHERE calendar_year = 2021\nGROUP BY ALL\nORDER BY country, category",
     "status": "partial",
     "rows": [
      [
       "Germany",
       "Clearance",
       "9037851",
       "",
       ""
      ],
      [
       "Germany",
       "Hair Care",
       "9055308",
       "",
       ""
      ],
      [
       "Germany",
       "Laundry",
       "9061647",
       "",
       ""
      ],
      [
       "Germany",
       "Oral Care",
       "9048601",
       "",
       ""
      ],
      [
       "Poland",
       "Clearance",
       "7674383",
       "",
       ""
      ],
      [
       "Poland",
       "Hair Care",
       "7693248",
       "",
       ""
      ],
      [
       "Poland",
       "Laundry",
       "7688170",
       "",
       ""
      ],
      [
       "Poland",
       "Oral Care",
       "7699261",
       "",
       ""
      ],
      [
       "UK",
       "Clearance",
       "5534210",
       "",
       ""
      ],
      [
       "UK",
       "Hair Care",
       "5512252",
       "",
       ""
      ],
      [
       "UK",
       "Laundry",
       "5535746",
       "",
       ""
      ],
      [
       "UK",
       "Oral Care",
       "5529481",
       "",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       true,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery (workaround)",
     "platform": "bigquery",
     "file": "bigquery_workaround.sql",
     "code": "-- Two roots, two GRAPH_EXPANDs joined on the shared dimensions (the docs' pattern); the ratio is in the query.\nWITH s AS (\n    SELECT country_country AS country, category_category AS category, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_year = 2021\n    GROUP BY ALL\n), b AS (\n    SELECT country_country AS country, category_category AS category, AGG(budget_budget_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"budget\")\n    WHERE calendar_year = 2021\n    GROUP BY ALL\n)\nSELECT country, category, s.q AS sales_quantity, b.q AS budget_quantity, SAFE_DIVIDE(s.q - b.q, b.q) AS sales_vs_budget_pct\nFROM s FULL JOIN b USING (country, category)\nORDER BY country, category",
     "status": "match",
     "rows": [
      [
       "Germany",
       "Clearance",
       "9037851",
       "9019629",
       "0.00202026047856"
      ],
      [
       "Germany",
       "Hair Care",
       "9055308",
       "9096916",
       "-0.00457385777773"
      ],
      [
       "Germany",
       "Laundry",
       "9061647",
       "9124124",
       "-0.00684745187593"
      ],
      [
       "Germany",
       "Oral Care",
       "9048601",
       "9083304",
       "-0.00382052609931"
      ],
      [
       "Poland",
       "Clearance",
       "7674383",
       "7664571",
       "0.00128017602029"
      ],
      [
       "Poland",
       "Hair Care",
       "7693248",
       "7666825",
       "0.00344640708507"
      ],
      [
       "Poland",
       "Laundry",
       "7688170",
       "7732939",
       "-0.00578939003657"
      ],
      [
       "Poland",
       "Oral Care",
       "7699261",
       "7709646",
       "-0.00134701385771"
      ],
      [
       "UK",
       "Clearance",
       "5534210",
       "5575135",
       "-0.00734062941974"
      ],
      [
       "UK",
       "Hair Care",
       "5512252",
       "5523247",
       "-0.00199067686091"
      ],
      [
       "UK",
       "Laundry",
       "5535746",
       "5480303",
       "0.0101167763899"
      ],
      [
       "UK",
       "Oral Care",
       "5529481",
       "5572849",
       "-0.007782015985"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "daxsql",
     "platform": "daxsql",
     "file": "daxsql.sql",
     "code": "SELECT dim_country.country, dim_category.category,\n       AGG(sales_quantity) AS sales_quantity,\n       AGG(budget_quantity) AS budget_quantity,\n       AGG(sales_vs_budget_pct) AS sales_vs_budget_pct\nFROM model\nWHERE dim_calendar.year = 2021\nGROUP BY ALL\nORDER BY country, category",
     "status": "reference",
     "rows": [
      [
       "Germany",
       "Clearance",
       "9037851",
       "9019629",
       "0.00202026047856"
      ],
      [
       "Germany",
       "Hair Care",
       "9055308",
       "9096916",
       "-0.00457385777773"
      ],
      [
       "Germany",
       "Laundry",
       "9061647",
       "9124124",
       "-0.00684745187593"
      ],
      [
       "Germany",
       "Oral Care",
       "9048601",
       "9083304",
       "-0.00382052609931"
      ],
      [
       "Poland",
       "Clearance",
       "7674383",
       "7664571",
       "0.00128017602029"
      ],
      [
       "Poland",
       "Hair Care",
       "7693248",
       "7666825",
       "0.00344640708507"
      ],
      [
       "Poland",
       "Laundry",
       "7688170",
       "7732939",
       "-0.00578939003657"
      ],
      [
       "Poland",
       "Oral Care",
       "7699261",
       "7709646",
       "-0.00134701385771"
      ],
      [
       "UK",
       "Clearance",
       "5534210",
       "5575135",
       "-0.00734062941974"
      ],
      [
       "UK",
       "Hair Care",
       "5512252",
       "5523247",
       "-0.00199067686091"
      ],
      [
       "UK",
       "Laundry",
       "5535746",
       "5480303",
       "0.0101167763899"
      ],
      [
       "UK",
       "Oral Care",
       "5529481",
       "5572849",
       "-0.007782015985"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match",
    "dbx": "match, with two views joined in the query, or with a bridge view over both facts",
    "bigquery": "**partial**: a query has one root, and from sales the budget is out of reach. Matches with a second `GRAPH_EXPAND` from the budget, joined in the query (the docs' pattern).",
    "daxsql": "reference"
   }
  },
  {
   "id": "q12",
   "folder": "q12_budget_and_growth_by_category",
   "title": "Actual vs budget and growth on last year, by category, 2021, with a total",
   "text": "Three things in one answer: sales against the budget (two facts at two grains), sales against last year (a shift in time), and a total row where both percentages are recomputed from the totals, not summed or averaged. - Power BI and Snowflake: the five measures are in the one model; Snowflake's total row is a second query. - Databricks: budget and last year live in other metric views. `dbx.sql` joins the sales and budget views and uses the window measure for last year; `dbx_workaround.sql` joins three views (sales, sales last year, budget). - BigQuery: from sales the budget is out of reach, and there is no last-year measure. `bigquery_workaround.sql` joins three `GRAPH_EXPAND`s (sales, a year back, budget); the total row is another part of the query.",
   "columns": [
    "category",
    "sales_quantity",
    "budget_quantity",
    "sales_vs_budget_pct",
    "sales_qty_ly",
    "sales_qty_yoy_pct"
   ],
   "measures": [
    false,
    true,
    true,
    true,
    true,
    true
   ],
   "reference": {
    "rows": [
     [
      "Clearance",
      "22246444",
      "22259335",
      "-0.000579127813118",
      "20698730",
      "0.0747733798161"
     ],
     [
      "Hair Care",
      "22260808",
      "22286988",
      "-0.00117467645247",
      "20682058",
      "0.0763342796931"
     ],
     [
      "Laundry",
      "22285563",
      "22337366",
      "-0.00231911855677",
      "20720113",
      "0.075552194141"
     ],
     [
      "Oral Care",
      "22277343",
      "22365799",
      "-0.00395496713531",
      "20697044",
      "0.0763538503373"
     ],
     [
      "",
      "89070158",
      "89249488",
      "-0.00200931124669",
      "82797945",
      "0.075753244842"
     ]
    ]
   },
   "runs": [
    {
     "label": "fabric",
     "platform": "fabric",
     "file": "fabric.dax",
     "code": "EVALUATE\nSUMMARIZECOLUMNS (\n    ROLLUPADDISSUBTOTAL ( dim_category[category], \"is_total\" ),\n    TREATAS ( { 2021 }, dim_calendar[year] ),\n    \"sales_quantity\", [sales_quantity],\n    \"budget_quantity\", [budget_quantity],\n    \"sales_vs_budget_pct\", [sales_vs_budget_pct],\n    \"sales_qty_ly\", [sales_qty_ly],\n    \"sales_qty_yoy_pct\", [sales_qty_yoy_pct]\n)\nORDER BY [is_total], dim_category[category]",
     "status": "match",
     "rows": [
      [
       "Clearance",
       "22246444",
       "22259335",
       "-0.000579127813118",
       "20698730",
       "0.0747733798161"
      ],
      [
       "Hair Care",
       "22260808",
       "22286988",
       "-0.00117467645247",
       "20682058",
       "0.0763342796931"
      ],
      [
       "Laundry",
       "22285563",
       "22337366",
       "-0.00231911855677",
       "20720113",
       "0.075552194141"
      ],
      [
       "Oral Care",
       "22277343",
       "22365799",
       "-0.00395496713531",
       "20697044",
       "0.0763538503373"
      ],
      [
       "",
       "89070158",
       "89249488",
       "-0.00200931124669",
       "82797945",
       "0.075753244842"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake",
     "platform": "snowflake",
     "file": "snowflake.sql",
     "code": "SELECT * FROM (\n    SELECT category, AGG(sales_quantity) AS sales_quantity, AGG(budget_quantity) AS budget_quantity, AGG(sales_vs_budget_pct) AS sales_vs_budget_pct,\n           AGG(sales_qty_ly) AS sales_qty_ly, AGG(sales_qty_yoy_pct) AS sales_qty_yoy_pct\n    FROM DAX_DEMO.MODEL.SEMANTIC_VIEW\n    WHERE year = 2021\n    GROUP BY ALL\n    UNION ALL\n    SELECT NULL, AGG(sales_quantity), AGG(budget_quantity), AGG(sales_vs_budget_pct),\n           AGG(sales_qty_ly), AGG(sales_qty_yoy_pct)\n    FROM DAX_DEMO.MODEL.SEMANTIC_VIEW\n    WHERE year = 2021\n)\nORDER BY category NULLS LAST",
     "status": "match",
     "rows": [
      [
       "Clearance",
       "22246444",
       "22259335",
       "-0.000579",
       "20698730",
       "0.074773"
      ],
      [
       "Hair Care",
       "22260808",
       "22286988",
       "-0.001175",
       "20682058",
       "0.076334"
      ],
      [
       "Laundry",
       "22285563",
       "22337366",
       "-0.002319",
       "20720113",
       "0.075552"
      ],
      [
       "Oral Care",
       "22277343",
       "22365799",
       "-0.003955",
       "20697044",
       "0.076354"
      ],
      [
       "",
       "89070158",
       "89249488",
       "-0.002009",
       "82797945",
       "0.075753"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx",
     "platform": "dbx",
     "file": "dbx.sql",
     "code": "-- Sales and last year from the sales view (last year is its window measure), budget from the budget view; joined here.\nWITH s AS (\n    SELECT category, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly\n    FROM databricks_ne.ossie_demo.sales_mv\n    WHERE year = 2021\n    GROUP BY ROLLUP (category)\n), b AS (\n    SELECT category, AGG(budget_quantity) AS budget_quantity\n    FROM databricks_ne.ossie_demo.budget_mv\n    WHERE year = 2021\n    GROUP BY ROLLUP (category)\n)\nSELECT s.category, s.sales_quantity, b.budget_quantity,\n       (s.sales_quantity - b.budget_quantity) / b.budget_quantity AS sales_vs_budget_pct,\n       s.sales_qty_ly, (s.sales_quantity - s.sales_qty_ly) / s.sales_qty_ly AS sales_qty_yoy_pct\nFROM s JOIN b ON s.category <=> b.category\nORDER BY category NULLS LAST",
     "status": "differs",
     "rows": [
      [
       "Clearance",
       "22246444",
       "22259335",
       "-5.791278131175078E-4",
       "56779",
       "390.8076049243558"
      ],
      [
       "Hair Care",
       "22260808",
       "22286988",
       "-0.001174676452466345",
       "56161",
       "395.37485087516245"
      ],
      [
       "Laundry",
       "22285563",
       "22337366",
       "-0.0023191185567716446",
       "55972",
       "397.15555992281855"
      ],
      [
       "Oral Care",
       "22277343",
       "22365799",
       "-0.0039549671353122685",
       "56304",
       "394.6618179880648"
      ],
      [
       "",
       "89070158",
       "89249488",
       "-0.00200931124669309",
       "225216",
       "394.48770069622054"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       false,
       false,
       true,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx (workaround)",
     "platform": "dbx",
     "file": "dbx_workaround.sql",
     "code": "-- Three metric views, joined by the query: sales, the fact with its date moved one year (last year), and budget.\nWITH s AS (\n    SELECT category, AGG(sales_quantity) AS sales_quantity\n    FROM databricks_ne.ossie_demo.sales_mv\n    WHERE year = 2021\n    GROUP BY ROLLUP (category)\n), ly AS (\n    SELECT category, AGG(sales_qty_ly) AS sales_qty_ly\n    FROM databricks_ne.ossie_demo.sales_ly_mv\n    WHERE year = 2021\n    GROUP BY ROLLUP (category)\n), b AS (\n    SELECT category, AGG(budget_quantity) AS budget_quantity\n    FROM databricks_ne.ossie_demo.budget_mv\n    WHERE year = 2021\n    GROUP BY ROLLUP (category)\n)\nSELECT s.category, s.sales_quantity, b.budget_quantity,\n       (s.sales_quantity - b.budget_quantity) / b.budget_quantity AS sales_vs_budget_pct,\n       ly.sales_qty_ly, (s.sales_quantity - ly.sales_qty_ly) / ly.sales_qty_ly AS sales_qty_yoy_pct\nFROM s JOIN ly ON s.category <=> ly.category JOIN b ON s.category <=> b.category\nORDER BY category NULLS LAST",
     "status": "match",
     "rows": [
      [
       "Clearance",
       "22246444",
       "22259335",
       "-5.791278131175078E-4",
       "20698730",
       "0.07477337981605635"
      ],
      [
       "Hair Care",
       "22260808",
       "22286988",
       "-0.001174676452466345",
       "20682058",
       "0.07633427969305569"
      ],
      [
       "Laundry",
       "22285563",
       "22337366",
       "-0.0023191185567716446",
       "20720113",
       "0.07555219414102617"
      ],
      [
       "Oral Care",
       "22277343",
       "22365799",
       "-0.0039549671353122685",
       "20697044",
       "0.07635385033727522"
      ],
      [
       "",
       "89070158",
       "89249488",
       "-0.00200931124669309",
       "82797945",
       "0.07575324484200664"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery",
     "platform": "bigquery",
     "file": "bigquery.sql",
     "code": "-- From sales the budget is not reachable, and there is no last-year measure; the total row is a second query.\nSELECT * FROM (\n    SELECT category_category AS category, AGG(sales_sales_quantity) AS sales_quantity\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_year = 2021\n    GROUP BY ALL\n    UNION ALL\n    SELECT NULL, AGG(sales_sales_quantity)\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_year = 2021\n)\nORDER BY category NULLS LAST",
     "status": "partial",
     "rows": [
      [
       "Clearance",
       "22246444",
       "",
       "",
       "",
       ""
      ],
      [
       "Hair Care",
       "22260808",
       "",
       "",
       "",
       ""
      ],
      [
       "Laundry",
       "22285563",
       "",
       "",
       "",
       ""
      ],
      [
       "Oral Care",
       "22277343",
       "",
       "",
       "",
       ""
      ],
      [
       "",
       "89070158",
       "",
       "",
       "",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       true,
       true,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true,
       true,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery (workaround)",
     "platform": "bigquery",
     "file": "bigquery_workaround.sql",
     "code": "-- Three GRAPH_EXPANDs joined on category: sales, sales a year back, budget. The total row is a fourth part.\nWITH s AS (\n    SELECT category_category AS category, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_year = 2021\n    GROUP BY ALL\n), ly AS (\n    SELECT category_category AS category, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    WHERE calendar_year = 2020\n    GROUP BY ALL\n), b AS (\n    SELECT category_category AS category, AGG(budget_budget_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"budget\")\n    WHERE calendar_year = 2021\n    GROUP BY ALL\n), r AS (\n    SELECT category, s.q, b.q AS qb, ly.q AS qly FROM s FULL JOIN b USING (category) LEFT JOIN ly USING (category)\n    UNION ALL\n    SELECT NULL, (SELECT SUM(q) FROM s), (SELECT SUM(q) FROM b), (SELECT SUM(q) FROM ly)\n)\nSELECT category, q AS sales_quantity, qb AS budget_quantity, SAFE_DIVIDE(q - qb, qb) AS sales_vs_budget_pct,\n       qly AS sales_qty_ly, SAFE_DIVIDE(q - qly, qly) AS sales_qty_yoy_pct\nFROM r\nORDER BY category NULLS LAST",
     "status": "match",
     "rows": [
      [
       "Clearance",
       "22246444",
       "22259335",
       "-0.000579127813118",
       "20698730",
       "0.0747733798161"
      ],
      [
       "Hair Care",
       "22260808",
       "22286988",
       "-0.00117467645247",
       "20682058",
       "0.0763342796931"
      ],
      [
       "Laundry",
       "22285563",
       "22337366",
       "-0.00231911855677",
       "20720113",
       "0.075552194141"
      ],
      [
       "Oral Care",
       "22277343",
       "22365799",
       "-0.00395496713531",
       "20697044",
       "0.0763538503373"
      ],
      [
       "",
       "89070158",
       "89249488",
       "-0.00200931124669",
       "82797945",
       "0.075753244842"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "daxsql",
     "platform": "daxsql",
     "file": "daxsql.sql",
     "code": "SELECT dim_category.category, GROUPING(dim_category.category) AS is_total,\n       AGG(sales_quantity) AS sales_quantity,\n       AGG(budget_quantity) AS budget_quantity,\n       AGG(sales_vs_budget_pct) AS sales_vs_budget_pct,\n       AGG(sales_qty_ly) AS sales_qty_ly,\n       AGG(sales_qty_yoy_pct) AS sales_qty_yoy_pct\nFROM model\nWHERE dim_calendar.year = 2021\nGROUP BY ROLLUP(dim_category.category)\nORDER BY is_total, category",
     "status": "reference",
     "rows": [
      [
       "Clearance",
       "22246444",
       "22259335",
       "-0.000579127813118",
       "20698730",
       "0.0747733798161"
      ],
      [
       "Hair Care",
       "22260808",
       "22286988",
       "-0.00117467645247",
       "20682058",
       "0.0763342796931"
      ],
      [
       "Laundry",
       "22285563",
       "22337366",
       "-0.00231911855677",
       "20720113",
       "0.075552194141"
      ],
      [
       "Oral Care",
       "22277343",
       "22365799",
       "-0.00395496713531",
       "20697044",
       "0.0763538503373"
      ],
      [
       "",
       "89070158",
       "89249488",
       "-0.00200931124669",
       "82797945",
       "0.075753244842"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match; the total row is a second query",
    "dbx": "**differs**: last year is one day's value. Matches with three views joined in the query (sales, `sales_ly_mv`, budget).",
    "bigquery": "**partial**, as q11. Matches with three `GRAPH_EXPAND`s joined in the query (sales, a year back, budget).",
    "daxsql": "reference"
   }
  },
  {
   "id": "q13",
   "folder": "q13_days_and_sales_by_year",
   "title": "Days in the calendar and sales, by year (2020-2023)",
   "text": "A count on a dimension, written in the query (no measure in the model). The calendar runs to 2023; sales stop at 2022. Counting the calendar gives 2023 with 365 days and no sales. Counting from the fact gives only the days with sales, so 2023 is missing.",
   "columns": [
    "year",
    "day_count",
    "sales_quantity"
   ],
   "measures": [
    false,
    true,
    true
   ],
   "reference": {
    "rows": [
     [
      "2020",
      "366",
      "82797945"
     ],
     [
      "2021",
      "365",
      "89070158"
     ],
     [
      "2022",
      "365",
      "94792246"
     ],
     [
      "2023",
      "365",
      ""
     ]
    ]
   },
   "runs": [
    {
     "label": "fabric",
     "platform": "fabric",
     "file": "fabric.dax",
     "code": "EVALUATE\nSUMMARIZECOLUMNS (\n    dim_calendar[year],\n    \"day_count\", COUNTROWS ( dim_calendar ),\n    \"sales_quantity\", [sales_quantity]\n)\nORDER BY dim_calendar[year]",
     "status": "match",
     "rows": [
      [
       "2020",
       "366",
       "82797945"
      ],
      [
       "2021",
       "365",
       "89070158"
      ],
      [
       "2022",
       "365",
       "94792246"
      ],
      [
       "2023",
       "365",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake",
     "platform": "snowflake",
     "file": "snowflake.sql",
     "code": "SELECT year, COUNT(date_key) AS day_count, AGG(sales_quantity) AS sales_quantity\nFROM DAX_DEMO.MODEL.SEMANTIC_VIEW\nGROUP BY ALL\nORDER BY year",
     "status": "match",
     "rows": [
      [
       "2020",
       "366",
       "82797945"
      ],
      [
       "2021",
       "365",
       "89070158"
      ],
      [
       "2022",
       "365",
       "94792246"
      ],
      [
       "2023",
       "365",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx",
     "platform": "dbx",
     "file": "dbx.sql",
     "code": "SELECT year, COUNT(DISTINCT date_key) AS day_count, AGG(sales_quantity) AS sales_quantity\nFROM databricks_ne.ossie_demo.sales_mv\nGROUP BY ALL\nORDER BY year",
     "status": "differs",
     "rows": [
      [
       "2020",
       "366",
       "82797945"
      ],
      [
       "2021",
       "365",
       "89070158"
      ],
      [
       "2022",
       "365",
       "94792246"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": [
      [
       "2023",
       "365",
       ""
      ]
     ]
    },
    {
     "label": "dbx (workaround)",
     "platform": "dbx",
     "file": "dbx_workaround.sql",
     "code": "-- Count the calendar from the calendar's own metric view, then join the sales view on year.\nWITH c AS (\n    SELECT year, COUNT(*) AS day_count FROM databricks_ne.ossie_demo.calendar_mv GROUP BY ALL\n), s AS (\n    SELECT year, AGG(sales_quantity) AS sales_quantity FROM databricks_ne.ossie_demo.sales_mv GROUP BY ALL\n)\nSELECT COALESCE(c.year, s.year) AS year, c.day_count, s.sales_quantity\nFROM c FULL OUTER JOIN s ON c.year = s.year\nORDER BY year",
     "status": "match",
     "rows": [
      [
       "2020",
       "366",
       "82797945"
      ],
      [
       "2021",
       "365",
       "89070158"
      ],
      [
       "2022",
       "365",
       "94792246"
      ],
      [
       "2023",
       "365",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery",
     "platform": "bigquery",
     "file": "bigquery.sql",
     "code": "-- From sales, the calendar is reached only through sales rows.\nSELECT calendar_year AS year, COUNT(DISTINCT calendar_date_key) AS day_count, AGG(sales_sales_quantity) AS sales_quantity\nFROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\nGROUP BY ALL\nORDER BY year",
     "status": "differs",
     "rows": [
      [
       "2020",
       "366",
       "82797945"
      ],
      [
       "2021",
       "365",
       "89070158"
      ],
      [
       "2022",
       "365",
       "94792246"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": [
      [
       "2023",
       "365",
       ""
      ]
     ]
    },
    {
     "label": "bigquery (workaround)",
     "platform": "bigquery",
     "file": "bigquery_workaround.sql",
     "code": "-- The calendar as its own root, joined to the sales by year.\nWITH c AS (\n    SELECT calendar_year AS year, COUNT(*) AS day_count\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"calendar\")\n    GROUP BY ALL\n), s AS (\n    SELECT calendar_year AS year, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    GROUP BY ALL\n)\nSELECT year, c.day_count, s.q AS sales_quantity\nFROM c LEFT JOIN s USING (year)\nORDER BY year",
     "status": "match",
     "rows": [
      [
       "2020",
       "366",
       "82797945"
      ],
      [
       "2021",
       "365",
       "89070158"
      ],
      [
       "2022",
       "365",
       "94792246"
      ],
      [
       "2023",
       "365",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "daxsql",
     "platform": "daxsql",
     "file": "daxsql.sql",
     "code": "SELECT dim_calendar.year, COUNT(dim_calendar.date_key) AS day_count, AGG(sales_quantity) AS sales_quantity\nFROM model\nGROUP BY ALL\nORDER BY year",
     "status": "reference",
     "rows": [
      [
       "2020",
       "366",
       "82797945"
      ],
      [
       "2021",
       "365",
       "89070158"
      ],
      [
       "2022",
       "365",
       "94792246"
      ],
      [
       "2023",
       "365",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ],
      [
       false,
       false,
       false
      ]
     ],
     "missing": []
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match",
    "dbx": "**differs**: 2023 is missing. Matches with a calendar view, joined in the query.",
    "bigquery": "**differs**: 2023 is missing (from sales, the calendar is reached only through sales rows). Matches with the calendar as its own root, joined in the query.",
    "daxsql": "reference"
   }
  },
  {
   "id": "q14",
   "folder": "q14_growth_minus_blank",
   "title": "Growth on last year in units, by year (2020-2023): a measure minus a blank",
   "text": "`sales_quantity - sales_qty_ly`, written in the query. 2020 has no last year (the data starts in 2020) and 2023 has no sales (they stop at 2022), so each end has one side blank. DAX reads a blank as 0 in `+` and `-`: 2020's growth is all of its sales, 2023's is minus last year. SQL's NULL makes the whole expression NULL: no growth either year. Neither is wrong; they are two languages. The reference, dax-sql, does as DAX does, so a SQL engine matches only with `COALESCE`. - Power BI: the expression in the DAX query. - Snowflake: `AGG(a) - AGG(b)` in the semantic SQL; `snowflake_workaround.sql` wraps each side in `COALESCE(..., 0)`. - Databricks: `dbx.sql` subtracts the window measure (wrong by year, as in q05, and NULL at both ends); `dbx_workaround.sql` joins the shifted fact's view (as q05) and uses `COALESCE`. - BigQuery: no last-year measure, and from sales 2023 is missing. `bigquery_workaround.sql` takes the calendar as root, joins sales and sales a year back by year, and uses `COALESCE`.",
   "columns": [
    "year",
    "sales_quantity",
    "sales_qty_ly",
    "sales_qty_growth"
   ],
   "measures": [
    false,
    true,
    true,
    true
   ],
   "reference": {
    "rows": [
     [
      "2020",
      "82797945",
      "",
      "82797945"
     ],
     [
      "2021",
      "89070158",
      "82797945",
      "6272213"
     ],
     [
      "2022",
      "94792246",
      "89070158",
      "5722088"
     ],
     [
      "2023",
      "",
      "94792246",
      "-94792246"
     ]
    ]
   },
   "runs": [
    {
     "label": "fabric",
     "platform": "fabric",
     "file": "fabric.dax",
     "code": "EVALUATE\nSUMMARIZECOLUMNS (\n    dim_calendar[year],\n    \"sales_quantity\", [sales_quantity],\n    \"sales_qty_ly\", [sales_qty_ly],\n    \"sales_qty_growth\", [sales_quantity] - [sales_qty_ly]\n)\nORDER BY dim_calendar[year]",
     "status": "match",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       "82797945"
      ],
      [
       "2021",
       "89070158",
       "82797945",
       "6272213"
      ],
      [
       "2022",
       "94792246",
       "89070158",
       "5722088"
      ],
      [
       "2023",
       "",
       "94792246",
       "-94792246"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake",
     "platform": "snowflake",
     "file": "snowflake.sql",
     "code": "SELECT year, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly,\n       AGG(sales_quantity) - AGG(sales_qty_ly) AS sales_qty_growth\nFROM DAX_DEMO.MODEL.SEMANTIC_VIEW\nGROUP BY ALL\nORDER BY year",
     "status": "differs",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       ""
      ],
      [
       "2021",
       "89070158",
       "82797945",
       "6272213"
      ],
      [
       "2022",
       "94792246",
       "89070158",
       "5722088"
      ],
      [
       "2023",
       "",
       "94792246",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       true
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake (workaround)",
     "platform": "snowflake",
     "file": "snowflake_workaround.sql",
     "code": "-- A missing side counts as 0, as DAX reads a blank.\nSELECT year, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly,\n       COALESCE(AGG(sales_quantity), 0) - COALESCE(AGG(sales_qty_ly), 0) AS sales_qty_growth\nFROM DAX_DEMO.MODEL.SEMANTIC_VIEW\nGROUP BY ALL\nORDER BY year",
     "status": "match",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       "82797945"
      ],
      [
       "2021",
       "89070158",
       "82797945",
       "6272213"
      ],
      [
       "2022",
       "94792246",
       "89070158",
       "5722088"
      ],
      [
       "2023",
       "",
       "94792246",
       "-94792246"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx",
     "platform": "dbx",
     "file": "dbx.sql",
     "code": "SELECT year, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly) AS sales_qty_ly,\n       AGG(sales_quantity) - AGG(sales_qty_ly) AS sales_qty_growth\nFROM databricks_ne.ossie_demo.sales_mv\nGROUP BY ALL\nORDER BY year",
     "status": "differs",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       ""
      ],
      [
       "2021",
       "89070158",
       "225216",
       "88844942"
      ],
      [
       "2022",
       "94792246",
       "243036",
       "94549210"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ]
     ],
     "missing": [
      [
       "2023",
       "",
       "94792246",
       "-94792246"
      ]
     ]
    },
    {
     "label": "dbx (workaround)",
     "platform": "dbx",
     "file": "dbx_workaround.sql",
     "code": "-- Last year from the shifted fact's view (as q05), joined by the query; a missing side counts as 0, as DAX reads a blank.\nWITH cur AS (\n    SELECT year, AGG(sales_quantity) AS sales_quantity FROM databricks_ne.ossie_demo.sales_mv GROUP BY ALL\n), ly AS (\n    SELECT year, AGG(sales_qty_ly) AS sales_qty_ly FROM databricks_ne.ossie_demo.sales_ly_mv GROUP BY ALL\n)\nSELECT COALESCE(cur.year, ly.year) AS year, cur.sales_quantity, ly.sales_qty_ly,\n       COALESCE(cur.sales_quantity, 0) - COALESCE(ly.sales_qty_ly, 0) AS sales_qty_growth\nFROM cur FULL OUTER JOIN ly ON cur.year = ly.year\nORDER BY year",
     "status": "match",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       "82797945"
      ],
      [
       "2021",
       "89070158",
       "82797945",
       "6272213"
      ],
      [
       "2022",
       "94792246",
       "89070158",
       "5722088"
      ],
      [
       "2023",
       "",
       "94792246",
       "-94792246"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery",
     "platform": "bigquery",
     "file": "bigquery.sql",
     "code": "-- No last-year measure, and from sales the calendar is reached only through sales rows (no 2023).\nSELECT calendar_year AS year, AGG(sales_sales_quantity) AS sales_quantity\nFROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\nGROUP BY ALL\nORDER BY year",
     "status": "differs",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       ""
      ],
      [
       "2021",
       "89070158",
       "",
       ""
      ],
      [
       "2022",
       "94792246",
       "",
       ""
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       true
      ],
      [
       false,
       false,
       true,
       true
      ],
      [
       false,
       false,
       true,
       true
      ]
     ],
     "missing": [
      [
       "2023",
       "",
       "94792246",
       "-94792246"
      ]
     ]
    },
    {
     "label": "bigquery (workaround)",
     "platform": "bigquery",
     "file": "bigquery_workaround.sql",
     "code": "-- The calendar as its own root (so 2023 stays), sales and sales a year back joined by year; a missing side counts as\n-- 0, as DAX reads a blank.\nWITH c AS (\n    SELECT DISTINCT calendar_year AS year\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"calendar\")\n), s AS (\n    SELECT calendar_year AS year, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    GROUP BY ALL\n), ly AS (\n    SELECT calendar_year + 1 AS year, AGG(sales_sales_quantity) AS q\n    FROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"sales\")\n    GROUP BY ALL\n)\nSELECT year, s.q AS sales_quantity, ly.q AS sales_qty_ly, COALESCE(s.q, 0) - COALESCE(ly.q, 0) AS sales_qty_growth\nFROM c LEFT JOIN s USING (year) LEFT JOIN ly USING (year)\nORDER BY year",
     "status": "match",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       "82797945"
      ],
      [
       "2021",
       "89070158",
       "82797945",
       "6272213"
      ],
      [
       "2022",
       "94792246",
       "89070158",
       "5722088"
      ],
      [
       "2023",
       "",
       "94792246",
       "-94792246"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "daxsql",
     "platform": "daxsql",
     "file": "daxsql.sql",
     "code": "SELECT dim_calendar.year,\n       AGG(sales_quantity) AS sales_quantity,\n       AGG(sales_qty_ly) AS sales_qty_ly,\n       AGG(sales_quantity) - AGG(sales_qty_ly) AS sales_qty_growth\nFROM model\nGROUP BY ALL\nORDER BY year",
     "status": "reference",
     "rows": [
      [
       "2020",
       "82797945",
       "",
       "82797945"
      ],
      [
       "2021",
       "89070158",
       "82797945",
       "6272213"
      ],
      [
       "2022",
       "94792246",
       "89070158",
       "5722088"
      ],
      [
       "2023",
       "",
       "94792246",
       "-94792246"
      ]
     ],
     "diff": [
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ],
      [
       false,
       false,
       false,
       false
      ]
     ],
     "missing": []
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "**differs**: 2020 and 2023 are NULL (SQL's `x - NULL`; DAX reads a blank as 0). Matches with `COALESCE(..., 0)` on each side.",
    "dbx": "**differs**: NULL at both ends, 2023 missing, and last year is one day's value. Matches with `sales_ly_mv`, joined in the query, and `COALESCE`.",
    "bigquery": "**differs**: no last-year measure, and 2023 is missing. Matches with the calendar as root, sales and a year back joined, and `COALESCE`.",
    "daxsql": "reference"
   }
  },
  {
   "id": "q15",
   "folder": "q15_budget_blank_row",
   "title": "Budget by category except Laundry, 2022: budget rows whose category isn't in the category table",
   "text": "The budget has 12 rows for Germany in 2022 under Skin Care, a category `dim_category` doesn't have (50,000 units a month, 600,000 in all; `python tools/sf.py orphans`). Every model relates the budget to `dim_category` by category. Grouped by category, every platform keeps them: Power BI under its blank row, Snowflake, Databricks and BigQuery under NULL, as their joins from the fact to the dimension are outer. The filter is where they part. In DAX the blank row is a member of the category column, and a blank is not \"Laundry\", so `category <> \"Laundry\"` keeps it. In SQL, `NULL <> 'Laundry'` is not true, so the same filter drops the 600,000 with no error. - Snowflake, Databricks and BigQuery: `<platform>_workaround.sql` says what DAX does: `category <> 'Laundry' OR category IS NULL`.",
   "columns": [
    "category",
    "budget_quantity"
   ],
   "measures": [
    false,
    true
   ],
   "reference": {
    "rows": [
     [
      "",
      "600000"
     ],
     [
      "Clearance",
      "23984711"
     ],
     [
      "Hair Care",
      "23839126"
     ],
     [
      "Oral Care",
      "23494372"
     ]
    ]
   },
   "runs": [
    {
     "label": "fabric",
     "platform": "fabric",
     "file": "fabric.dax",
     "code": "EVALUATE\nSUMMARIZECOLUMNS (\n    dim_category[category],\n    TREATAS ( { 2022 }, dim_calendar[year] ),\n    FILTER ( ALL ( dim_category[category] ), dim_category[category] <> \"Laundry\" ),\n    \"budget_quantity\", [budget_quantity]\n)\nORDER BY dim_category[category]",
     "status": "match",
     "rows": [
      [
       "",
       "600000"
      ],
      [
       "Clearance",
       "23984711"
      ],
      [
       "Hair Care",
       "23839126"
      ],
      [
       "Oral Care",
       "23494372"
      ]
     ],
     "diff": [
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "snowflake",
     "platform": "snowflake",
     "file": "snowflake.sql",
     "code": "SELECT category, AGG(budget_quantity) AS budget_quantity\nFROM DAX_DEMO.MODEL.SEMANTIC_VIEW\nWHERE year = 2022 AND category <> 'Laundry'\nGROUP BY ALL\nORDER BY category",
     "status": "differs",
     "rows": [
      [
       "Clearance",
       "23984711"
      ],
      [
       "Hair Care",
       "23839126"
      ],
      [
       "Oral Care",
       "23494372"
      ]
     ],
     "diff": [
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ]
     ],
     "missing": [
      [
       "",
       "600000"
      ]
     ]
    },
    {
     "label": "snowflake (workaround)",
     "platform": "snowflake",
     "file": "snowflake_workaround.sql",
     "code": "-- The rows without a category are not Laundry either, as DAX reads its blank row.\nSELECT category, AGG(budget_quantity) AS budget_quantity\nFROM DAX_DEMO.MODEL.SEMANTIC_VIEW\nWHERE year = 2022 AND (category <> 'Laundry' OR category IS NULL)\nGROUP BY ALL\nORDER BY category",
     "status": "match",
     "rows": [
      [
       "Clearance",
       "23984711"
      ],
      [
       "Hair Care",
       "23839126"
      ],
      [
       "Oral Care",
       "23494372"
      ],
      [
       "",
       "600000"
      ]
     ],
     "diff": [
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "dbx",
     "platform": "dbx",
     "file": "dbx.sql",
     "code": "SELECT category, AGG(budget_quantity) AS budget_quantity\nFROM databricks_ne.ossie_demo.budget_mv\nWHERE year = 2022 AND category <> 'Laundry'\nGROUP BY ALL\nORDER BY category",
     "status": "differs",
     "rows": [
      [
       "Clearance",
       "23984711"
      ],
      [
       "Hair Care",
       "23839126"
      ],
      [
       "Oral Care",
       "23494372"
      ]
     ],
     "diff": [
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ]
     ],
     "missing": [
      [
       "",
       "600000"
      ]
     ]
    },
    {
     "label": "dbx (workaround)",
     "platform": "dbx",
     "file": "dbx_workaround.sql",
     "code": "-- The rows without a category are not Laundry either, as DAX reads its blank row.\nSELECT category, AGG(budget_quantity) AS budget_quantity\nFROM databricks_ne.ossie_demo.budget_mv\nWHERE year = 2022 AND (category <> 'Laundry' OR category IS NULL)\nGROUP BY ALL\nORDER BY category",
     "status": "match",
     "rows": [
      [
       "",
       "600000"
      ],
      [
       "Clearance",
       "23984711"
      ],
      [
       "Hair Care",
       "23839126"
      ],
      [
       "Oral Care",
       "23494372"
      ]
     ],
     "diff": [
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "bigquery",
     "platform": "bigquery",
     "file": "bigquery.sql",
     "code": "SELECT category_category AS category, AGG(budget_budget_quantity) AS budget_quantity\nFROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"budget\")\nWHERE calendar_year = 2022 AND category_category <> 'Laundry'\nGROUP BY ALL\nORDER BY category",
     "status": "differs",
     "rows": [
      [
       "Clearance",
       "23984711"
      ],
      [
       "Hair Care",
       "23839126"
      ],
      [
       "Oral Care",
       "23494372"
      ]
     ],
     "diff": [
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ]
     ],
     "missing": [
      [
       "",
       "600000"
      ]
     ]
    },
    {
     "label": "bigquery (workaround)",
     "platform": "bigquery",
     "file": "bigquery_workaround.sql",
     "code": "-- The rows without a category are not Laundry either, as DAX reads its blank row.\nSELECT category_category AS category, AGG(budget_budget_quantity) AS budget_quantity\nFROM GRAPH_EXPAND(\"ossie_bench.sales_graph\", start_node => \"budget\")\nWHERE calendar_year = 2022 AND (category_category <> 'Laundry' OR category_category IS NULL)\nGROUP BY ALL\nORDER BY category",
     "status": "match",
     "rows": [
      [
       "",
       "600000"
      ],
      [
       "Clearance",
       "23984711"
      ],
      [
       "Hair Care",
       "23839126"
      ],
      [
       "Oral Care",
       "23494372"
      ]
     ],
     "diff": [
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ]
     ],
     "missing": []
    },
    {
     "label": "daxsql",
     "platform": "daxsql",
     "file": "daxsql.sql",
     "code": "SELECT dim_category.category, AGG(budget_quantity) AS budget_quantity\nFROM model\nWHERE dim_calendar.year = 2022 AND dim_category.category <> 'Laundry'\nGROUP BY ALL\nORDER BY category",
     "status": "reference",
     "rows": [
      [
       "",
       "600000"
      ],
      [
       "Clearance",
       "23984711"
      ],
      [
       "Hair Care",
       "23839126"
      ],
      [
       "Oral Care",
       "23494372"
      ]
     ],
     "diff": [
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ],
      [
       false,
       false
      ]
     ],
     "missing": []
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "**differs**: the 600,000 of budget without a category are dropped (`NULL <> 'Laundry'` isn't true; DAX's blank row is not Laundry). Matches with `OR category IS NULL`.",
    "dbx": "**differs**, as Snowflake. Matches with `OR category IS NULL`.",
    "bigquery": "**differs**, as Snowflake. Matches with `OR category IS NULL`.",
    "daxsql": "reference"
   }
  }
 ]
};
