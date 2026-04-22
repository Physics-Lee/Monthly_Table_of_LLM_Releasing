const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { upsertEntry } = require('./upsert-entry');

function makeTempWorkspace() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-upsert-'));
  const dataPath = path.join(dir, 'data.json');
  const csvPath = path.join(dir, 'timeline.csv');
  const mdPath = path.join(dir, 'timeline.md');
  const linksPath = path.join(dir, 'links.json');

  fs.writeFileSync(dataPath, JSON.stringify({
    vendors: ['OpenAI', 'Google'],
    rows: [
      {
        Month: '25-Apr',
        OpenAI: [
          { name: 'GPT-4.1', url: 'https://openai.com/gpt-4-1' }
        ],
        Google: [
          { name: 'Gemini 2.5 Flash', url: 'https://example.com/gemini-flash' }
        ]
      },
      {
        Month: '25-Jun',
        OpenAI: [
          { name: 'o3-pro', url: 'https://openai.com/o3-pro' }
        ],
        Google: [
          { name: 'Gemini CLI', url: 'https://example.com/gemini-cli' }
        ]
      }
    ]
  }, null, 2));

  return { dir, dataPath, csvPath, mdPath, linksPath };
}

function testAppendToExistingCell() {
  const { dataPath, csvPath, mdPath, linksPath } = makeTempWorkspace();

  const result = upsertEntry({
    dataPath,
    csvPath,
    mdPath,
    linksPath,
    month: '25-Apr',
    vendor: 'OpenAI',
    model: 'o4-mini',
    url: 'https://openai.com/o4-mini'
  });

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const csv = fs.readFileSync(csvPath, 'utf8');
  const md = fs.readFileSync(mdPath, 'utf8');

  assert.equal(result.createdMonth, false);
  assert.equal(result.addedModel, true);
  assert.deepEqual(data.rows[0].OpenAI, [
    { name: 'GPT-4.1', url: 'https://openai.com/gpt-4-1' },
    { name: 'o4-mini', url: 'https://openai.com/o4-mini' }
  ]);
  assert.match(csv, /25-Apr,GPT-4\.1 \+ o4-mini,Gemini 2\.5 Flash/);
  assert.match(md, /\[o4-mini\]\(https:\/\/openai\.com\/o4-mini\)/);
}

function testInsertMissingMonthInOrder() {
  const { dataPath, csvPath, mdPath, linksPath } = makeTempWorkspace();

  const result = upsertEntry({
    dataPath,
    csvPath,
    mdPath,
    linksPath,
    month: '25-May',
    vendor: 'Google',
    model: 'Veo 3',
    url: 'https://deepmind.google/veo'
  });

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const csvLines = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
  const md = fs.readFileSync(mdPath, 'utf8');

  assert.equal(result.createdMonth, true);
  assert.equal(data.rows[1].Month, '25-May');
  assert.deepEqual(data.rows[1].Google, [
    { name: 'Veo 3', url: 'https://deepmind.google/veo' }
  ]);
  assert.equal(csvLines[2], '25-May,,Veo 3');
  assert.match(md, /\| 25-May \|  \| \[Veo 3\]\(https:\/\/deepmind\.google\/veo\) \|/);
}

testAppendToExistingCell();
testInsertMissingMonthInOrder();
console.log('upsert-entry tests passed');
