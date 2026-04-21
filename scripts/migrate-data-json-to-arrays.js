const fs = require('node:fs');
const path = require('node:path');
const { normalizeModels } = require('./model-utils');

const targetPath = process.argv[2] || 'data.json';
const absolutePath = path.resolve(targetPath);

const raw = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
const vendors = raw.vendors || [];

const migrated = {
  ...raw,
  rows: (raw.rows || []).map(row => {
    const nextRow = { ...row };

    vendors.forEach(vendor => {
      nextRow[vendor] = normalizeModels(row[vendor]);
    });

    return nextRow;
  })
};

fs.writeFileSync(absolutePath, JSON.stringify(migrated, null, 2) + '\n', 'utf8');
console.log(`Migrated ${migrated.rows.length} rows in ${absolutePath}`);
