const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { joinModels, normalizeModelEntries, normalizeModels } = require('./model-utils');
const { buildLinksJSON, parseDataJSON, renderCSV, renderMarkdownTable } = require('./build-json');

function testNormalizeHelpers() {
  assert.deepEqual(normalizeModels('GPT-4.1 + GPT-4.1 mini + o3'), [
    'GPT-4.1',
    'GPT-4.1 mini',
    'o3'
  ]);

  assert.deepEqual(normalizeModels([
    { name: 'GPT-4.1', url: 'https://openai.com/gpt-4-1' },
    { name: 'GPT-4.1 mini', url: 'https://openai.com/gpt-4-1-mini' }
  ]), ['GPT-4.1', 'GPT-4.1 mini']);

  assert.deepEqual(normalizeModelEntries(
    ['GPT-4.1', 'GPT-4.1 mini'],
    {
      'GPT-4.1': 'https://openai.com/gpt-4-1',
      'GPT-4.1 mini': 'https://openai.com/gpt-4-1-mini'
    }
  ), [
    { name: 'GPT-4.1', url: 'https://openai.com/gpt-4-1' },
    { name: 'GPT-4.1 mini', url: 'https://openai.com/gpt-4-1-mini' }
  ]);

  assert.equal(
    joinModels([
      { name: 'GPT-4.1', url: 'https://openai.com/gpt-4-1' },
      { name: 'GPT-4.1 mini', url: 'https://openai.com/gpt-4-1-mini' }
    ]),
    'GPT-4.1 + GPT-4.1 mini'
  );
}

function testBuildFromDataJSON() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-data-build-'));
  const dataPath = path.join(tempDir, 'data.json');

  fs.writeFileSync(dataPath, JSON.stringify({
    vendors: ['OpenAI', 'Google'],
    rows: [
      {
        Month: '25-Apr',
        OpenAI: [
          { name: 'GPT-4.1', url: 'https://openai.com/gpt-4-1' },
          { name: 'GPT-4.1 mini', url: 'https://openai.com/gpt-4-1-mini' }
        ],
        Google: [
          { name: 'Gemini 2.5 Flash', url: 'https://example.com/gemini' }
        ]
      }
    ]
  }, null, 2));

  const data = parseDataJSON(dataPath);
  const links = buildLinksJSON(data);
  const csv = renderCSV(data.vendors, data.rows);
  const md = renderMarkdownTable(data.vendors, data.rows);

  assert.equal(links['GPT-4.1'], 'https://openai.com/gpt-4-1');
  assert.equal(links['Gemini 2.5 Flash'], 'https://example.com/gemini');
  assert.match(csv, /25-Apr,GPT-4\.1 \+ GPT-4\.1 mini,Gemini 2\.5 Flash/);
  assert.match(md, /\[GPT-4\.1\]\(https:\/\/openai\.com\/gpt-4-1\) \+ \[GPT-4\.1 mini\]\(https:\/\/openai\.com\/gpt-4-1-mini\)/);
}

testNormalizeHelpers();
testBuildFromDataJSON();
console.log('model-utils tests passed');
