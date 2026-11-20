# Share of the country across all customers and categories

2021, brands Tide and Dove, category Laundry, without Tesco. The denominator drops the customer and category filters
but keeps the brand filter, so Dove (a Hair Care brand) counts in it.

In the first build `category` was a column of `dim_product`, the same table as `brand`, and DAX's SUMMARIZECOLUMNS
auto-exist merged the two filters (Dove dropped out of the denominator). With `dim_category` a table of its own the
trap is gone: the shape of the model changes the answer.
