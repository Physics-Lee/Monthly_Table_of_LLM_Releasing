const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { addMonthRow } = require('./add-month-row');

function makeTempWorkspace() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-add-month-'));
  const dataPath = path.join(dir, 'data.json');
  const csvPath = path.join(dir, 'timeline.csv');
  const mdPath = path.join(dir, 'timeline.md');
  const linksPath = path.join(dir, 'links.json');

  fs.writeFileSync(dataPath, JSON.stringify({
    vendors: ['OpenAI', 'Google'],
    rows: [
      {
        Month: '25-Apr',
        OpenAI: [{ name: 'GPT-4.1', url: 'https://openai.com/gpt-4-1' }],
        Google: []
      },
      {
        Month: '25-Jun',
        OpenAI: [],
        Google: [{ name: 'Gemini CLI', url: 'https://example.com/gemini-cli' }]
      }
    ]
  }, null, 2));

  return { dataPath, csvPath, mdPath, linksPath };
}

function testInsertMissingMonthInOrder() {
  const { dataPath, csvPath, mdPath, linksPath } = makeTempWorkspace();

  const result = addMonthRow({
    dataPath,
    csvPath,
    mdPath,
    linksPath,
    month: '25-May'
  });

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const csvLines = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
  const md = fs.readFileSync(mdPath, 'utf8');

  assert.equal(result.added, true);
  assert.equal(data.rows[1].Month, '25-May');
  assert.deepEqual(data.rows[1].OpenAI, []);
  assert.deepEqual(data.rows[1].Google, []);
  assert.equal(csvLines[2], '25-May,,');
  assert.match(md, /\| 25-May \|  \|  \|/);
}

function testExistingMonthIsNoOp() {
  const { dataPath, csvPath, mdPath, linksPath } = makeTempWorkspace();

  const result = addMonthRow({
    dataPath,
    csvPath,
    mdPath,
    linksPath,
    month: '25-Apr'
  });

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  assert.equal(result.added, false);
  assert.equal(data.rows.length, 2);
  assert.equal(data.rows[0].Month, '25-Apr');
}

testInsertMissingMonthInOrder();
testExistingMonthIsNoOp();
console.log('add-month-row tests passed');
