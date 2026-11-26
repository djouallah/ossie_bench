# The 16 measures

What each measure means, in business words. [model.ossie.yaml](model.ossie.yaml) holds all 16. Four are in the
standard's portable SQL (`expression.sql`): three sums, each over one table, and one ratio across the two facts.
The other 12 need what the specification calls evaluation controls, which it does not define yet, so the file
writes them in the DAX dialect (`expression.dialects`), which the standard carries but does not read. They refer to
the SQL measures by name (`[sales_quantity]`). The only engine here that reads such a file, SQL and DAX together, is
[dax-sql](https://github.com/djouallah/dax-sql).

The standard here is the development version on [apache/ossie](https://github.com/apache/ossie) `main`
(`0.3.0.dev0`, read on 26 Nov 2026 at commit `7fb92a7`), which is unreleased and can still change. Its validator
(`validation/validate.py --report`) passes the file: 4 metrics in `OSSIE_SQL_2026`, 12 in "other dialects only".
What the specification says about these measures:

- **In the standard now.** A model-level measure can read a measure declared on a table with `AGG(table.measure)`,
  and each side is computed over its own table before the arithmetic.
- **Named as a future extension.** Evaluation controls change which rows a measure aggregates: "including or
  excluding fields from the grouping a measure responds to" and "windowing (cumulative, trailing,
  period-over-period)". The specification puts them out of scope for this version and says of what they enable,
  "such as percent of total and period over period", that it "strongly recommend[s] it as a follow-up extension"
  ([relational_semantics.md](https://github.com/apache/ossie/blob/main/core-spec/relational_semantics.md), section
  5.3 and Appendix D). Until then, a model-level measure that contains a window function is rejected
  ([wide_table_semantics.md](https://github.com/apache/ossie/blob/main/core-spec/wide_table_semantics.md), section
  5.2).
- **Other dialects.** A metric may have an expression in another dialect, alone or beside its SQL. `DAX` is in the
  catalog of dialect names ([dialects.md](https://github.com/apache/ossie/blob/main/extensions/dialects.md)); the
  standard defines only `OSSIE_SQL_2026`, and an engine may ignore the others. An open proposal
  ([#817](https://github.com/apache/ossie/pull/817)) would rename `dialects` to `nonportable_dialects`.

| Measure | Meaning | How the file writes it |
|---|---|---|
| `sales_quantity` | Units sold. | SQL |
| `net_profit_total` | Net profit (negative for Clearance). | SQL |
| `budget_quantity` | Budgeted units, by month, country and category. | SQL |
| `sales_vs_budget_pct` | (sales - budget) / budget. Each side is summed at its own table's grain first. | SQL: `AGG()` of the two measures above |
| `sales_qty_ly` | Units sold in the same period one calendar year earlier, at whatever grain is asked (day, month, year, total). | DAX: period over period |
| `net_profit_ly` | Net profit in the same period one calendar year earlier. | DAX: period over period |
| `sales_qty_fly` | Units sold in the same period of the last fiscal year: 364 days earlier (4-4-5, 52 weeks). | DAX: period over period |
| `sales_qty_yoy_pct` | (sales - last year) / last year. | DAX: period over period |
| `country_qty_all_customers` | Units sold to every customer, whatever customers the query filters or shows. Every other filter is kept. | DAX: fields in or out of the grouping |
| `customer_share_all` | sales / `country_qty_all_customers`. | DAX: fields in or out of the grouping |
| `country_total_allselected` | Units sold to the customers the query shows, taken together. | DAX: fields in or out of the grouping |
| `customer_share_allselected` | sales / `country_total_allselected`. | DAX: fields in or out of the grouping |
| `country_total_allexcept` | Units sold with every filter removed except those on country and year. | DAX: fields in or out of the grouping |
| `country_total_fixed` | Units sold for the country and the year shown, whatever else is filtered. | DAX: fields in or out of the grouping |
| `country_qty_all_cust_cat` | Units sold to every customer in every category. Every other filter is kept. | DAX: fields in or out of the grouping |
| `cust_cat_share_all` | sales / `country_qty_all_cust_cat`. | DAX: fields in or out of the grouping |

The answer each question expects is in `questions/<question>/expected.sql`: raw SQL straight over the tables.
