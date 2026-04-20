/**
 * deep-link-check.js
 * Comprehensive check for missing URLs across all data sources
 */

const fs = require('fs');

const REPO = 'D:/Repositories/Monthly_Table_of_LLM_Releasing';
const CSV_PATH = `${REPO}/llm_release_timeline_2022-11_to_2026-04.csv`;
const LINKS_PATH = `${REPO}/links.json`;

const csvRaw = fs.readFileSync(CSV_PATH, 'utf8').trim();
const links = JSON.parse(fs.readFileSync(LINKS_PATH, 'utf8'));

const lines = csvRaw.split('\n').filter(l => l.trim());
const headers = lines[0].split(',').map(h => h.trim());

const missingLinks = [];
const missingInLinksJson = [];

for (let i = 1; i < lines.length; i++) {
  const fields = lines[i].split(',');
  const month = fields[0];
  
  for (let j = 1; j < fields.length; j++) {
    const cell = fields[j].trim();
    if (!cell) continue;
    
    const vendor = headers[j];
    const models = cell.split('+').map(s => s.trim()).filter(Boolean);
    
    models.forEach(model => {
      // Check if this model has a URL in links.json
      if (!links[model]) {
        missingInLinksJson.push({
          month,
          vendor,
          model
        });
      }
    });
  }
}

if (missingInLinksJson.length > 0) {
  console.log(`\nFound ${missingInLinksJson.length} models without URLs in links.json:\n`);
  
  const grouped = {};
  missingInLinksJson.forEach(m => {
    if (!grouped[m.model]) grouped[m.model] = [];
    grouped[m.model].push(m);
  });
  
  Object.entries(grouped).forEach(([model, items]) => {
    const locations = items.map(i => `${i.month}[${i.vendor}]`).join(', ');
    console.log(`  ❌ ${model}`);
    console.log(`     出现在: ${locations}`);
  });
} else {
  console.log('\n✅ All models have URLs in links.json');
}

console.log(`\nSummary: ${missingInLinksJson.length} models missing URLs`);
