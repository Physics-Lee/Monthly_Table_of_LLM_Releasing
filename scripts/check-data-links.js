const fs = require('node:fs');
const path = require('node:path');
const { normalizeModels } = require('./model-utils');

const dataPath = process.argv[2] || 'data.json';
const linksPath = process.argv[3] || 'links.json';

const data = JSON.parse(fs.readFileSync(path.resolve(dataPath), 'utf8'));
const links = JSON.parse(fs.readFileSync(path.resolve(linksPath), 'utf8'));

const referenced = new Map();
const missing = [];

for (const row of data.rows || []) {
  for (const vendor of data.vendors || []) {
    const models = normalizeModels(row[vendor]);
    for (const item of models) {
      const model = typeof item === 'string' ? item : item?.name;
      if (!model) continue;

      referenced.set(model, (referenced.get(model) || 0) + 1);
      if (!links[model]) {
        missing.push({
          month: row.Month,
          vendor,
          model
        });
      }
    }
  }
}

const orphanLinks = Object.keys(links).filter(model => !referenced.has(model));

if (missing.length === 0) {
  console.log('All models in data.json have corresponding links in links.json.');
} else {
  console.log(`Missing links for ${missing.length} models referenced in data.json:\n`);
  missing.forEach(item => {
    console.log(`${item.month} | ${item.vendor} | ${item.model}`);
  });
}

if (orphanLinks.length === 0) {
  console.log('No orphan links found in links.json.');
} else {
  console.log(`\nFound ${orphanLinks.length} orphan links in links.json:`);
  orphanLinks.forEach(model => console.log(model));
}

console.log(`\nSummary:`);
console.log(`- Referenced models: ${referenced.size}`);
console.log(`- Missing links: ${missing.length}`);
console.log(`- Orphan links: ${orphanLinks.length}`);

process.exit(missing.length === 0 && orphanLinks.length === 0 ? 0 : 1);
