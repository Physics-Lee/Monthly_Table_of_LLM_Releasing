/**
 * Build derived files from data.json.
 *
 * Data flow:
 *   data.json -> csv
 *   data.json -> md
 *   data.json -> links.json
 */

const fs = require('node:fs');
const path = require('node:path');
const { joinModels, normalizeModelEntries } = require('./model-utils');

const [, , dataArg, csvArg, mdArg, linksArg] = process.argv;
const DATA_PATH = dataArg || 'data.json';
const CSV_PATH = csvArg || 'llm_release_timeline_2022-11_to_2026-04.csv';
const MD_PATH = mdArg || 'llm_release_timeline_2022-11_to_2026-04.md';
const LINKS_PATH = linksArg || 'links.json';

function parseDataJSON(dataPath) {
  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  if (!Array.isArray(raw.vendors) || !Array.isArray(raw.rows)) {
    throw new Error(`Invalid data.json structure: ${dataPath}`);
  }

  return {
    vendors: raw.vendors,
    rows: raw.rows.map(row => {
      const nextRow = { Month: row.Month };
      raw.vendors.forEach(vendor => {
        nextRow[vendor] = normalizeModelEntries(row[vendor]);
      });
      return nextRow;
    })
  };
}

function buildLinksJSON(data) {
  const links = {};

  for (const row of data.rows) {
    for (const vendor of data.vendors) {
      for (const entry of normalizeModelEntries(row[vendor])) {
        if (entry.url && !links[entry.name]) {
          links[entry.name] = entry.url;
        }
      }
    }
  }

  return links;
}

function escapeCSV(value) {
  const text = String(value ?? '');
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function renderCSV(vendors, rows) {
  const headers = ['Month', ...vendors];
  const csvRows = [headers.map(escapeCSV).join(',')];

  rows.forEach(row => {
    const values = headers.map(header => {
      if (header === 'Month') return row.Month || '';
      return joinModels(row[header]);
    });
    csvRows.push(values.map(escapeCSV).join(','));
  });

  return `${csvRows.join('\n')}\n`;
}

function renderMarkdownTable(vendors, rows) {
  const headers = ['Month', ...vendors];
  const output = [
    `| ${headers.join(' | ')} |`,
    `|${headers.map(() => '---').join('|')}|`
  ];

  rows.forEach(row => {
    const cells = headers.map(header => {
      if (header === 'Month') return row.Month || '';

      return normalizeModelEntries(row[header]).map(entry => {
        return entry.url ? `[${entry.name}](${entry.url})` : entry.name;
      }).join(' + ');
    });

    output.push(`| ${cells.join(' | ')} |`);
  });

  return `${output.join('\n')}\n`;
}

function main() {
  console.log('\nBuild LLM timeline artifacts\n');
  console.log(`  DATA: ${DATA_PATH}`);
  console.log(`  CSV:  ${CSV_PATH}`);
  console.log(`  MD:   ${MD_PATH}`);
  console.log(`  LINK: ${LINKS_PATH}\n`);

  if (!fs.existsSync(DATA_PATH)) {
    console.error(`Missing data.json: ${DATA_PATH}`);
    process.exit(1);
  }

  const data = parseDataJSON(DATA_PATH);
  const links = buildLinksJSON(data);
  const csv = renderCSV(data.vendors, data.rows);
  const md = renderMarkdownTable(data.vendors, data.rows);

  fs.writeFileSync(path.resolve(CSV_PATH), csv, 'utf8');
  console.log(`Wrote: ${CSV_PATH}`);

  fs.writeFileSync(path.resolve(MD_PATH), md, 'utf8');
  console.log(`Wrote: ${MD_PATH}`);

  fs.writeFileSync(path.resolve(LINKS_PATH), JSON.stringify(links, null, 2) + '\n', 'utf8');
  console.log(`Wrote: ${LINKS_PATH}`);

  console.log('\nDone.');
  console.log(`  data.json:  ${data.rows.length} rows x ${data.vendors.length} vendors`);
  console.log(`  links.json: ${Object.keys(links).length} mappings`);
}

if (require.main === module) {
  main();
}

module.exports = {
  buildLinksJSON,
  main,
  parseDataJSON,
  renderCSV,
  renderMarkdownTable
};
