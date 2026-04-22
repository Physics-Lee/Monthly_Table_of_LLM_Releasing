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

function resolveInsertIndex(vendors, after, before) {
  if (after && before) {
    throw new Error('Use either --after or --before, not both');
  }

  if (after) {
    const index = vendors.indexOf(after);
    if (index === -1) throw new Error(`Unknown anchor vendor: ${after}`);
    return index + 1;
  }

  if (before) {
    const index = vendors.indexOf(before);
    if (index === -1) throw new Error(`Unknown anchor vendor: ${before}`);
    return index;
  }

  return vendors.length;
}

function writeOutputs(data, dataPath, csvPath, mdPath, linksPath) {
  const links = buildLinksJSON(data);
  fs.writeFileSync(path.resolve(dataPath), JSON.stringify(data, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.resolve(csvPath), renderCSV(data.vendors, data.rows), 'utf8');
  fs.writeFileSync(path.resolve(mdPath), renderMarkdownTable(data.vendors, data.rows), 'utf8');
  fs.writeFileSync(path.resolve(linksPath), JSON.stringify(links, null, 2) + '\n', 'utf8');
}

function addVendorColumn(options) {
  const {
    dataPath,
    csvPath,
    mdPath,
    linksPath,
    vendor,
    after,
    before
  } = options;

  if (!dataPath || !csvPath || !mdPath || !linksPath || !vendor) {
    throw new Error('dataPath, csvPath, mdPath, linksPath, and vendor are required');
  }

  const data = parseDataJSON(dataPath);

  if (data.vendors.includes(vendor)) {
    writeOutputs(data, dataPath, csvPath, mdPath, linksPath);
    return { added: false, vendor };
  }

  const insertIndex = resolveInsertIndex(data.vendors, after, before);
  data.vendors.splice(insertIndex, 0, vendor);

  data.rows.forEach(row => {
    row[vendor] = [];
  });

  writeOutputs(data, dataPath, csvPath, mdPath, linksPath);
  return { added: true, insertIndex, vendor };
}

function printUsage() {
  console.log('Usage: node scripts/add-vendor-column.js --vendor "Liquid AI" [--after AI21 | --before LLM-Applications]');
  console.log('Optional: --data data.json --csv llm_release_timeline_2022-11_to_2026-04.csv --md llm_release_timeline_2022-11_to_2026-04.md --links links.json');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dataPath = args.data || 'data.json';
  const csvPath = args.csv || 'llm_release_timeline_2022-11_to_2026-04.csv';
  const mdPath = args.md || 'llm_release_timeline_2022-11_to_2026-04.md';
  const linksPath = args.links || 'links.json';

  if (!args.vendor) {
    printUsage();
    throw new Error('Missing required argument: --vendor');
  }

  const result = addVendorColumn({
    dataPath,
    csvPath,
    mdPath,
    linksPath,
    vendor: args.vendor,
    after: args.after,
    before: args.before
  });

  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  addVendorColumn,
  resolveInsertIndex
};
