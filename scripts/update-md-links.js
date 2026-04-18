const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '../llm_release_timeline_2022-11_to_2026-04.md');
const linksPath = path.join(__dirname, '../links.json');

const links = JSON.parse(fs.readFileSync(linksPath, 'utf8'));

function findUrl(model) {
  if (links[model]) return links[model];
  const clean = model.replace(/`/g, '').trim();
  if (links[clean]) return links[clean];
  for (const [key, url] of Object.entries(links)) {
    if (key.toLowerCase() === model.toLowerCase()) return url;
    if (key.toLowerCase() === clean.toLowerCase()) return url;
  }
  return null;
}

function formatModel(model) {
  const trimmed = model.trim();
  if (!trimmed) return trimmed;
  
  // Already a markdown link
  if (/^\[.+\]\(.+\)$/.test(trimmed)) {
    return trimmed;
  }
  
  const url = findUrl(trimmed);
  if (url) {
    return `[${trimmed}](${url})`;
  }
  return trimmed;
}

function formatCell(text) {
  if (!text || !text.trim()) return text;
  
  // Split by " + " but be careful not to split inside markdown links
  // Use regex to split by " + " only when not inside a link
  const parts = text.split(' + ').map(s => s.trim()).filter(Boolean);
  
  return parts.map(formatModel).join(' + ');
}

function processTableLine(line) {
  // Skip header separator lines
  if (/^\|[-\s|]+\|$/.test(line)) {
    return line;
  }
  
  if (!line.startsWith('|')) {
    return line;
  }
  
  // Split by | but preserve the structure
  const cells = line.split('|').map(s => s.trim());
  
  // cells[0] is empty (before first |), cells[last] is empty (after last |)
  // First cell (index 1) is Month, skip it
  for (let i = 2; i < cells.length - 1; i++) {
    const cell = cells[i];
    if (cell) {
      cells[i] = ' ' + formatCell(cell) + ' ';
    }
  }
  
  return cells.join('|');
}

const mdContent = fs.readFileSync(mdPath, 'utf8');
const lines = mdContent.split('\n');

let inTable = false;
let headerLineIndex = -1;

// Find table header
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('| Month |')) {
    headerLineIndex = i;
    break;
  }
}

if (headerLineIndex === -1) {
  console.error('Table header not found');
  process.exit(1);
}

let processedCount = 0;

for (let i = headerLineIndex + 2; i < lines.length; i++) {
  const line = lines[i];
  if (!line.startsWith('|')) break;
  if (/^\|[-\s|]+\|$/.test(line)) continue;
  
  const original = line;
  const processed = processTableLine(line);
  if (original !== processed) {
    processedCount++;
  }
  lines[i] = processed;
}

fs.writeFileSync(mdPath, lines.join('\n'), 'utf8');
console.log(`Updated ${processedCount} table rows in MD file.`);
