// Reorder data.json vendor columns to match the AA ranking (best model score).
//
// Ranked columns come first in aa-ranking order; columns without an AA entry
// (NON_TEXT_COLUMNS and columnsWithoutEntry, e.g. Open-Source, AI-Chips) keep
// their current relative order at the tail. Rows are re-keyed to the new order
// and csv / md / links.json are rebuilt. No write when the order already
// matches, so quiet days produce no commit.
//
// Run by the aa-daily workflow after the ranking rebuild.
//
// Usage: node scripts/reorder-vendors.js [--data data.json] [--csv ...] [--md ...]
//          [--links links.json] [--snapshot scripts/aa-leaderboard.json]

const fs = require('node:fs');
const path = require('node:path');

const { parseDataJSON, buildLinksJSON, renderCSV, renderMarkdownTable } = require('./build-json');
const { buildRanking } = require('./aa-vendor-ranking');

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

// Ranked columns first (in aa-ranking order), then the remaining columns in
// their current relative order.
function computeVendorOrder(vendors, leaderboard, data) {
  const rankedColumns = buildRanking(leaderboard, data)
    .map(item => item.column)
    .filter(column => vendors.includes(column));
  const rankedSet = new Set(rankedColumns);
  return [...rankedColumns, ...vendors.filter(column => !rankedSet.has(column))];
}

function rekeyRows(rows, vendors) {
  return rows.map(row => {
    const next = { Month: row.Month };
    for (const vendor of vendors) {
      next[vendor] = row[vendor];
    }
    return next;
  });
}

function reorderVendorColumns(options) {
  const { dataPath, csvPath, mdPath, linksPath, snapshotPath } = options;

  const data = parseDataJSON(dataPath);
  const leaderboard = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const newOrder = computeVendorOrder(data.vendors, leaderboard, data);

  if (newOrder.length !== data.vendors.length || data.vendors.every((vendor, i) => vendor === newOrder[i])) {
    return { changed: false, vendors: data.vendors };
  }

  const rows = rekeyRows(data.rows, newOrder);
  fs.writeFileSync(path.resolve(dataPath), JSON.stringify({ vendors: newOrder, rows }, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.resolve(csvPath), renderCSV(newOrder, rows), 'utf8');
  fs.writeFileSync(path.resolve(mdPath), renderMarkdownTable(newOrder, rows), 'utf8');
  fs.writeFileSync(path.resolve(linksPath), JSON.stringify(buildLinksJSON({ vendors: newOrder, rows }), null, 2) + '\n', 'utf8');

  const moved = newOrder
    .map((vendor, index) => ({ vendor, from: data.vendors.indexOf(vendor), to: index }))
    .filter(item => item.from !== item.to);
  return { changed: true, vendors: newOrder, moved };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = path.resolve(__dirname, '..');
  const result = reorderVendorColumns({
    dataPath: path.resolve(root, args.data || 'data.json'),
    csvPath: path.resolve(root, args.csv || 'llm_release_timeline_2022-11_to_2026-04.csv'),
    mdPath: path.resolve(root, args.md || 'llm_release_timeline_2022-11_to_2026-04.md'),
    linksPath: path.resolve(root, args.links || 'links.json'),
    snapshotPath: path.resolve(args.snapshot || path.join(__dirname, 'aa-leaderboard.json'))
  });

  console.log(`reordered=${result.changed}`);
  if (result.changed) {
    for (const item of result.moved) {
      console.log(`  ${item.vendor}: #${item.from + 1} -> #${item.to + 1}`);
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { computeVendorOrder, rekeyRows, reorderVendorColumns };
