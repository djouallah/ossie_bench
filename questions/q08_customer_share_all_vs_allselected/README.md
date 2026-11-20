# Customer share of its country: all customers vs the visible ones

February 2021, without Zabka, Rewe and Superdrug, and without the Somat brand.

- `ALL(customer)`: the denominator is every customer of the country (the filtered-out ones too); month and brand kept.
- `ALLSELECTED(customer)`: the denominator is the customers the query shows.
- Databricks: a `range: all` window over customer gives ALL; ALLSELECTED has no metric-view form.

The answer is three columns per customer: sales and the two shares. The denominators are not part of it; a
platform that needs them as intermediate columns keeps them inside its model or its query.
