// Rank the table's vendor columns by their best Artificial Analysis Intelligence Index model.
// Data source: scripts/aa-leaderboard.json (manual snapshot — re-fetch from
// https://artificialanalysis.ai/leaderboards/models and update that file to refresh).

const fs = require('node:fs');
const path = require('node:path');

const { parseDataJSON } = require('./build-json');

// AA vendor name -> data.json column name
const VENDOR_TO_COLUMN = {
  'Anthropic': 'Anthropic',
  'OpenAI': 'OpenAI',
  'SpaceXAI': 'xAI',
  'Kimi': 'Kimi-Moonshot',
  'Alibaba': 'Qwen-Alibaba',
  'Meta': 'Meta',
  'Google': 'Google',
  'DeepSeek': 'DeepSeek',
  'Z AI': 'GLM-Z.ai',
  'Motif Technologies': 'Motif',
  'MiniMax': 'MiniMax',
  'Xiaomi': 'Xiaomi',
  'Tencent': 'Tencent',
  'Thinking Machines': 'Thinking Machines Lab',
  'NVIDIA': 'NVIDIA',
  'InclusionAI': 'Ant-Group',
  'StepFun': 'StepFun',
  'Mistral': 'Mistral',
  'ByteDance Seed': 'Doubao-ByteDance',
  'Cohere': 'Cohere',
  'Baidu': 'Baidu',
  'Amazon': 'Amazon',
  'OpenBMB': 'ModelBest-OpenBMB',
  'Nanbeige': 'Boss-Nanbeige',
  'Liquid AI': 'Liquid AI',
  'Allen Institute for AI': 'Allen',
  'Microsoft': 'Microsoft',
  'AI21 Labs': 'AI21'
};

// Columns that never appear on the text-model Intelligence Index leaderboard
const NON_TEXT_COLUMNS = [
  'Open-Source',
  'LLM-Applications',
  'AI-Chips',
  'AI-Cloud',
  'Kuaishou-Kling', // video models
  'Vidu'            // video models
];

function buildRanking(leaderboard, data) {
  const best = new Map();

  for (const entry of leaderboard.entries) {
    const column = VENDOR_TO_COLUMN[entry.vendor];
    if (!column || !data.vendors.includes(column)) continue;

    const current = best.get(column);
    const better = !current
      || entry.score > current.score
      // tie-break: confirmed score beats estimated (asterisked) one
      || (entry.score === current.score && current.estimated && !entry.estimated);
    if (better) {
      best.set(column, entry);
    }
  }

  const ranked = [...best.entries()]
    .map(([column, entry]) => ({
      column,
      model: entry.model,
      score: entry.score,
      estimated: Boolean(entry.estimated),
      aaRank: entry.rank
    }))
    .sort((a, b) => b.score - a.score);

  // competition ranking: equal scores share the position of their first occurrence
  let position = 0;
  ranked.forEach((item, index) => {
    if (index === 0 || item.score < ranked[index - 1].score) {
      position = index + 1;
    }
    item.rank = position;
  });

  return ranked;
}

function buildMissingVendors(leaderboard, data) {
  const best = new Map();

  for (const entry of leaderboard.entries) {
    const column = VENDOR_TO_COLUMN[entry.vendor];
    if (column && data.vendors.includes(column)) continue;

    const current = best.get(entry.vendor);
    const better = !current || entry.score > current.score;
    if (better) {
      best.set(entry.vendor, entry);
    }
  }

  return [...best.entries()]
    .map(([vendor, entry]) => ({ vendor, model: entry.model, score: entry.score, estimated: Boolean(entry.estimated) }))
    .sort((a, b) => b.score - a.score);
}

function buildColumnsWithoutEntry(data) {
  const hasEntry = new Set(Object.values(VENDOR_TO_COLUMN).filter(c => data.vendors.includes(c)));
  return data.vendors.filter(v => !hasEntry.has(v) && !NON_TEXT_COLUMNS.includes(v));
}

function pad(value, width) {
  return String(value).padEnd(width);
}

function writeRankingArtifact(leaderboard, data, root) {
  const artifact = {
    fetchedAt: leaderboard.fetchedAt,
    generatedAt: new Date().toISOString(),
    source: leaderboard.source,
    ranked: buildRanking(leaderboard, data),
    missingVendors: buildMissingVendors(leaderboard, data),
    columnsWithoutEntry: buildColumnsWithoutEntry(data),
    excludedColumns: NON_TEXT_COLUMNS
  };
  fs.writeFileSync(path.join(root, 'aa-ranking.json'), JSON.stringify(artifact, null, 2) + '\n', 'utf8');
}

function main() {
  const root = path.resolve(__dirname, '..');
  const leaderboard = JSON.parse(fs.readFileSync(path.join(__dirname, 'aa-leaderboard.json'), 'utf8'));
  const data = parseDataJSON(path.join(root, 'data.json'));

  console.log(`AA Intelligence Index snapshot: ${leaderboard.fetchedAt} (${leaderboard.entries.length} entries)`);
  console.log('');

  console.log('== Vendor columns ranked by best AA model ==');
  console.log(`${pad('#', 4)}${pad('score', 7)}${pad('column', 24)}${pad('top model', 32)}AA rank`);
  for (const item of buildRanking(leaderboard, data)) {
    const score = `${item.score}${item.estimated ? '*' : ''}`;
    console.log(`${pad(item.rank, 4)}${pad(score, 7)}${pad(item.column, 24)}${pad(item.model, 32)}#${item.aaRank}`);
  }
  console.log('');

  console.log('== AA vendors with no table column (potential new columns) ==');
  for (const item of buildMissingVendors(leaderboard, data)) {
    const score = `${item.score}${item.estimated ? '*' : ''}`;
    console.log(`${pad(score, 7)}${pad(item.vendor, 36)}${item.model}`);
  }
  console.log('');

  console.log('== Table columns with no AA leaderboard entry ==');
  console.log(buildColumnsWithoutEntry(data).join(', '));
  console.log('');
  console.log(`(excluded from ranking: ${NON_TEXT_COLUMNS.join(', ')})`);

  writeRankingArtifact(leaderboard, data, root);
  console.log('');
  console.log('Wrote aa-ranking.json');
}

if (require.main === module) {
  main();
}

module.exports = { VENDOR_TO_COLUMN, NON_TEXT_COLUMNS, buildRanking, buildMissingVendors, buildColumnsWithoutEntry };
