const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { upsertEntry } = require('./upsert-entry');

function makeTempWorkspace() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-upsert-'));
  const csvPath = path.join(dir, 'timeline.csv');
  const mdPath = path.join(dir, 'timeline.md');

  fs.writeFileSync(csvPath, [
    'Month,OpenAI,Google',
    '25-Apr,GPT-4.1,Gemini 2.5 Flash',
    '25-Jun,o3-pro,Gemini CLI'
  ].join('\n'));

  fs.writeFileSync(mdPath, [
    '| Month | OpenAI | Google |',
    '|---|---|---|',
    '| 25-Apr | [GPT-4.1](https://openai.com/gpt-4-1) | [Gemini 2.5 Flash](https://example.com/gemini-flash) |',
    '| 25-Jun | [o3-pro](https://openai.com/o3-pro) | [Gemini CLI](https://example.com/gemini-cli) |'
  ].join('\n'));

  return { dir, csvPath, mdPath };
}

function testAppendToExistingCell() {
  const { csvPath, mdPath } = makeTempWorkspace();

  const result = upsertEntry({
    csvPath,
    mdPath,
    month: '25-Apr',
    vendor: 'OpenAI',
    model: 'o4-mini',
    url: 'https://openai.com/o4-mini',
    outputDir: path.dirname(csvPath)
  });

  const csv = fs.readFileSync(csvPath, 'utf8');
  const md = fs.readFileSync(mdPath, 'utf8');
  const data = JSON.parse(fs.readFileSync(path.join(path.dirname(csvPath), 'data.json'), 'utf8'));

  assert.equal(result.createdMonth, false);
  assert.equal(result.addedModel, true);
  assert.match(csv, /25-Apr,GPT-4\.1 \+ o4-mini,Gemini 2\.5 Flash/);
  assert.match(md, /\| 25-Apr \| \[GPT-4\.1\]\(https:\/\/openai\.com\/gpt-4-1\) \+ \[o4-mini\]\(https:\/\/openai\.com\/o4-mini\) \|/);
  assert.deepEqual(data.rows[0].OpenAI, ['GPT-4.1', 'o4-mini']);
}

function testInsertMissingMonthInOrder() {
  const { csvPath, mdPath } = makeTempWorkspace();

  const result = upsertEntry({
    csvPath,
    mdPath,
    month: '25-May',
    vendor: 'Google',
    model: 'Veo 3',
    url: 'https://deepmind.google/veo',
    outputDir: path.dirname(csvPath)
  });

  const csvLines = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
  const md = fs.readFileSync(mdPath, 'utf8');

  assert.equal(result.createdMonth, true);
  assert.equal(csvLines[2], '25-May,,Veo 3');
  assert.match(md, /\| 25-May \|  \| \[Veo 3\]\(https:\/\/deepmind\.google\/veo\) \|/);
}

testAppendToExistingCell();
testInsertMissingMonthInOrder();
console.log('upsert-entry tests passed');
