/**
 * check-missing-links.js
 * Check which models in MD have no hyperlinks
 */

const fs = require('fs');

const REPO = 'D:/Repositories/Monthly_Table_of_LLM_Releasing';
const MD_PATH = `${REPO}/llm_release_timeline_2022-11_to_2026-04.md`;
const LINKS_PATH = `${REPO}/links.json`;

const raw = fs.readFileSync(MD_PATH, 'utf8');
const links = JSON.parse(fs.readFileSync(LINKS_PATH, 'utf8'));

const lines = raw.split('\n');
const tableRows = lines.filter(l => l.startsWith('|') && !l.startsWith('|---'));

const headerLine = tableRows[0];
const headers = headerLine.split('|').map(c => c.trim()).filter(c => c);

const missing = [];
const dataRows = tableRows.slice(1);

dataRows.forEach((line, idx) => {
  const cells = line.split('|').map(c => c.trim());
  const dataCells = cells.slice(1, -1);
  const month = dataCells[0];
  
  dataCells.forEach((cell, colIdx) => {
    if (colIdx === 0) return; // skip Month
    if (!cell) return;
    
    const vendor = headers[colIdx];
    
    // Extract all models (split by +)
    const allModels = cell.split('+').map(s => s.trim()).filter(Boolean);
    
    allModels.forEach(modelStr => {
      // Remove markdown link syntax to get raw model name
      const cleanModel = modelStr.replace(/\[([^\]]+)\]\([^)]+\)/, '$1').trim();
      const isLinked = modelStr.includes('](');
      
      if (!isLinked && cleanModel) {
        // Check if we have a URL in links.json
        const hasUrl = !!links[cleanModel];
        const inferredUrl = inferURL(cleanModel);
        
        missing.push({
          row: month,
          vendor,
          model: cleanModel,
          cell: cell,
          hasUrlInLinks: hasUrl,
          inferredUrl: inferredUrl
        });
      }
    });
  });
});

function inferURL(modelName) {
  return null;
}

// Group by row for better readability
const grouped = {};
missing.forEach(m => {
  if (!grouped[m.row]) grouped[m.row] = [];
  grouped[m.row].push(m);
});

console.log(`\nFound ${missing.length} models without hyperlinks:\n`);

Object.entries(grouped).forEach(([row, items]) => {
  console.log(`\n${row}:`);
  items.forEach(m => {
    const urlStatus = m.hasUrlInLinks ? '✅ links.json' : (m.inferredUrl ? '🔍 inferable' : '❌ no URL');
    console.log(`  [${m.vendor}] ${m.model} - ${urlStatus}`);
    if (m.inferredUrl && !m.hasUrlInLinks) {
      console.log(`      -> ${m.inferredUrl}`);
    }
  });
});

console.log(`\n\nSummary: ${missing.length} plain-text models found`);
console.log(`With URL in links.json: ${missing.filter(m => m.hasUrlInLinks).length}`);
console.log(`Inferable URL: ${missing.filter(m => !m.hasUrlInLinks && m.inferredUrl).length}`);
console.log(`No URL found: ${missing.filter(m => !m.hasUrlInLinks && !m.inferredUrl).length}`);
