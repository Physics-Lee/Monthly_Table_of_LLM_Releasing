const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { joinModels, normalizeModelEntries, normalizeModels } = require('./model-utils');
const { buildDataJSON, generateReadme, parseCSV, parseMD } = require('./build-json');

function testNormalizeModels() {
  assert.deepEqual(normalizeModels('GPT-4.1 + GPT-4.1 mini + o3'), [
    'GPT-4.1',
    'GPT-4.1 mini',
    'o3'
  ]);

  assert.deepEqual(normalizeModels(['GPT-4.1', ' GPT-4.1 mini ', '', 'o3']), [
    'GPT-4.1',
    'GPT-4.1 mini',
    'o3'
  ]);

  assert.equal(joinModels(['GPT-4.1', 'GPT-4.1 mini', 'o3']), 'GPT-4.1 + GPT-4.1 mini + o3');

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
}

function testBuildJson() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llm-timeline-'));
  const csvPath = path.join(tempDir, 'timeline.csv');
  const mdPath = path.join(tempDir, 'timeline.md');
  fs.writeFileSync(csvPath, [
    'Month,OpenAI,Google',
    '25-Apr,GPT-4.1 + GPT-4.1 mini,Gemini 2.5 Flash'
  ].join('\n'));
  fs.writeFileSync(mdPath, [
    '| Month | OpenAI | Google |',
    '|---|---|---|',
    '| 25-Apr | [GPT-4.1](https://openai.com/gpt-4-1) + [GPT-4.1 mini](https://openai.com/gpt-4-1) | [Gemini 2.5 Flash](https://example.com/gemini) |'
  ].join('\n'));

  const { headers, rows } = parseCSV(csvPath);
  const { links } = parseMD(mdPath);
  const data = buildDataJSON(headers, rows, links);
  const readme = generateReadme(
    data.vendors,
    data.rows,
    links,
    'https://example.com/site',
    'https://example.com/repo'
  );

  assert.deepEqual(data.rows[0].OpenAI, [
    { name: 'GPT-4.1', url: 'https://openai.com/gpt-4-1' },
    { name: 'GPT-4.1 mini', url: 'https://openai.com/gpt-4-1' }
  ]);
  assert.deepEqual(data.rows[0].Google, [
    { name: 'Gemini 2.5 Flash', url: 'https://example.com/gemini' }
  ]);
  assert.match(readme, /\[GPT-4\.1\]\(https:\/\/openai\.com\/gpt-4-1\) \+ \[GPT-4\.1 mini\]\(https:\/\/openai\.com\/gpt-4-1\)/);
}

testNormalizeModels();
testBuildJson();
console.log('model-utils tests passed');
