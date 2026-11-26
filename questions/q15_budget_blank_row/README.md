# Budget by category except Laundry, 2022: budget rows whose category isn't in the category table

The budget has 12 rows for Germany in 2022 under Skin Care, a category `dim_category` doesn't have (50,000 units a
month, 600,000 in all; `python tools/sf.py orphans`). Every model relates the budget to `dim_category` by category.

Grouped by category, every platform keeps them: Power BI under its blank row, Snowflake and Databricks under NULL, as
their joins from the fact to the dimension are outer. The filter is where they part. In DAX the blank row is a member
of the category column, and a blank is not "Laundry", so `category <> "Laundry"` keeps it. In SQL, `NULL <> 'Laundry'`
is not true, so the same filter drops the 600,000 with no error.

- Snowflake and Databricks: `<platform>_workaround.sql` says what DAX does: `category <> 'Laundry' OR category IS NULL`.