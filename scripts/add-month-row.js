const fs = require('node:fs');
const path = require('node:path');

const { buildLinksJSON, parseDataJSON, renderCSV, renderMarkdownTable } = require('./build-json');

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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthSortKey(month) {
  const [yearText, monthText] = String(month).split('-');
  const monthIndex = MONTH_NAMES.indexOf(monthText);
  if (yearText == null || monthIndex === -1) {
    throw new Error(`Invalid month: ${month}. Expected format like 26-May.`);
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

function writeOutputs(data, dataPath, csvPath, mdPath, linksPath) {
  const links = buildLinksJSON(data);
  fs.writeFileSync(path.resolve(dataPath), JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.resolve(csvPath), renderCSV(data.vendors, data.rows), 'utf8');
  fs.writeFileSync(path.resolve(mdPath), renderMarkdownTable(data.vendors, data.rows), 'utf8');
  fs.writeFileSync(path.resolve(linksPath), JSON.stringify(links, null, 2) + '\n', 'utf8');
}

function updateDateRange(filePath, oldRange, newRange) {
  if (!fs.existsSync(filePath)) return false;
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(oldRange)) return false;
  const updated = content.replace(new RegExp(oldRange.replace(/[-~]/g, '[-~]'), 'g'), newRange);
  fs.writeFileSync(filePath, updated, 'utf8');
  return true;
}

function inferDateRange(rows) {
  if (rows.length === 0) return null;
  const first = rows[0].Month;
  const last = rows[rows.length - 1].Month;
  return `${first} ~ ${last}`;
}

function inferNumericDateRange(rows) {
  if (rows.length === 0) return null;
  const first = rows[0].Month;
  const last = rows[rows.length - 1].Month;
  const fmt = (m) => {
    const [yy, mon] = m.split('-');
    const year = Number(yy) < 50 ? `20${yy}` : `19${yy}`;
    const monthIdx = MONTH_NAMES.indexOf(mon);
    const mm = String(monthIdx + 1).padStart(2, '0');
    return `${year}-${mm}`;
  };
  return `${fmt(first)} ~ ${fmt(last)}`;
}

function addMonthRow(options) {
  const {
    dataPath,
    csvPath,
    mdPath,
    linksPath,
    readmePath,
    indexPath,
    month
  } = options;

  if (!month) {
    throw new Error('month is required');
  }

  const data = parseDataJSON(dataPath);
  const { created, row } = ensureMonthRow(data, month);

  if (!created) {
    return {
      created: false,
      month,
      message: `Month ${month} already exists. No changes made.`
    };
  }

  writeOutputs(data, dataPath, csvPath, mdPath, linksPath);

  // Update date ranges in user-facing files
  const updatedFiles = [];

  // README uses short format: 22-Nov ~ 26-May
  const oldShortRange = inferDateRange(data.rows.slice(0, -1));
  const newShortRange = inferDateRange(data.rows);
  if (readmePath && oldShortRange && newShortRange && oldShortRange !== newShortRange) {
    if (updateDateRange(readmePath, oldShortRange, newShortRange)) {
      updatedFiles.push(readmePath);
    }
  }

  // index.html uses numeric format: 2022-11 ~ 2026-04
  const oldNumericRange = inferNumericDateRange(data.rows.slice(0, -1));
  const newNumericRange = inferNumericDateRange(data.rows);
  if (indexPath && oldNumericRange && newNumericRange && oldNumericRange !== newNumericRange) {
    if (updateDateRange(indexPath, oldNumericRange, newNumericRange)) {
      updatedFiles.push(indexPath);
    }
  }

  return {
    created: true,
    month,
    rowCount: data.rows.length,
    updatedFiles
  };
}

function printUsage() {
  console.log('Usage: node scripts/add-month-row.js --month 26-May');
  console.log('Optional: --data data.json --csv llm_release_timeline_2022-11_to_2026-04.csv --md llm_release_timeline_2022-11_to_2026-04.md --links links.json --readme README.md --index index.html');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dataPath = args.data || 'data.json';
  const csvPath = args.csv || 'llm_release_timeline_2022-11_to_2026-04.csv';
  const mdPath = args.md || 'llm_release_timeline_2022-11_to_2026-04.md';
  const linksPath = args.links || 'links.json';
  const readmePath = args.readme || 'README.md';
  const indexPath = args.index || 'index.html';

  if (!args.month) {
    printUsage();
    throw new Error('Missing required argument: --month');
  }

  const result = addMonthRow({
    dataPath,
    csvPath,
    mdPath,
    linksPath,
    readmePath,
    indexPath,
    month: args.month
  });

  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = { addMonthRow, ensureMonthRow };
