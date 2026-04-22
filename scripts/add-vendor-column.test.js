const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { addVendorColumn } = require('./add-vendor-column');

function makeTempWorkspace() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-add-vendor-'));
  const dataPath = path.join(dir, 'data.json');
  const csvPath = path.join(dir, 'timeline.csv');
  const mdPath = path.join(dir, 'timeline.md');
  const linksPath = path.join(dir, 'links.json');

  fs.writeFileSync(dataPath, JSON.stringify({
    vendors: ['OpenAI', 'AI21', 'LLM-Applications'],
    rows: [
      {
        Month: '25-Apr',
        OpenAI: [{ name: 'GPT-4.1', url: 'https://openai.com/gpt-4-1' }],
        AI21: [{ name: 'Jamba', url: 'https://www.ai21.com/blog/announcing-jamba/' }],
        'LLM-Applications': [{ name: 'Manus', url: 'https://manus.im/' }]
      },
      {
        Month: '25-May',
        OpenAI: [{ name: 'Codex', url: 'https://openai.com/blog/introducing-codex' }],
        AI21: [],
        'LLM-Applications': []
      }
    ]
  }, null, 2));

  return { dataPath, csvPath, mdPath, linksPath };
}

function testInsertVendorAfterAnchor() {
  const { dataPath, csvPath, mdPath, linksPath } = makeTempWorkspace();

  const result = addVendorColumn({
    dataPath,
    csvPath,
    mdPath,
    linksPath,
    vendor: 'Liquid AI',
    after: 'AI21'
  });

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const csv = fs.readFileSync(csvPath, 'utf8');
  const md = fs.readFileSync(mdPath, 'utf8');

  assert.equal(result.added, true);
  assert.deepEqual(data.vendors, ['OpenAI', 'AI21', 'Liquid AI', 'LLM-Applications']);
  assert.deepEqual(data.rows[0]['Liquid AI'], []);
  assert.deepEqual(data.rows[1]['Liquid AI'], []);
  assert.match(csv, /^Month,OpenAI,AI21,Liquid AI,LLM-Applications/m);
  assert.match(md, /^\| Month \| OpenAI \| AI21 \| Liquid AI \| LLM-Applications \|$/m);
}

function testExistingVendorIsNoOp() {
  const { dataPath, csvPath, mdPath, linksPath } = makeTempWorkspace();

  const result = addVendorColumn({
    dataPath,
    csvPath,
    mdPath,
    linksPath,
    vendor: 'AI21',
    after: 'OpenAI'
  });

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  assert.equal(result.added, false);
  assert.deepEqual(data.vendors, ['OpenAI', 'AI21', 'LLM-Applications']);
}

testInsertVendorAfterAnchor();
testExistingVendorIsNoOp();
console.log('add-vendor-column tests passed');
