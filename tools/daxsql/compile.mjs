// The dax-sql client: a query on the baseline Ossie file in, DuckDB SQL out.
//
//     node tools/daxsql/compile.mjs <model.ossie.yaml>  < query.sql   ->  {"sql": "..."} or {"error": "..."}
//
// The model's SQL and DAX measures are read as they are; each dataset's rows are data/<source>.parquet,
// relative to the directory DuckDB runs in (the repo root).
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { createCompiler } from 'dax-sql';
import { ossieToModel } from 'dax-sql/formats/ossie.js';

const skipped = [];
const model = ossieToModel(parse(readFileSync(process.argv[2], 'utf8')), { onSkip: s => skipped.push(s) });
const compiler = createCompiler(model, {
  tableSource: t => `read_parquet('data/${t.source?.entity ?? t.name}.parquet')`,
});
try {
  const { sql } = compiler.compile(readFileSync(0, 'utf8'));
  process.stdout.write(JSON.stringify({ sql, skipped }));
} catch (e) {
  process.stdout.write(JSON.stringify({ error: `${e.code ?? e.name}: ${e.message}`, skipped }));
}
