const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  normalizeName,
  stripEffortSuffix,
  exactMatches,
  baseMatches,
  parseReleaseDate,
  monthLabel,
  classifyAndApply
} = require('./update-monthly');

function testNormalizations() {
  assert.equal(normalizeName('Qwen3.8-2.4T-A95B'), normalizeName('Qwen3.8 2.4T A95B'));

  assert.equal(stripEffortSuffix('Grok 4.6 (xhigh)'), 'Grok 4.6');
  assert.equal(stripEffortSuffix('Claude Sonnet 4.6 (Non-reasoning, Low Effort)'), 'Claude Sonnet 4.6');
  assert.equal(stripEffortSuffix('MiMo-V2-Flash (Feb 2026)'), 'MiMo-V2-Flash');
  assert.equal(stripEffortSuffix('Agnes 2.5 Pro Beta'), 'Agnes 2.5 Pro Beta'); // non-effort parens stay
}

function testMatchSets() {
  const variantEntry = { model: 'Grok 4.6 (xhigh)', vendor: 'SpaceXAI' };
  assert.ok([...baseMatches(variantEntry)].includes(normalizeName('Grok 4.6')));
  assert.ok(![...exactMatches(variantEntry)].includes(normalizeName('Grok 4.6')));

  // vendor prefix stripped: "DeepSeek V4 Flash 0731" matches table name "V4-Flash-0731"
  const prefixedEntry = { model: 'DeepSeek V4 Flash 0731', vendor: 'DeepSeek' };
  assert.ok([...exactMatches(prefixedEntry)].includes(normalizeName('V4-Flash-0731')));
}

function testParseReleaseDate() {
  const html = '<script type="application/ld+json">{"text":"GLM-5.3-Flash was released on August 26, 2026."}</script>';
  const date = parseReleaseDate(html);
  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 7);
  assert.equal(date.getDate(), 26);
  assert.equal(monthLabel(date), '26-Aug');

  assert.equal(parseReleaseDate('<p>no date here</p>'), null);
}

function makeWorkspace() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aa-monthly-'));

  const data = {
    vendors: ['Anthropic', 'xAI', 'GLM-Z.ai', 'DeepSeek', 'NVIDIA'],
    rows: [
      {
        Month: '25-Nov',
        Anthropic: [{ name: 'Claude 4.5 Haiku', url: 'https://anthropic.com/claude-4-5-haiku' }],
        xAI: [],
        'GLM-Z.ai': [],
        DeepSeek: [],
        NVIDIA: []
      },
      {
        Month: '26-Aug',
        Anthropic: [],
        xAI: [{ name: 'Grok 4.6', url: 'https://x.ai/news/grok-4-6' }],
        'GLM-Z.ai': [{ name: 'GLM-5.3', url: 'https://z.ai/blog/glm-5.3' }],
        DeepSeek: [{ name: 'V4-Flash-0731', url: 'https://api-docs.deepseek.com/news/250731/' }],
        NVIDIA: [{ name: 'Nemotron 3.5 Lightning', url: 'https://www.nvidia.com/nemotron' }]
      }
    ]
  };
  const dataPath = path.join(dir, 'data.json');
  const csvPath = path.join(dir, 'timeline.csv');
  const mdPath = path.join(dir, 'timeline.md');
  const linksPath = path.join(dir, 'links.json');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  // cached AA model pages for the release-date lookups
  const cacheDir = path.join(dir, 'model-pages');
  fs.mkdirSync(cacheDir);
  fs.writeFileSync(path.join(cacheDir, 'glm-5-3-flash.html'),
    '<p>GLM-5.3-Flash was released on August 26, 2026.</p>');
  fs.writeFileSync(path.join(cacheDir, 'nemotron-3-nano-4b.html'),
    '<p>Nemotron 3 Nano 4B was released on March 16, 2026.</p>');
  fs.writeFileSync(path.join(cacheDir, 'mystery-model.html'),
    '<p>no release sentence on this page</p>');

  const snapshot = {
    fetchedAt: '2026-08-31T00:00:00Z',
    entries: [
      { rank: 7, model: 'Grok 4.6 (xhigh)', vendor: 'SpaceXAI', score: 60, slug: 'grok-4-6-xhigh' },
      { rank: 30, model: 'Claude 4.5 Haiku', vendor: 'Anthropic', score: 30, slug: 'claude-4-5-haiku' },
      { rank: 15, model: 'GLM-5.3-Flash', vendor: 'Z AI', score: 57, slug: 'glm-5-3-flash' },
      { rank: 210, model: 'Nemotron 3 Nano 4B', vendor: 'NVIDIA', score: 9, estimated: true, slug: 'nemotron-3-nano-4b' },
      { rank: 39, model: 'Agnes 2.5 Pro Beta', vendor: 'Sapiens AI', score: 49, slug: 'agnes-2-5-pro-beta' },
      { rank: 31, model: 'DeepSeek V4 Flash 0731 (high)', vendor: 'DeepSeek', score: 52, slug: 'deepseek-v4-flash-0731' },
      { rank: 99, model: 'Mystery Model', vendor: 'Z AI', score: 55, slug: 'mystery-model' },
      { rank: 120, model: 'Old Backlog Model', vendor: 'Anthropic', score: 20, slug: 'old-backlog-model' }
    ]
  };

  const firstSeen = {
    'Grok 4.6 (xhigh)': '2026-08-21',
    'Claude 4.5 Haiku': 'baseline',
    'GLM-5.3-Flash': '2026-08-27',
    'Nemotron 3 Nano 4B': '2026-08-25',
    'Agnes 2.5 Pro Beta': '2026-08-28',
    'DeepSeek V4 Flash 0731 (high)': '2026-08-20',
    'Mystery Model': '2026-08-30',
    'Old Backlog Model': 'baseline'
  };

  const now = new Date('2026-08-31T04:00:00Z');

  return { dir, dataPath, csvPath, mdPath, linksPath, cacheDir, snapshot, firstSeen, now };
}

async function testClassifyDryRun() {
  const ctx = makeWorkspace();
  const before = fs.readFileSync(ctx.dataPath, 'utf8');

  const buckets = await classifyAndApply({
    snapshot: ctx.snapshot,
    firstSeen: ctx.firstSeen,
    data: JSON.parse(before),
    dataPath: ctx.dataPath, csvPath: ctx.csvPath, mdPath: ctx.mdPath, linksPath: ctx.linksPath,
    dryRun: true,
    htmlCacheDir: ctx.cacheDir,
    now: ctx.now
  });

  assert.deepEqual(buckets.added.map(i => i.model), ['GLM-5.3-Flash']);
  assert.deepEqual(buckets.variant.map(i => i.model), ['Grok 4.6 (xhigh)', 'DeepSeek V4 Flash 0731 (high)']);
  assert.deepEqual(buckets.noColumn.map(i => i.model), ['Agnes 2.5 Pro Beta']);
  assert.deepEqual(buckets.backfill.map(i => i.model), ['Nemotron 3 Nano 4B']);
  assert.deepEqual(buckets.uncertain.map(i => i.model), ['Mystery Model']);
  assert.equal(buckets.backlogSkipped, 1); // Old Backlog Model: baseline, silently kept out

  // dry-run writes nothing
  assert.equal(fs.readFileSync(ctx.dataPath, 'utf8'), before);
  assert.equal(fs.existsSync(ctx.csvPath), false);
}

async function testClassifyApplies() {
  const ctx = makeWorkspace();

  const buckets = await classifyAndApply({
    snapshot: ctx.snapshot,
    firstSeen: ctx.firstSeen,
    data: JSON.parse(fs.readFileSync(ctx.dataPath, 'utf8')),
    dataPath: ctx.dataPath, csvPath: ctx.csvPath, mdPath: ctx.mdPath, linksPath: ctx.linksPath,
    dryRun: false,
    htmlCacheDir: ctx.cacheDir,
    now: ctx.now
  });

  const added = buckets.added[0];
  assert.equal(added.month, '26-Aug');
  assert.equal(added.column, 'GLM-Z.ai');
  assert.equal(added.url, 'https://artificialanalysis.ai/models/glm-5-3-flash');
  assert.equal(added.upsert.addedModel, true);

  const data = JSON.parse(fs.readFileSync(ctx.dataPath, 'utf8'));
  const row = data.rows.find(r => r.Month === '26-Aug');
  assert.deepEqual(row['GLM-Z.ai'], [
    { name: 'GLM-5.3', url: 'https://z.ai/blog/glm-5.3' },
    { name: 'GLM-5.3-Flash', url: 'https://artificialanalysis.ai/models/glm-5-3-flash' }
  ]);
  assert.match(fs.readFileSync(ctx.csvPath, 'utf8'), /GLM-5\.3 \+ GLM-5\.3-Flash/);
  assert.match(fs.readFileSync(ctx.mdPath, 'utf8'), /\[GLM-5\.3-Flash\]\(https:\/\/artificialanalysis\.ai\/models\/glm-5-3-flash\)/);
}

testNormalizations();
testMatchSets();
testParseReleaseDate();
testClassifyDryRun().then(() => testClassifyApplies()).then(() => {
  console.log('update-monthly tests passed');
});
