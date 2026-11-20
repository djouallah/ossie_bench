window.DATA = {
 "measures": [
  {
   "name": "sales_quantity",
   "meaning": "Units sold.",
   "standard": "yes"
  },
  {
   "name": "net_profit_total",
   "meaning": "Net profit (negative for Clearance).",
   "standard": "yes"
  },
  {
   "name": "budget_quantity",
   "meaning": "Budgeted units, by month, country and category.",
   "standard": "yes"
  },
  {
   "name": "sales_vs_budget_pct",
   "meaning": "(sales - budget) / budget. Each side is summed at its own table's grain first.",
   "standard": "yes: `AGG()` of the two measures above"
  },
  {
   "name": "sales_qty_ly",
   "meaning": "Units sold in the same period one calendar year earlier, at whatever grain is asked (day, month, year, total).",
   "standard": "no: period over period"
  },
  {
   "name": "net_profit_ly",
   "meaning": "Net profit in the same period one calendar year earlier.",
   "standard": "no: period over period"
  },
  {
   "name": "sales_qty_fly",
   "meaning": "Units sold in the same period of the last fiscal year: 364 days earlier (4-4-5, 52 weeks).",
   "standard": "no: period over period"
  },
  {
   "name": "sales_qty_yoy_pct",
   "meaning": "(sales - last year) / last year.",
   "standard": "no: period over period"
  },
  {
   "name": "country_qty_all_customers",
   "meaning": "Units sold to every customer, whatever customers the query filters or shows. Every other filter is kept.",
   "standard": "no: fields included in or excluded from the grouping"
  },
  {
   "name": "customer_share_all",
   "meaning": "sales / `country_qty_all_customers`.",
   "standard": "no: fields included in or excluded from the grouping"
  },
  {
   "name": "country_total_allselected",
   "meaning": "Units sold to the customers the query shows, taken together.",
   "standard": "no: fields included in or excluded from the grouping"
  },
  {
   "name": "customer_share_allselected",
   "meaning": "sales / `country_total_allselected`.",
   "standard": "no: fields included in or excluded from the grouping"
  },
  {
   "name": "country_total_allexcept",
   "meaning": "Units sold with every filter removed except those on country and year.",
   "standard": "no: fields included in or excluded from the grouping"
  },
  {
   "name": "country_total_fixed",
   "meaning": "Units sold for the country and the year shown, whatever else is filtered.",
   "standard": "no: fields included in or excluded from the grouping"
  },
  {
   "name": "country_qty_all_cust_cat",
   "meaning": "Units sold to every customer in every category. Every other filter is kept.",
   "standard": "no: fields included in or excluded from the grouping"
  },
  {
   "name": "cust_cat_share_all",
   "meaning": "sales / `country_qty_all_cust_cat`.",
   "standard": "no: fields included in or excluded from the grouping"
  }
 ],
 "ossie": {
  "version": "0.3.0.dev0",
  "yaml": "# The baseline: the model in standard Ossie, portable SQL only (expression.sql), no vendor dialect and no extension.\n# Version 0.3.0.dev0 is the unreleased development version on apache/ossie main (read 2026-11-20); it can still change.\n# 7 datasets, 8 relationships, and the 4 measures the standard can express: three sums, each declared on its own\n# dataset, and one ratio across the two facts that reads them with AGG(). The other 12 are defined in words in\n# measures.md; each platform writes them in its own language. Sources are bare table names: each platform\n# prefixes its own schema.\nversion: 0.3.0.dev0\nname: sales_and_budget\ndescription: Sales by day, store and product, and a monthly budget by country and category (2020-2022).\ndatasets:\n- name: fact_sales\n  source: fact_sales\n  primary_key:\n  - sale_date\n  - store_id\n  - product_id\n  description: One row per day, store and product.\n  fields:\n  - name: sale_date\n    expression:\n      sql: sale_date\n    datatype: Date\n  - name: store_id\n    expression:\n      sql: store_id\n    datatype: Integer\n  - name: product_id\n    expression:\n      sql: product_id\n    datatype: Integer\n  - name: sales_qty\n    expression:\n      sql: sales_qty\n    datatype: Integer\n  - name: net_profit\n    expression:\n      sql: net_profit\n    datatype: Float\n  metrics:\n  - name: sales_quantity\n    description: Units sold.\n    expression:\n      sql: SUM(sales_qty)\n  - name: net_profit_total\n    description: Net profit (negative for Clearance).\n    expression:\n      sql: SUM(net_profit)\n- name: fact_budget\n  source: fact_budget\n  primary_key:\n  - month_start\n  - country\n  - category\n  description: One row per month, country and category. month_start is the first day of the month.\n  fields:\n  - name: month_start\n    expression:\n      sql: month_start\n    datatype: Date\n  - name: country\n    expression:\n      sql: country\n    datatype: String\n  - name: category\n    expression:\n      sql: category\n    datatype: String\n  - name: budget_qty\n    expression:\n      sql: budget_qty\n    datatype: Integer\n  metrics:\n  - name: budget_quantity\n    description: Budgeted units (month x country x category).\n    expression:\n      sql: SUM(budget_qty)\n- name: dim_calendar\n  source: dim_calendar\n  primary_key:\n  - date_key\n  description: Calendar 2020-2023, with 4-4-5 fiscal periods (52-week fiscal years starting 2019-12-30).\n  fields:\n  - name: date_key\n    expression:\n      sql: date_key\n    datatype: Date\n    dimension:\n      is_time: true\n  - name: year\n    expression:\n      sql: year\n    datatype: Integer\n    dimension:\n      is_time: false\n  - name: year_month_num\n    expression:\n      sql: year_month_num\n    datatype: Integer\n    dimension:\n      is_time: false\n  - name: year_month_name\n    expression:\n      sql: year_month_name\n    datatype: String\n    dimension:\n      is_time: false\n  - name: month_start\n    expression:\n      sql: month_start\n    datatype: Date\n    dimension:\n      is_time: true\n  - name: year_start\n    expression:\n      sql: year_start\n    datatype: Date\n    dimension:\n      is_time: true\n  - name: fiscal_year\n    expression:\n      sql: fiscal_year\n    datatype: Integer\n    dimension:\n      is_time: false\n  - name: fiscal_period\n    expression:\n      sql: fiscal_period\n    datatype: Integer\n    dimension:\n      is_time: false\n  - name: fiscal_period_name\n    expression:\n      sql: fiscal_period_name\n    datatype: String\n    dimension:\n      is_time: false\n  - name: fiscal_period_start\n    expression:\n      sql: fiscal_period_start\n    datatype: Date\n    dimension:\n      is_time: true\n  - name: fiscal_year_start\n    expression:\n      sql: fiscal_year_start\n    datatype: Date\n    dimension:\n      is_time: true\n- name: dim_product\n  source: dim_product\n  primary_key:\n  - product_id\n  description: 40 products, 8 brands. Its category is a key to dim_category (Clearance has negative margins).\n  fields:\n  - name: product_id\n    expression:\n      sql: product_id\n    datatype: Integer\n    dimension:\n      is_time: false\n  - name: product_name\n    expression:\n      sql: product_name\n    datatype: String\n    dimension:\n      is_time: false\n  - name: brand\n    expression:\n      sql: brand\n    datatype: String\n    dimension:\n      is_time: false\n  - name: manufacturer\n    expression:\n      sql: manufacturer\n    datatype: String\n    dimension:\n      is_time: false\n  - name: category\n    expression:\n      sql: category\n    datatype: String\n- name: dim_category\n  source: dim_category\n  primary_key:\n  - category\n  description: 4 categories, shared by sales (through product) and budget.\n  fields:\n  - name: category\n    expression:\n      sql: category\n    datatype: String\n    dimension:\n      is_time: false\n- name: dim_store\n  source: dim_store\n  primary_key:\n  - store_id\n  description: 55 stores; a customer is a store chain within one country. Its country is a key to dim_country.\n  fields:\n  - name: store_id\n    expression:\n      sql: store_id\n    datatype: Integer\n    dimension:\n      is_time: false\n  - name: store_name\n    expression:\n      sql: store_name\n    datatype: String\n    dimension:\n      is_time: false\n  - name: customer\n    expression:\n      sql: customer\n    datatype: String\n    dimension:\n      is_time: false\n  - name: country\n    expression:\n      sql: country\n    datatype: String\n- name: dim_country\n  source: dim_country\n  primary_key:\n  - country\n  description: 3 countries, shared by sales (through store) and budget.\n  fields:\n  - name: country\n    expression:\n      sql: country\n    datatype: String\n    dimension:\n      is_time: false\nrelationships:\n- name: sales_to_calendar\n  from: fact_sales\n  to: dim_calendar\n  from_columns:\n  - sale_date\n  to_columns:\n  - date_key\n- name: sales_to_product\n  from: fact_sales\n  to: dim_product\n  from_columns:\n  - product_id\n  to_columns:\n  - product_id\n- name: sales_to_store\n  from: fact_sales\n  to: dim_store\n  from_columns:\n  - store_id\n  to_columns:\n  - store_id\n- name: product_to_category\n  from: dim_product\n  to: dim_category\n  from_columns:\n  - category\n  to_columns:\n  - category\n- name: store_to_country\n  from: dim_store\n  to: dim_country\n  from_columns:\n  - country\n  to_columns:\n  - country\n- name: budget_to_calendar\n  from: fact_budget\n  to: dim_calendar\n  from_columns:\n  - month_start\n  to_columns:\n  - date_key\n- name: budget_to_category\n  from: fact_budget\n  to: dim_category\n  from_columns:\n  - category\n  to_columns:\n  - category\n- name: budget_to_country\n  from: fact_budget\n  to: dim_country\n  from_columns:\n  - country\n  to_columns:\n  - country\nmetrics:\n- name: sales_vs_budget_pct\n  description: (sales - budget) / budget. Each side is summed over its own table first.\n  expression:\n    sql: (AGG(fact_sales.sales_quantity) - AGG(fact_budget.budget_quantity)) / AGG(fact_budget.budget_quantity)",
  "expr": {
   "sales_quantity": {
    "sql": "SUM(sales_qty)",
    "home": "fact_sales"
   },
   "net_profit_total": {
    "sql": "SUM(net_profit)",
    "home": "fact_sales"
   },
   "budget_quantity": {
    "sql": "SUM(budget_qty)",
    "home": "fact_budget"
   },
   "sales_vs_budget_pct": {
    "sql": "(AGG(fact_sales.sales_quantity) - AGG(fact_budget.budget_quantity)) / AGG(fact_budget.budget_quantity)",
    "home": "model"
   }
  }
 },
 "evidence": {
  "fabric_publish": "{\n \"semanticModel\": {\n  \"workspaceId\": \"8c945c1a-f25e-4f19-a7ad-c3a7bfbd0fc9\",\n  \"id\": \"b029eb6e-e318-4904-acfe-18f32bf069bd\"\n },\n \"summary\": {\n  \"errorCount\": 0,\n  \"warningCount\": 0\n },\n \"warnings\": []\n}",
  "sf_import": "Semantic view was successfully created from OSI YAML.",
  "sf_reimport": "ERROR 000904 (42000): Uncaught exception of type 'EXPRESSION_ERROR' on line 3 at position 23 : SQL compilation error: error line 15 at position 489 invalid identifier 'SALES.SALES_QUANTITY'",
  "sf_dialect": "SYSTEM$CREATE_SEMANTIC_VIEW_FROM_OSSIE_YAML, with FIXED / EXCLUDE DIMENSIONS in the SNOWFLAKE dialect:\n  as a metric:           ERROR 001003 (42000): Uncaught exception of type 'EXPRESSION_ERROR' on line 3 at position 23 : SQL compilation error: syntax error line 15 at position 350 unexpected 'FIXED'.\n  as a field + metric:   ERROR 001003 (42000): Uncaught exception of type 'EXPRESSION_ERROR' on line 3 at position 23 : SQL compilation error: syntax error line 9 at position 268 unexpected 'FIXED'. syntax error line 9 at position 305 unexpected ','. syntax error line 9 at position 324 unexpected ')'. syntax error line 9 at position 325 unexpected ','.\n\nThe same expressions in hand-written CREATE SEMANTIC VIEW DDL:\n  view-level fact (no table prefix, the notebook's way):  accepted\n  table-scoped fact (sales.x AS SUM(...) FIXED ...):       syntax error, unexpected 'FIXED'\n  metric (sales.m AS SUM(...) FIXED ...):                  syntax error, unexpected 'FIXED'\n\nAn LOD fact exists only at view level; Ossie has no place for a view-level fact (a field belongs to a dataset).",
  "sf_extensions": "SYSTEM$CREATE_SEMANTIC_VIEW_FROM_OSSIE_YAML with vendor extensions (tests/dax_context.ossie.yaml, one at a time):\n\nSNOWFLAKE extension on a dataset, a table metric {metrics: [BUDGET_QTY_EXT]}:\n  import: Semantic view was successfully created from OSI YAML.\n  applied: DESCRIBE lists metric BUDGET_QTY_EXT\n\nSNOWFLAKE extension on a field, {access_modifier: private_access} on sales_qty:\n  import: Semantic view was successfully created from OSI YAML.\n  kept in the export: True; applied: False (DESCRIBE: FACT SALES_QTY FACT_SALES ACCESS_MODIFIER PUBLIC)\n\nPOWER_BI extension on a metric, {formatString: #,##0}:\n  import: Semantic view was successfully created from OSI YAML.\n  kept in the export: False; no warning",
  "fabric_export": "Fabric semantic views API (beta), lakehouse ossie:\n\nGET list the semantic views: HTTP 200 {\"data\": [{\"name\": \"dax_context\"}]}\nGET read the semantic view dax_context: HTTP 404 EntityNotFound: The requested resource could not be found\n\nThe API publishes a view into a semantic model; it has no call that writes a model back out as Ossie.",
  "dbx_export": "On the SQL warehouse (2x-small):\n\nSELECT * FROM export_to_ossie(TABLE(databricks_ne.ossie_demo.sales_mv))\n  [EXPORT_TO_OSSIE.FEATURE_DISABLED] Cannot read Apache Ossie YAML from the metric view. The export_to_ossie function is disabled. Please make sure \"spark.databricks.sql.metricView.exportToOssie.enabled\" is set to true. SQLSTATE: 42K0E == SQL == SELECT * FROM export_to_ossie(TABLE(databricks_ne.ossie_demo.sales_mv))\n\nSET spark.databricks.sql.metricView.exportToOssie.enabled = true\n  [CONFIG_NOT_AVAILABLE.WITHOUT_SUGGESTION] Configuration spark.databricks.sql.metricView.exportToOssie.enabled is not available. SQLSTATE: 42K0I",
  "fabric_version": "version: 0.2.0.dev0",
  "sf_export_version": "version: 0.1.1"
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
   "expected": {
    "code": "-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.\nSELECT s.country, c.year, SUM(f.sales_qty) AS sales_quantity\nFROM 'data/fact_sales.parquet' f\n    JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key\n    JOIN 'data/dim_product.parquet' p ON f.product_id = p.product_id\n    JOIN 'data/dim_store.parquet' s ON f.store_id = s.store_id\nWHERE c.year <= 2022\nGROUP BY ALL\nORDER BY country, year",
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
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match",
    "dbx": "match"
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
   "expected": {
    "code": "-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.\nSELECT p.product_name, SUM(f.sales_qty) AS sales_quantity\nFROM 'data/fact_sales.parquet' f\n    JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key\n    JOIN 'data/dim_product.parquet' p ON f.product_id = p.product_id\n    JOIN 'data/dim_store.parquet' s ON f.store_id = s.store_id\nWHERE c.year = 2021\nGROUP BY ALL\nORDER BY sales_quantity DESC\nLIMIT 10",
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
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match",
    "dbx": "match"
   }
  },
  {
   "id": "q03",
   "folder": "q03_last_year_by_day",
   "title": "Sales vs last year, by day (Feb 25 - Mar 3, 2021)",
   "text": "Last year at the date grain. Watch Feb 28, 2021: 2020 was a leap year, so \"last year\" of Feb 28 is either Feb 28, 2020 alone, or Feb 28 + Feb 29. The reference takes the first: the same calendar date one year earlier. - DAX: `SAMEPERIODLASTYEAR` (shifts the date filter). - Snowflake: `sales_qty_ly` is a second copy of the fact whose date key is moved forward one year, which puts Feb 29, 2020 on Feb 28, 2021. A second copy that drops Feb 29 matches the reference. - Databricks: a window on `date_key` with `offset: -1 year`.",
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
   "expected": {
    "code": "-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.\n-- Last year of a day is the same calendar date one year earlier, so Feb 29, 2020 belongs to no day of 2021.\nWITH day AS (\n    SELECT sale_date, SUM(sales_qty) AS qty FROM 'data/fact_sales.parquet' GROUP BY ALL\n)\nSELECT c.date_key, cur.qty AS sales_quantity, ly.qty AS sales_qty_ly\nFROM 'data/dim_calendar.parquet' c\nLEFT JOIN day cur ON cur.sale_date = c.date_key\nLEFT JOIN day ly ON ly.sale_date = c.date_key - INTERVAL 1 YEAR\nWHERE c.date_key BETWEEN DATE '2021-02-25' AND DATE '2021-03-03'\nORDER BY c.date_key",
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
     "code": "-- A third copy of the fact (sales_ly_day) whose shifted date drops Feb 29: one more logical table, four more relationships.\nSELECT date_key, AGG(sales_quantity) AS sales_quantity, AGG(sales_qty_ly_day) AS sales_qty_ly\nFROM DAX_DEMO.MODEL.SEMANTIC_VIEW\nWHERE date_key BETWEEN DATE '2021-02-25' AND DATE '2021-03-03'\nGROUP BY ALL\nORDER BY date_key",
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
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "**differs**: Feb 28 gets Feb 28 + Feb 29. Matches with a second copy of the fact without Feb 29 (`sales_ly_day`). Both use a copy of the fact with the date moved a year (`sales_ly`).",
    "dbx": "match"
   }
  },
  {
   "id": "q04",
   "folder": "q04_last_year_by_month",
   "title": "Sales vs last year, by month (Jan - Apr 2021), with a total",
   "text": "The same \"last year\" measure as q03, asked by month. A semantic layer should give each month's last-year total. - Total row: DAX `ROLLUPADDISSUBTOTAL`; Databricks `GROUP BY ROLLUP`; Snowflake refuses ROLLUP in a semantic query (\"GROUPING SETS/CUBE/ROLLUP is not supported within semantic query blocks\"), so its total is a second query. - Databricks: the day-grain window measure returns one day's value per month, with no error. `dbx_per_grain.sql` uses a second measure ordered by month: the months match, the total repeats the last month. `dbx_workaround.sql` uses a second view of the fact with its date moved a year, joined in the query: it matches.",
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
   "expected": {
    "code": "-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.\n-- Last year of a month is the whole same month one year earlier (February 2020 with its 29 days).\nWITH m AS (\n    SELECT c.month_start, SUM(f.sales_qty) AS qty\n    FROM 'data/fact_sales.parquet' f JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key\n    GROUP BY ALL\n), r AS (\n    SELECT cur.month_start, cur.qty AS sales_quantity, ly.qty AS sales_qty_ly\n    FROM m cur LEFT JOIN m ly ON ly.month_start = cur.month_start - INTERVAL 1 YEAR\n    WHERE cur.month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'\n)\nSELECT month_start, SUM(sales_quantity) AS sales_quantity, SUM(sales_qty_ly) AS sales_qty_ly,\n       (SUM(sales_quantity) - SUM(sales_qty_ly)) / SUM(sales_qty_ly) AS sales_qty_yoy_pct\nFROM r\nGROUP BY ROLLUP (month_start)\nORDER BY month_start NULLS LAST",
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
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match, with `sales_ly`; the total row is a second query (no ROLLUP)",
    "dbx": "**differs**: each month gets one day's value. A measure per grain: months match, total differs. Matches with a second view of the shifted fact (`sales_ly_mv`), joined in the query."
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
   "expected": {
    "code": "-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.\n-- The total of last year is the sum of the rows above it (2019 has no sales, so 2020 + 2021).\nWITH y AS (\n    SELECT c.year, SUM(f.sales_qty) AS qty\n    FROM 'data/fact_sales.parquet' f JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key\n    GROUP BY ALL\n), r AS (\n    SELECT cur.year, cur.qty AS sales_quantity, ly.qty AS sales_qty_ly\n    FROM y cur LEFT JOIN y ly ON ly.year = cur.year - 1\n    WHERE cur.year <= 2022\n)\nSELECT year, SUM(sales_quantity) AS sales_quantity, SUM(sales_qty_ly) AS sales_qty_ly,\n       (SUM(sales_quantity) - SUM(sales_qty_ly)) / SUM(sales_qty_ly) AS sales_qty_yoy_pct\nFROM r\nGROUP BY ROLLUP (year)\nORDER BY year NULLS LAST",
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
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match, with `sales_ly`; the total row is a second query",
    "dbx": "**differs**. A measure per grain: years match, total differs. Matches with `sales_ly_mv`, joined in the query."
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
   "expected": {
    "code": "-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.\n-- A 4-4-5 fiscal year is 52 weeks: last fiscal year of a day is the day 364 days earlier.\nWITH day AS (\n    SELECT sale_date, SUM(sales_qty) AS qty FROM 'data/fact_sales.parquet' GROUP BY ALL\n)\nSELECT c.fiscal_period_name, c.fiscal_period_start, SUM(cur.qty) AS sales_quantity, SUM(ly.qty) AS sales_qty_fly\nFROM 'data/dim_calendar.parquet' c\nLEFT JOIN day cur ON cur.sale_date = c.date_key\nLEFT JOIN day ly ON ly.sale_date = c.date_key - INTERVAL 364 DAY\nWHERE c.fiscal_period_start BETWEEN DATE '2021-01-25' AND DATE '2021-05-24'\nGROUP BY ALL\nORDER BY c.fiscal_period_start",
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
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match, with a copy of the fact, date moved 364 days (`sales_fly`)",
    "dbx": "**differs**. Matches with a second measure ordered by fiscal period."
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
   "expected": {
    "code": "-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.\nWITH m AS (\n    SELECT c.month_start, SUM(f.net_profit) AS profit\n    FROM 'data/fact_sales.parquet' f\n    JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key\n    JOIN 'data/dim_product.parquet' p ON f.product_id = p.product_id\n    JOIN 'data/dim_store.parquet' s ON f.store_id = s.store_id\n    WHERE p.category = 'Clearance'\n    GROUP BY ALL\n)\nSELECT cur.month_start, cur.profit AS net_profit_total, ly.profit AS net_profit_ly\nFROM m cur LEFT JOIN m ly ON ly.month_start = cur.month_start - INTERVAL 1 YEAR\nWHERE cur.month_start BETWEEN DATE '2021-01-01' AND DATE '2021-04-01'\nORDER BY cur.month_start",
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
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match, with `sales_ly`",
    "dbx": "**differs**. Matches with `sales_ly_mv`, joined in the query."
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
   "expected": {
    "code": "-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.\n-- One row per customer that has sales under the filters. Two denominators per country: every customer of the\n-- country (the filtered-out ones too), and only the customers shown.\nWITH base AS (\n    SELECT s.country, s.customer, SUM(f.sales_qty) AS qty\n    FROM 'data/fact_sales.parquet' f\n    JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key\n    JOIN 'data/dim_product.parquet' p ON f.product_id = p.product_id\n    JOIN 'data/dim_store.parquet' s ON f.store_id = s.store_id\n    WHERE c.month_start = DATE '2021-02-01' AND p.brand <> 'Somat'\n    GROUP BY ALL\n), r AS (\n    SELECT country, customer, qty AS sales_quantity,\n           SUM(qty) OVER (PARTITION BY country) AS country_qty_all_customers,\n           customer NOT IN ('Zabka', 'Rewe', 'Superdrug') AS shown\n    FROM base\n)\nSELECT country, customer, sales_quantity,\n       sales_quantity / country_qty_all_customers AS customer_share_all,\n       sales_quantity / SUM(sales_quantity) OVER (PARTITION BY country) AS customer_share_allselected\nFROM r\nWHERE shown\nORDER BY country, customer",
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
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match. All customers: a copy of the fact through a copy of the store table (`store_geo`). Customers shown: LOD.",
    "dbx": "**partial**: all customers by a window; customers shown has no metric-view form. Matches with a window function in the query."
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
   "expected": {
    "code": "-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.\n-- Three numbers per country: February without Tesco; February, every customer; the whole of 2021, every customer.\nWITH r AS (\n    SELECT s.country,\n           SUM(f.sales_qty) FILTER (WHERE c.month_start = DATE '2021-02-01' AND s.customer <> 'Tesco') AS sales_quantity,\n           SUM(f.sales_qty) FILTER (WHERE c.month_start = DATE '2021-02-01') AS country_qty_all_customers,\n           SUM(f.sales_qty) AS country_total_fixed\n    FROM 'data/fact_sales.parquet' f\n    JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key\n    JOIN 'data/dim_product.parquet' p ON f.product_id = p.product_id\n    JOIN 'data/dim_store.parquet' s ON f.store_id = s.store_id\n    WHERE c.year = 2021\n    GROUP BY ALL\n)\nSELECT country, SUM(sales_quantity) AS sales_quantity, SUM(country_qty_all_customers) AS country_qty_all_customers,\n       SUM(country_total_fixed) AS country_total_fixed\nFROM r\nGROUP BY ROLLUP (country)\nORDER BY country NULLS LAST",
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
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match (LOD; the total row is a second query)",
    "dbx": "match"
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
   "expected": {
    "code": "-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.\n-- The denominator drops the customer and category filters and keeps year and brand.\nWITH r AS (\n    SELECT s.country,\n           SUM(f.sales_qty) FILTER (WHERE p.category = 'Laundry' AND s.customer <> 'Tesco') AS sales_quantity,\n           SUM(f.sales_qty) AS country_qty_all_cust_cat\n    FROM 'data/fact_sales.parquet' f\n    JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key\n    JOIN 'data/dim_product.parquet' p ON f.product_id = p.product_id\n    JOIN 'data/dim_store.parquet' s ON f.store_id = s.store_id\n    WHERE c.year = 2021 AND p.brand IN ('Tide', 'Dove')\n    GROUP BY ALL\n)\nSELECT country, sales_quantity, sales_quantity / country_qty_all_cust_cat AS cust_cat_share_all\nFROM r\nORDER BY country",
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
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match, with a copy of the fact through a one-row `all_members` table",
    "dbx": "match"
   }
  },
  {
   "id": "q11",
   "folder": "q11_actual_vs_budget",
   "title": "Actual vs budget, by country and category, 2021",
   "text": "Two facts at two grains: sales (day x store x product) and budget (month x country x category), through the dimensions they share. - Power BI and Snowflake: one model holds both facts; one query. - Databricks: a metric view has one source fact, so `dbx.sql` queries the sales view and the budget view and joins them.",
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
   "expected": {
    "code": "-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.\n-- Each fact is summed at its own grain, then the two are joined on what they share.\nWITH a AS (\n    SELECT s.country, p.category, SUM(f.sales_qty) AS sales_quantity\n    FROM 'data/fact_sales.parquet' f\n    JOIN 'data/dim_calendar.parquet' c ON f.sale_date = c.date_key\n    JOIN 'data/dim_product.parquet' p ON f.product_id = p.product_id\n    JOIN 'data/dim_store.parquet' s ON f.store_id = s.store_id\n    WHERE c.year = 2021\n    GROUP BY ALL\n), b AS (\n    SELECT country, category, SUM(budget_qty) AS budget_quantity\n    FROM 'data/fact_budget.parquet'\n    WHERE YEAR(month_start) = 2021\n    GROUP BY ALL\n)\nSELECT country, category, a.sales_quantity, b.budget_quantity,\n       (a.sales_quantity - b.budget_quantity) / b.budget_quantity AS sales_vs_budget_pct\nFROM a FULL OUTER JOIN b USING (country, category)\nORDER BY country, category",
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
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match",
    "dbx": "match, with two views joined in the query, or with a bridge view over both facts"
   }
  },
  {
   "id": "q12",
   "folder": "q12_budget_and_growth_by_category",
   "title": "Actual vs budget and growth on last year, by category, 2021, with a total",
   "text": "Three things in one answer: sales against the budget (two facts at two grains), sales against last year (a shift in time), and a total row where both percentages are recomputed from the totals, not summed or averaged. - Power BI and Snowflake: the five measures are in the one model; Snowflake's total row is a second query. - Databricks: budget and last year live in other metric views. `dbx.sql` joins the sales and budget views and uses the window measure for last year; `dbx_workaround.sql` joins three views (sales, sales last year, budget).",
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
   "expected": {
    "code": "-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.\n-- Each number is summed on its own, by category; the percentages are computed after, so the total row is right.\nWITH s AS (\n    SELECT p.category,\n           SUM(f.sales_qty) FILTER (WHERE YEAR(f.sale_date) = 2021) AS sales_quantity,\n           SUM(f.sales_qty) FILTER (WHERE YEAR(f.sale_date) = 2020) AS sales_qty_ly\n    FROM 'data/fact_sales.parquet' f JOIN 'data/dim_product.parquet' p ON f.product_id = p.product_id\n    GROUP BY ALL\n), b AS (\n    SELECT category, SUM(budget_qty) AS budget_quantity\n    FROM 'data/fact_budget.parquet'\n    WHERE YEAR(month_start) = 2021\n    GROUP BY ALL\n)\nSELECT category, SUM(sales_quantity) AS sales_quantity, SUM(budget_quantity) AS budget_quantity,\n       (SUM(sales_quantity) - SUM(budget_quantity)) / SUM(budget_quantity) AS sales_vs_budget_pct,\n       SUM(sales_qty_ly) AS sales_qty_ly,\n       (SUM(sales_quantity) - SUM(sales_qty_ly)) / SUM(sales_qty_ly) AS sales_qty_yoy_pct\nFROM s JOIN b USING (category)\nGROUP BY ROLLUP (category)\nORDER BY category NULLS LAST",
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
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match; the total row is a second query",
    "dbx": "**differs**: last year is one day's value. Matches with three views joined in the query (sales, `sales_ly_mv`, budget)."
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
   "expected": {
    "code": "-- The reference answer: raw SQL over the tables (data/*.parquet), no semantic model.\n-- The calendar is counted on its own, then sales are joined to it.\nSELECT c.year, COUNT(*) AS day_count, SUM(d.qty) AS sales_quantity\nFROM 'data/dim_calendar.parquet' c\nLEFT JOIN (SELECT sale_date, SUM(sales_qty) AS qty FROM 'data/fact_sales.parquet' GROUP BY ALL) d\n       ON d.sale_date = c.date_key\nGROUP BY ALL\nORDER BY c.year",
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
    }
   ],
   "notes": {
    "fabric": "match",
    "snowflake": "match",
    "dbx": "**differs**: 2023 is missing. Matches with a calendar view, joined in the query."
   }
  }
 ]
};
