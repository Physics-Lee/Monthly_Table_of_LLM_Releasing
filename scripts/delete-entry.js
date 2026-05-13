const fs = require('node:fs');
const path = require('node:path');

const { buildLinksJSON, parseDataJSON, renderCSV, renderMarkdownTable } = require('./build-json');
const { normalizeModelEntries } = require('./model-utils');

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

function writeOutputs(data, dataPath, csvPath, mdPath, linksPath) {
  const links = buildLinksJSON(data);
  fs.writeFileSync(path.resolve(dataPath), JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.resolve(csvPath), renderCSV(data.vendors, data.rows), 'utf8');
  fs.writeFileSync(path.resolve(mdPath), renderMarkdownTable(data.vendors, data.rows), 'utf8');
  fs.writeFileSync(path.resolve(linksPath), JSON.stringify(links, null, 2) + '\n', 'utf8');
}

function deleteModelFromRow(row, vendor, model) {
  const entries = normalizeModelEntries(row[vendor]);
  const index = entries.findIndex(entry => entry.name === model);

  if (index === -1) {
    return { deleted: false, reason: 'Model not found in this month/vendor' };
  }

  entries.splice(index, 1);
  row[vendor] = entries;

  return { deleted: true };
}

function isRowEmpty(row, vendors) {
  return vendors.every(vendor => {
    const entries = normalizeModelEntries(row[vendor]);
    return entries.length === 0;
  });
}

function deleteEntry(options) {
  const {
    dataPath,
    csvPath,
    mdPath,
    linksPath,
    month,
    vendor,
    model,
    removeEmptyMonth = false
  } = options;

  if (!dataPath || !csvPath || !mdPath || !linksPath || !month || !vendor || !model) {
    throw new Error('dataPath, csvPath, mdPath, linksPath, month, vendor, and model are required');
  }

  const data = parseDataJSON(dataPath);

  if (!data.vendors.includes(vendor)) {
    throw new Error(`Unknown vendor column: ${vendor}`);
  }

  const row = data.rows.find(row => row.Month === month);
  if (!row) {
    return { deleted: false, reason: 'Month not found', month, vendor, model };
  }

  const result = deleteModelFromRow(row, vendor, model);

  if (!result.deleted) {
    return { deleted: false, reason: result.reason, month, vendor, model };
  }

  // Optionally remove empty month rows
  if (removeEmptyMonth && isRowEmpty(row, data.vendors)) {
    const rowIndex = data.rows.findIndex(r => r.Month === month);
    data.rows.splice(rowIndex, 1);
    result.removedMonth = true;
  }

  writeOutputs(data, dataPath, csvPath, mdPath, linksPath);

  return {
    deleted: true,
    removedMonth: result.removedMonth || false,
    month,
    vendor,
    model
  };
}

function printUsage() {
  console.log('Usage:');
  console.log('  Single:  node scripts/delete-entry.js --month 25-Oct --vendor Boss-Nanbeige --model "Ling-1T"');
  console.log('  Batch:   node scripts/delete-entry.js --month 25-Oct --vendor Boss-Nanbeige --models "Ling-1T,Ring-1T,Ming-flash-omni-Preview"');
  console.log('');
  console.log('Optional:');
  console.log('  --remove-empty-month    Remove the month row if it becomes empty after deletion');
  console.log('  --data data.json --csv ... --md ... --links ...');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dataPath = args.data || 'data.json';
  const csvPath = args.csv || 'llm_release_timeline_2022-11_to_2026-04.csv';
  const mdPath = args.md || 'llm_release_timeline_2022-11_to_2026-04.md';
  const linksPath = args.links || 'links.json';
  const removeEmptyMonth = args['remove-empty-month'] !== undefined;

  if (!args.month || !args.vendor || (!args.model && !args.models)) {
    printUsage();
    throw new Error('Missing required arguments: --month, --vendor, and --model or --models');
  }

  const modelList = args.models
    ? args.models.split(',').map(m => m.trim()).filter(Boolean)
    : [args.model];

  const results = [];

  for (const model of modelList) {
    const result = deleteEntry({
      dataPath,
      csvPath,
      mdPath,
      linksPath,
      month: args.month,
      vendor: args.vendor,
      model,
      removeEmptyMonth
    });
    results.push(result);
  }

  if (results.length === 1) {
    console.log(JSON.stringify(results[0], null, 2));
  } else {
    console.log(JSON.stringify(results, null, 2));
  }
}

if (require.main === module) {
  main();
}

module.exports = { deleteEntry };
