import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/11097/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const { Workbook } = require('@oai/artifact-tool');
const data = JSON.parse(await fs.readFile(new URL('./prepared.json', import.meta.url), 'utf8'));
const output = new URL('../', import.meta.url);
for (const [key, filename] of [['countries', 'countries_195.csv'], ['iso', 'countries_and_territories_249.csv'], ['extras', 'extra_54_population.csv']]) {
  const wb = Workbook.create();
  const sheet = wb.worksheets.add('名单');
  const matrix = [data.header, ...data[key]];
  const range = sheet.getRange(`A1:M${matrix.length}`);
  range.values = matrix;
  wb.recalculate();
  const values = range.values;
  if (values.length !== matrix.length || values.some((row, i) => row[0] !== matrix[i][0])) throw new Error('Row verification failed');
  // CSV has no workbook formatting. Serialize the verified artifact values with UTF-8 BOM for Excel.
  const escape = v => v === null || v === undefined ? '' : `"${String(v).replaceAll('"', '""')}"`;
  await fs.writeFile(new URL(filename, output), '\uFEFF' + values.map(row => row.map(escape).join(',')).join('\r\n') + '\r\n', 'utf8');
  console.log(`${filename}: ${values.length - 1} records`);
}
await fs.writeFile(new URL('summary.json', output), JSON.stringify(data.summary, null, 2));
