const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { computeVendorOrder, reorderVendorColumns } = require('./reorder-vendors');

// vendor names must exist in aa-vendor-ranking.js's VENDOR_TO_COLUMN mapping
function makeWorkspace(vendors) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aa-reorder-'));

  const rows = [
    {
      Month: '26-Aug',
      ...Object.fromEntries(vendors.map((vendor, index) => [
        vendor,
        index % 2 === 0 ? [] : [{ name: `${vendor} Model`, url: 'https://example.com/' }]
      ]))
    }
  ];

  const dataPath = path.join(dir, 'data.json');
  const csvPath = path.join(dir, 'timeline.csv');
  const mdPath = path.join(dir, 'timeline.md');
  const linksPath = path.join(dir, 'links.json');
  const snapshotPath = path.join(dir, 'aa-leaderboard.json');

  fs.writeFileSync(dataPath, JSON.stringify({ vendors, rows }, null, 2));

  return { dir, dataPath, csvPath, mdPath, linksPath, snapshotPath, rows };
}

function writeSnapshot(snapshotPath, entries) {
  fs.writeFileSync(snapshotPath, JSON.stringify({
    fetchedAt: '2026-09-02T00:00:00Z',
    source: 'https://artificialanalysis.ai/leaderboards/models',
    entries
  }));
}

function testComputeVendorOrder() {
  const vendors = ['Open-Source', 'GLM-Z.ai', 'AI-Chips', 'Anthropic', 'DeepSeek', 'iFlytek'];
  const rows = [];
  const data = { vendors, rows };

  // GLM-Z.ai (60) -> Anthropic (63) -> DeepSeek (50); Open-Source/AI-Chips/iFlytek keep tail order
  const leaderboard = {
    entries: [
      { rank: 1, model: 'Claude Opus 5', vendor: 'Anthropic', score: 63 },
      { rank: 2, model: 'GLM-5.3', vendor: 'Z AI', score: 60 },
      { rank: 3, model: 'DeepSeek V4', vendor: 'DeepSeek', score: 50 }
    ]
  };

  const order = computeVendorOrder(vendors, leaderboard, data);
  assert.deepEqual(order, ['Anthropic', 'GLM-Z.ai', 'DeepSeek', 'Open-Source', 'AI-Chips', 'iFlytek']);
}

function testReorderNoOpAndChange() {
  const vendors = ['Anthropic', 'GLM-Z.ai', 'Open-Source'];
  const ctx = makeWorkspace(vendors);
  writeSnapshot(ctx.snapshotPath, [
    { rank: 1, model: 'Claude Opus 5', vendor: 'Anthropic', score: 63 },
    { rank: 2, model: 'GLM-5.3', vendor: 'Z AI', score: 60 }
  ]);

  // already in ranking order (ranked first, unranked tail) -> no write at all
  const before = fs.readFileSync(ctx.dataPath, 'utf8');
  const noop = reorderVendorColumns(ctx);
  assert.equal(noop.changed, false);
  assert.equal(fs.readFileSync(ctx.dataPath, 'utf8'), before);
  assert.equal(fs.existsSync(ctx.csvPath), false);

  // swap the two ranked columns in data.json -> reorder + artifacts rebuilt
  const swapped = makeWorkspace(['Open-Source', 'GLM-Z.ai', 'Anthropic']);
  writeSnapshot(swapped.snapshotPath, [
    { rank: 1, model: 'Claude Opus 5', vendor: 'Anthropic', score: 63 },
    { rank: 2, model: 'GLM-5.3', vendor: 'Z AI', score: 60 }
  ]);
  const changed = reorderVendorColumns(swapped);
  assert.equal(changed.changed, true);
  assert.deepEqual(changed.moved, [
    { vendor: 'Anthropic', from: 2, to: 0 },
    { vendor: 'Open-Source', from: 0, to: 2 }
  ]);

  const data = JSON.parse(fs.readFileSync(swapped.dataPath, 'utf8'));
  assert.deepEqual(data.vendors, ['Anthropic', 'GLM-Z.ai', 'Open-Source']);
  // row keys follow the new vendor order
  assert.deepEqual(Object.keys(data.rows[0]), ['Month', 'Anthropic', 'GLM-Z.ai', 'Open-Source']);
  // artifacts exist and columns moved in the CSV header
  const csvHeader = fs.readFileSync(swapped.csvPath, 'utf8').split('\n')[0];
  assert.match(csvHeader, /^Month,Anthropic,GLM-Z\.ai,Open-Source/);
}

testComputeVendorOrder();
testReorderNoOpAndChange();
console.log('reorder-vendors tests passed');
