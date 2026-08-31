const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  parseLeaderboard,
  validateEntries,
  updateFirstSeen,
  writeSnapshotIfChanged
} = require('./fetch-aa');

// Mirrors the real SSR structure: <td><div>…</div></td> cells, vendor as
// <img alt>/<span> pair, estimated scores as "1<!-- -->*", unscored as "--".
function row(model, ctx, vendor, score, slug) {
  return ''
    + '<tr>'
    + `<td><div class="font-semibold">${model}</div></td>`
    + `<td><div>${ctx}</div></td>`
    + `<td><div><img alt="${vendor}" src="/img/logos/x.svg"/><span>${vendor}</span></div></td>`
    + `<td><div>${score}</div></td>`
    + '<td><div>$1.00</div></td><td><div>50</div></td><td><div>1.00</div></td><td><div>10.00</div></td>'
    + `<td><div><a target="_blank" href="/models/${slug}">Model</a><div></div><a target="_blank" href="/models/${slug}/providers">Providers</a></div></td>`
    + '</tr>';
}

const HTML_FIXTURE = '<table><thead><tr><th>Model</th></tr><tr><th>Intelligence</th></tr></thead><tbody>'
  + row('Claude Opus 5 (max)', '1M', 'Anthropic', '63', 'claude-opus-5')
  + row('Claude Opus 5 (xhigh)', '1M', 'Anthropic', '63', 'claude-opus-5-xhigh')
  + row('GLM-5.3-Flash', '1M', 'Z AI', '57', 'glm-5-3-flash')
  + row('Granite 4.0 H 350M', '32.8k', 'IBM', '1<!-- -->*', 'granite-4-0-h-350m')
  + row('GPT-5.5 Pro (xhigh)', '922k', 'OpenAI', '--', 'gpt-5-5-pro-xhigh')
  + '</tbody></table>';

function testParseLeaderboard() {
  const { entries, parsedRows, unscoredRows } = parseLeaderboard(HTML_FIXTURE);

  assert.equal(parsedRows, 5);
  assert.equal(unscoredRows, 1);
  assert.equal(entries.length, 4);

  assert.deepEqual(entries[0], {
    rank: 1,
    model: 'Claude Opus 5 (max)',
    vendor: 'Anthropic',
    score: 63,
    slug: 'claude-opus-5'
  });
  assert.equal(entries[0].estimated, undefined);

  // hydration comment splits the asterisk from the score
  assert.deepEqual(entries[3], {
    rank: 4,
    model: 'Granite 4.0 H 350M',
    vendor: 'IBM',
    score: 1,
    estimated: true,
    slug: 'granite-4-0-h-350m'
  });
}

function testValidateEntries() {
  const good = [
    { rank: 1, model: 'A', vendor: 'X', score: 63, slug: 'a' },
    { rank: 2, model: 'B', vendor: 'X', score: 63, slug: 'b' },
    { rank: 3, model: 'C', vendor: 'Y', score: 57, slug: 'c' }
  ];
  const limits = { minEntries: 2, maxEntries: 10 };

  assert.deepEqual(validateEntries(good, limits), []);
  assert.deepEqual(validateEntries(good.slice(0, 1), limits), ['entry count 1 outside [2, 10]']);

  assert.ok(validateEntries([
    { rank: 1, model: 'A', vendor: 'X', score: 63, slug: 'a' },
    { rank: 3, model: 'C', vendor: 'Y', score: 57, slug: 'c' }
  ], limits).some(e => e.includes('rank sequence')));

  assert.ok(validateEntries([
    { rank: 1, model: 'A', vendor: 'X', score: 57, slug: 'a' },
    { rank: 2, model: 'B', vendor: 'X', score: 63, slug: 'b' }
  ], limits).some(e => e.includes('score increases')));

  assert.ok(validateEntries([
    { rank: 1, model: 'A', vendor: 'X', score: 101, slug: 'a' }
  ], limits).some(e => e.includes('[0,100]')));

  assert.ok(validateEntries([
    { rank: 1, model: 'A', vendor: 'unknown', score: 50, slug: null }
  ], limits).some(e => e.includes('vendor')));
}

function testUpdateFirstSeen() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aa-first-seen-'));
  const mapPath = path.join(dir, 'aa-first-seen.json');
  const entries = [
    { model: 'Model A' },
    { model: 'Model B' }
  ];

  // cold start: everything is baseline, so nothing counts as newly seen
  const cold = updateFirstSeen(entries, mapPath, '2026-08-31');
  assert.deepEqual(cold, { 'Model A': 'baseline', 'Model B': 'baseline' });

  // later runs stamp only genuinely new models, keep baseline markers and
  // retain models that already disappeared from the leaderboard
  fs.writeFileSync(mapPath, JSON.stringify({
    'Model A': 'baseline',
    'Retired Model': '2026-08-01'
  }));
  const warm = updateFirstSeen(
    [...entries, { model: 'Model C' }],
    mapPath,
    '2026-09-05'
  );
  assert.equal(warm['Model A'], 'baseline');
  assert.equal(warm['Retired Model'], '2026-08-01');
  assert.equal(warm['Model B'], '2026-09-05');
  assert.equal(warm['Model C'], '2026-09-05');
}

function testWriteSnapshotIfChanged() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aa-snapshot-'));
  const outPath = path.join(dir, 'aa-leaderboard.json');
  const entries = [{ rank: 1, model: 'A', vendor: 'X', score: 63, slug: 'a' }];

  assert.equal(writeSnapshotIfChanged(entries, outPath, '2026-08-31T00:00:00Z'), true);
  const first = fs.readFileSync(outPath, 'utf8');
  assert.match(first, /"fetchedAt": "2026-08-31T00:00:00Z"/);

  // identical entries: no rewrite, so fetchedAt keeps its original value
  assert.equal(writeSnapshotIfChanged(entries, outPath, '2026-09-01T00:00:00Z'), false);
  assert.equal(fs.readFileSync(outPath, 'utf8'), first);

  assert.equal(writeSnapshotIfChanged([...entries, { rank: 2, model: 'B', vendor: 'X', score: 60, slug: 'b' }], outPath, '2026-09-02T00:00:00Z'), true);
  assert.match(fs.readFileSync(outPath, 'utf8'), /"model": "B"/);
}

testParseLeaderboard();
testValidateEntries();
testUpdateFirstSeen();
testWriteSnapshotIfChanged();
console.log('fetch-aa tests passed');
