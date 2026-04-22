const fs = require('node:fs');
const path = require('node:path');

const { buildLinksJSON, parseDataJSON, renderCSV, renderMarkdownTable } = require('./build-json');
const { normalizeModelEntries } = require('./model-utils');

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    args[token.slice(2)] = argv[i + 1];
    i++;
  }

  return args;
}

function monthSortKey(month) {
  const [yearText, monthText] = String(month).split('-');
  const monthIndex = MONTH_NAMES.indexOf(monthText);

  if (yearText == null || monthIndex === -1) {
    throw new Error(`Invalid month: ${month}. Expected format like 25-Apr.`);
  }

  return Number(yearText) * 12 + monthIndex;
}

function compareMonth(a, b) {
  return monthSortKey(a) - monthSortKey(b);
}

function ensureMonthRow(data, month) {
  const existingIndex = data.rows.findIndex(row => row.Month === month);
  if (existingIndex !== -1) {
    return { created: false, row: data.rows[existingIndex] };
  }

  const newRow = { Month: month };
  data.vendors.forEach(vendor => {
    newRow[vendor] = [];
  });

  const insertIndex = data.rows.findIndex(row => compareMonth(month, row.Month) < 0);
  if (insertIndex === -1) {
    data.rows.push(newRow);
  } else {
    data.rows.splice(insertIndex, 0, newRow);
  }

  return { created: true, row: newRow };
}

function upsertModelValue(currentValue, model, url) {
  const entries = normalizeModelEntries(currentValue);
  const existing = entries.find(entry => entry.name === model);

  if (existing) {
    const changed = existing.url !== url;
    existing.url = url;
    return {
      added: false,
      changed,
      value: entries
    };
  }

  entries.push({ name: model, url });
  return {
    added: true,
    changed: false,
    value: entries
  };
}

function writeOutputs(data, dataPath, csvPath, mdPath, linksPath) {
  const links = buildLinksJSON(data);
  fs.writeFileSync(path.resolve(dataPath), JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.resolve(csvPath), renderCSV(data.vendors, data.rows), 'utf8');
  fs.writeFileSync(path.resolve(mdPath), renderMarkdownTable(data.vendors, data.rows), 'utf8');
  fs.writeFileSync(path.resolve(linksPath), JSON.stringify(links, null, 2) + '\n', 'utf8');
}

function upsertEntry(options) {
  const {
    dataPath,
    csvPath,
    mdPath,
    linksPath,
    month,
    vendor,
    model,
    url
  } = options;

  if (!dataPath || !csvPath || !mdPath || !linksPath || !month || !vendor || !model || !url) {
    throw new Error('dataPath, csvPath, mdPath, linksPath, month, vendor, model, and url are required');
  }

  const data = parseDataJSON(dataPath);

  if (!data.vendors.includes(vendor)) {
    throw new Error(`Unknown vendor column: ${vendor}`);
  }

  const { created, row } = ensureMonthRow(data, month);
  const { added, changed, value } = upsertModelValue(row[vendor], model, url);
  row[vendor] = value;

  writeOutputs(data, dataPath, csvPath, mdPath, linksPath);

  return {
    addedModel: added,
    changedUrl: changed,
    createdMonth: created,
    month,
    model,
    vendor
  };
}

function printUsage() {
  console.log('Usage: node scripts/upsert-entry.js --month 25-May --vendor OpenAI --model "GPT-X" --url "https://..."');
  console.log('Optional: --data data.json --csv llm_release_timeline_2022-11_to_2026-04.csv --md llm_release_timeline_2022-11_to_2026-04.md --links links.json');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dataPath = args.data || 'data.json';
  const csvPath = args.csv || 'llm_release_timeline_2022-11_to_2026-04.csv';
  const mdPath = args.md || 'llm_release_timeline_2022-11_to_2026-04.md';
  const linksPath = args.links || 'links.json';

  if (!args.month || !args.vendor || !args.model || !args.url) {
    printUsage();
    throw new Error('Missing required arguments');
  }

  const result = upsertEntry({
    dataPath,
    csvPath,
    mdPath,
    linksPath,
    month: args.month,
    vendor: args.vendor,
    model: args.model,
    url: args.url
  });

  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  compareMonth,
  ensureMonthRow,
  upsertEntry,
  upsertModelValue
};
