const fs = require('node:fs');
const path = require('node:path');

const { buildLinksJSON, parseDataJSON, renderCSV, renderMarkdownTable } = require('./build-json');
const { ensureMonthRow } = require('./upsert-entry');

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

function writeOutputs(data, dataPath, csvPath, mdPath, linksPath) {
  const links = buildLinksJSON(data);
  fs.writeFileSync(path.resolve(dataPath), JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.resolve(csvPath), renderCSV(data.vendors, data.rows), 'utf8');
  fs.writeFileSync(path.resolve(mdPath), renderMarkdownTable(data.vendors, data.rows), 'utf8');
  fs.writeFileSync(path.resolve(linksPath), JSON.stringify(links, null, 2) + '\n', 'utf8');
}

function updateDateRange(filePath, oldRange, newRange) {
  if (!filePath || !fs.existsSync(filePath) || oldRange === newRange) return false;

  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(oldRange)) return false;

  const updated = content.replaceAll(oldRange, newRange);
  fs.writeFileSync(filePath, updated, 'utf8');
  return true;
}

function inferDateRange(rows) {
  if (rows.length === 0) return null;
  return `${rows[0].Month} ~ ${rows[rows.length - 1].Month}`;
}

function inferNumericDateRange(rows) {
  if (rows.length === 0) return null;

  const formatMonth = month => {
    const [yy, mon] = month.split('-');
    const year = Number(yy) < 50 ? `20${yy}` : `19${yy}`;
    const monthIndex = MONTH_NAMES.indexOf(mon);

    if (monthIndex === -1) {
      throw new Error(`Invalid month for numeric range: ${month}`);
    }

    return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  };

  return `${formatMonth(rows[0].Month)} ~ ${formatMonth(rows[rows.length - 1].Month)}`;
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

  if (!dataPath || !csvPath || !mdPath || !linksPath || !month) {
    throw new Error('dataPath, csvPath, mdPath, linksPath, and month are required');
  }

  const data = parseDataJSON(dataPath);
  const previousRows = data.rows.map(row => ({ Month: row.Month }));
  const { created, row } = ensureMonthRow(data, month);

  writeOutputs(data, dataPath, csvPath, mdPath, linksPath);

  const updatedFiles = [];
  const oldShortRange = inferDateRange(previousRows);
  const newShortRange = inferDateRange(data.rows);
  if (updateDateRange(readmePath, oldShortRange, newShortRange)) {
    updatedFiles.push(readmePath);
  }

  const oldNumericRange = inferNumericDateRange(previousRows);
  const newNumericRange = inferNumericDateRange(data.rows);
  if (updateDateRange(indexPath, oldNumericRange, newNumericRange)) {
    updatedFiles.push(indexPath);
  }

  return {
    added: created,
    created,
    month: row.Month,
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

module.exports = {
  addMonthRow,
  ensureMonthRow
};
