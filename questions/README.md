# The questions

Each folder is one question, written once per platform in its own language, with one file of answers:

```
q04_last_year_by_month/
  README.md            the question and what it tests
  daxsql.sql           the reference: SELECT ... AGG(measure) FROM model, the Ossie baseline, compiled by dax-sql, run on DuckDB
  fabric.dax           Power BI: DAX, through executeQueries
  snowflake.sql        SELECT ... AGG(metric) FROM the semantic view
  dbx.sql              SELECT ... AGG(measure) FROM the metric view
  dbx_workaround.sql   another route on a platform, where the plain query doesn't match (more model, or query logic)
  results.csv          the reference and every platform's answer, with a `platform` and a `status` column
```
Run them all: `python tools/run_questions.py`.

## Status
Every answer is compared with the reference, dax-sql's:

- `match`: the same rows and numbers.
- `differs`: an answer, no error, other rows or numbers.
- `partial`: what it returned matches, but part of the question can't be asked.
- `refused`: an error.

## The grid
Each cell is the status of the plain query, then what it took to match. A platform's native features used as
designed (DAX `CALCULATE`, Snowflake LOD, Databricks windows) count as plain; copies of the fact, helper tables,
extra views and logic moved into the query are named. dax-sql answers from the Ossie baseline as it is, its measures in
SQL and DAX, with one SQL query per question.

| Question | Power BI | Snowflake | Databricks | dax-sql |
|---|---|---|---|---|
| [q01](q01_sales_by_country_year/) sales by country and year | match | match | match | reference |
| [q02](q02_top10_products_2021/) top 10 products | match | match | match | reference |
| [q03](q03_last_year_by_day/) last year, by day | match | **differs**: Feb 28 gets Feb 28 + Feb 29. Matches with a second copy of the fact without Feb 29 (`sales_ly_day`). Both use a copy of the fact with the date moved a year (`sales_ly`). | match | reference |
| [q04](q04_last_year_by_month/) last year, by month + total | match | match, with `sales_ly`; the total row is a second query (no ROLLUP) | **differs**: each month gets one day's value. A measure per grain: months match, total differs. Matches with a second view of the shifted fact (`sales_ly_mv`), joined in the query. | reference |
| [q05](q05_last_year_by_year/) last year, by year + total | match | match, with `sales_ly`; the total row is a second query | **differs**. A measure per grain: years match, total differs. Matches with `sales_ly_mv`, joined in the query. | reference |
| [q06](q06_last_fiscal_year_by_period/) last fiscal year (4-4-5), by period | match | match, with a copy of the fact, date moved 364 days (`sales_fly`) | **differs**. Matches with a second measure ordered by fiscal period. | reference |
| [q07](q07_net_profit_last_year_clearance/) net profit last year, one category | match | match, with `sales_ly` | **differs**. Matches with `sales_ly_mv`, joined in the query. | reference |
| [q08](q08_customer_share_all_vs_allselected/) share of all customers vs of the customers shown | match | match. All customers: a copy of the fact through a copy of the store table (`store_geo`). Customers shown: LOD. | **partial**: all customers by a window; customers shown has no metric-view form. Matches with a window function in the query. | reference |
| [q09](q09_country_all_vs_fixed/) country total: all customers vs fixed at country and year, + total | match | match (LOD; the total row is a second query) | match | reference |
| [q10](q10_share_all_customers_and_categories/) share across all customers and categories | match | match, with a copy of the fact through a one-row `all_members` table | match | reference |
| [q11](q11_actual_vs_budget/) actual vs budget (two facts) | match | match | match, with two views joined in the query, or with a bridge view over both facts | reference |
| [q12](q12_budget_and_growth_by_category/) actual vs budget and growth on last year, by category + total | match | match; the total row is a second query | **differs**: last year is one day's value. Matches with three views joined in the query (sales, `sales_ly_mv`, budget). | reference |
| [q13](q13_days_and_sales_by_year/) days in the calendar, by year | match | match | **differs**: 2023 is missing. Matches with a calendar view, joined in the query. | reference |

## The models it took

| | Power BI | Snowflake | Databricks | dax-sql |
|---|---|---|---|---|
| Models | 1 | 1 semantic view | 5 metric views (sales, sales last year, budget, bridge, calendar) | 1 Ossie file, the baseline |
| Tables | 7 | 16 logical over 9 physical: 5 copies of the fact, copies of store and product, and 2 helper tables | one source per view | 7 |
| Measures | 16 | 19 (6 with an LOD inline) | 20 across 4 views (9 with window specs) | 16: 4 SQL, 12 DAX |
| Queries | one per question | + a second query for totals | + joins between views in the query | one per question |
