const fs = require('node:fs');
const path = require('node:path');

const { buildDataJSON, buildLinksJSON, generateReadme, parseCSV, parseMD } = require('./build-json');
const { joinModels, normalizeModels } = require('./model-utils');

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    args[key] = argv[i + 1];
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

function ensureMonthRow(headers, rows, month) {
  const existingIndex = rows.findIndex(row => row.Month === month);
  if (existingIndex !== -1) {
    return { created: false, index: existingIndex, row: rows[existingIndex] };
  }

  const newRow = Object.fromEntries(headers.map(header => [header, '']));
  newRow.Month = month;

  const insertIndex = rows.findIndex(row => compareMonth(month, row.Month) < 0);
  if (insertIndex === -1) {
    rows.push(newRow);
    return { created: true, index: rows.length - 1, row: newRow };
  }

  rows.splice(insertIndex, 0, newRow);
  return { created: true, index: insertIndex, row: newRow };
}

function upsertModelValue(currentValue, model) {
  const models = normalizeModels(currentValue);
  if (models.includes(model)) {
    return {
      added: false,
      value: joinModels(models)
    };
  }

  models.push(model);
  return {
    added: true,
    value: joinModels(models)
  };
}

function escapeCSV(value) {
  const text = String(value ?? '');
  if (!/[",\n]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function stringifyCSV(headers, rows) {
  const csvRows = [
    headers.map(escapeCSV).join(',')
  ];

  rows.forEach(row => {
    csvRows.push(headers.map(header => escapeCSV(row[header] || '')).join(','));
  });

  return `${csvRows.join('\n')}\n`;
}

function renderMarkdownTable(headers, rows, links) {
  const headerRow = `| ${headers.join(' | ')} |`;
  const separatorRow = `|${headers.map(() => '---').join('|')}|`;

  const bodyRows = rows.map(row => {
    const cells = headers.map(header => {
      if (header === 'Month') return row.Month || '';

      return normalizeModels(row[header]).map(model => {
        const url = links[model];
        return url ? `[${model}](${url})` : model;
      }).join(' + ');
    });

    return `| ${cells.join(' | ')} |`;
  });

  return `${[headerRow, separatorRow, ...bodyRows].join('\n')}\n`;
}

function writeBuildOutputs(headers, rows, links, outputDir) {
  const dataJSON = buildDataJSON(headers, rows, links);
  const linksJSON = buildLinksJSON(links);
  const readme = generateReadme(
    dataJSON.vendors,
    dataJSON.rows,
    linksJSON,
    process.env.ONLINE_URL || 'https://physics-lee.github.io/Monthly_Table_of_LLM_Releasing/',
    process.env.GITHUB_URL || 'https://github.com/Physics-Lee/Monthly_Table_of_LLM_Releasing'
  );

  fs.writeFileSync(path.join(outputDir, 'data.json'), JSON.stringify(dataJSON, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(outputDir, 'links.json'), JSON.stringify(linksJSON, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(outputDir, 'README.md'), readme, 'utf8');
}

function upsertEntry(options) {
  const {
    csvPath,
    mdPath,
    month,
    vendor,
    model,
    url,
    outputDir
  } = options;

  if (!csvPath || !mdPath || !month || !vendor || !model || !url) {
    throw new Error('csvPath, mdPath, month, vendor, model, and url are required');
  }

  const { headers, rows } = parseCSV(csvPath);
  const { links } = parseMD(mdPath);

  if (!headers.includes(vendor)) {
    throw new Error(`Unknown vendor column: ${vendor}`);
  }

  const { created, row } = ensureMonthRow(headers, rows, month);
  const { added, value } = upsertModelValue(row[vendor], model);
  row[vendor] = value;
  links[model] = url;

  const csvContent = stringifyCSV(headers, rows);
  const mdContent = renderMarkdownTable(headers, rows, links);

  fs.writeFileSync(csvPath, csvContent, 'utf8');
  fs.writeFileSync(mdPath, mdContent, 'utf8');
  writeBuildOutputs(headers, rows, links, outputDir || path.dirname(csvPath));

  return {
    addedModel: added,
    createdMonth: created,
    month,
    model,
    vendor
  };
}

function printUsage() {
  console.log('Usage: node scripts/upsert-entry.js --month 25-May --vendor OpenAI --model "GPT-X" --url "https://..."');
  console.log('Optional: --csv path/to/file.csv --md path/to/file.md --out output/dir');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const csvPath = args.csv || 'llm_release_timeline_2022-11_to_2026-04.csv';
  const mdPath = args.md || 'llm_release_timeline_2022-11_to_2026-04.md';
  const outputDir = args.out || '.';

  if (!args.month || !args.vendor || !args.model || !args.url) {
    printUsage();
    throw new Error('Missing required arguments');
  }

  const result = upsertEntry({
    csvPath,
    mdPath,
    month: args.month,
    vendor: args.vendor,
    model: args.model,
    url: args.url,
    outputDir
  });

  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main();
}

module.exports = {
  compareMonth,
  ensureMonthRow,
  renderMarkdownTable,
  stringifyCSV,
  upsertEntry,
  upsertModelValue
};
