// Fetch the Artificial Analysis Intelligence Index leaderboard and update scripts/aa-leaderboard.json.
//
// The leaderboard is fully server-side rendered: plain HTTP GET returns a <table>
// whose rows are already sorted by Intelligence Index (default filters), so no
// browser is needed. Each data row is:
//   <td><div>Model</div></td>
//   <td><div>1M</div></td>                                   context window
//   <td><div><img alt="Z AI"/><span>Z AI</span></div></td>   creator
//   <td><div>57</div></td>                                   score ("1<!-- -->*" when estimated)
//   ... price / speed / latency cells ...
//   <td><div><a href="/models/<slug>">Model</a>...</div></td>
//
// The script also maintains scripts/aa-first-seen.json: the date each model first
// appeared in a snapshot (used by update-monthly.js to spot new releases). On the
// first run (file missing) every current model is marked "baseline" so historical
// entries are never mistaken for new releases.
//
// Usage: node scripts/fetch-aa.js
//          [--url <leaderboard-url>] [--out <snapshot-path>] [--first-seen <path>]
//          [--html <cached-html-path>]   (offline parsing, for tests)
// Env:  AA_HTTP_PROXY — optional proxy ("http://127.0.0.1:7897") for local runs;
//       CI runners connect directly and leave it unset.
//
// Exit 0 on success (file only rewritten when entries actually changed),
// exit 1 when fetching fails or the guardrails reject the parsed data.

const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');

const DEFAULT_URL = 'https://artificialanalysis.ai/leaderboards/models';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

// Guardrail bounds for the parsed snapshot (current baseline: 272 scored entries).
const MIN_ENTRIES = 200;
const MAX_ENTRIES = 400;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    args[token.slice(2)] = argv[i + 1];
    i++;
  }
  return args;
}

function fetchPageHTML(url) {
  const proxy = process.env.AA_HTTP_PROXY;
  if (proxy) {
    return new Promise((resolve, reject) => {
      execFile('curl', ['-s', '-m', '90', '--compressed', '--proxy', proxy, '-H', `User-Agent: ${USER_AGENT}`, url],
        { maxBuffer: 32 * 1024 * 1024 }, (error, stdout) => {
          if (error) reject(new Error(`curl via ${proxy} failed: ${error.message}`));
          else if (!stdout || stdout.length < 10000) reject(new Error(`curl via ${proxy} returned ${stdout ? stdout.length : 0} bytes`));
          else resolve(stdout);
        });
    });
  }
  return fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(120000) })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
      return res.text();
    });
}

function unescapeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function firstDivText(tdHtml) {
  const match = tdHtml.match(/<div[^>]*>([^<]*)<\/div>/);
  return match ? unescapeEntities(match[1]).trim() : null;
}

// Parse the SSR leaderboard HTML into scored entries (rank = display position).
function parseLeaderboard(html) {
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || [];
  const entries = [];
  let parsedRows = 0;
  let unscoredRows = 0;

  for (const row of rows) {
    const tds = row.match(/<td[^>]*>[\s\S]*?<\/td>/g) || [];
    if (tds.length < 8) continue;

    const model = firstDivText(tds[0]);
    if (!model || model === 'Model') continue;

    parsedRows += 1;

    const vendorMatch = tds[2].match(/<span[^>]*>([^<]*)<\/span>/);
    const vendor = vendorMatch ? unescapeEntities(vendorMatch[1]).trim() : null;

    // React hydration comments split the score from its asterisk: 1<!-- -->*
    const scoreHtml = tds[3].replace(/<!--[\s\S]*?-->/g, '');
    const scoreText = firstDivText(scoreHtml) || '';
    const scoreMatch = scoreText.match(/^(\d+(?:\.\d+)?)(\*?)$/);
    if (!scoreMatch) {
      unscoredRows += 1;
      continue;
    }

    const slugMatch = row.match(/href="\/models\/([^"/]+)"/);

    entries.push({
      rank: entries.length + 1,
      model,
      vendor: vendor || 'unknown',
      score: Number(scoreMatch[1]),
      ...(scoreMatch[2] ? { estimated: true } : {}),
      slug: slugMatch ? slugMatch[1] : null
    });
  }

  return { entries, parsedRows, unscoredRows };
}

// Guardrails: refuse to write data that looks like a broken parse or a site redesign.
// limits can be narrowed by tests; production keeps the module defaults.
function validateEntries(entries, limits = {}) {
  const minEntries = limits.minEntries ?? MIN_ENTRIES;
  const maxEntries = limits.maxEntries ?? MAX_ENTRIES;
  const errors = [];

  if (entries.length < minEntries || entries.length > maxEntries) {
    errors.push(`entry count ${entries.length} outside [${minEntries}, ${maxEntries}]`);
  }
  if (entries.some(e => !e.model || !e.vendor || e.vendor === 'unknown')) {
    errors.push('some entries have an empty model or vendor');
  }
  if (entries.some(e => e.slug == null)) {
    errors.push('some entries have no /models/<slug> link');
  }
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].rank !== i + 1) {
      errors.push(`rank sequence broken at index ${i}`);
      break;
    }
  }
  for (let i = 0; i < entries.length; i++) {
    const score = entries[i].score;
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      errors.push(`score out of [0,100] at rank ${entries[i].rank}: ${score}`);
      break;
    }
    if (i > 0 && score > entries[i - 1].score) {
      errors.push(`score increases at rank ${entries[i].rank}: ${entries[i - 1].score} -> ${score}`);
      break;
    }
  }

  return errors;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Keep the first-seen map for models that disappear from the leaderboard;
// seed every currently-listed model as "baseline" when the file does not exist yet.
function updateFirstSeen(entries, firstSeenPath, today) {
  let firstSeen = {};
  if (fs.existsSync(firstSeenPath)) {
    firstSeen = JSON.parse(fs.readFileSync(firstSeenPath, 'utf8'));
  }

  const seedValue = Object.keys(firstSeen).length === 0 ? 'baseline' : today;
  for (const entry of entries) {
    if (!(entry.model in firstSeen)) {
      firstSeen[entry.model] = seedValue;
    }
  }

  const sorted = {};
  for (const model of Object.keys(firstSeen).sort()) {
    sorted[model] = firstSeen[model];
  }
  fs.writeFileSync(firstSeenPath, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
  return sorted;
}

function buildSnapshot(entries, fetchedAt) {
  return {
    fetchedAt,
    source: DEFAULT_URL,
    note: 'AA Intelligence Index leaderboard snapshot - SCORED entries only, COMPLETE for the current-models view (default filters: Status Current, sorted by Intelligence Index; unscored and deprecated models are NOT in this file). estimated=true means AA marked the score with an asterisk (incomplete/approximate). slug is the AA model-page path used by update-monthly.js. Auto-refreshed by scripts/fetch-aa.js (aa-daily workflow). ALWAYS stamp fetchedAt with the real fetch time.',
    entries
  };
}

// Only rewrite the snapshot when the entries actually changed, so daily runs
// without data changes produce no commit (the page timestamp = last real change).
function writeSnapshotIfChanged(entries, outPath, fetchedAt) {
  const next = buildSnapshot(entries, fetchedAt);
  if (fs.existsSync(outPath)) {
    const current = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    if (JSON.stringify(current.entries) === JSON.stringify(entries)) {
      return false;
    }
  }
  fs.writeFileSync(outPath, JSON.stringify(next, null, 2) + '\n', 'utf8');
  return true;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = args.url || DEFAULT_URL;
  const outPath = path.resolve(args.out || path.join(__dirname, 'aa-leaderboard.json'));
  const firstSeenPath = path.resolve(args['first-seen'] || path.join(__dirname, 'aa-first-seen.json'));

  let html;
  if (args.html) {
    html = fs.readFileSync(args.html, 'utf8');
  } else {
    html = await fetchPageHTML(url);
  }

  const { entries, parsedRows, unscoredRows } = parseLeaderboard(html);
  const errors = validateEntries(entries);
  if (errors.length > 0) {
    console.error('Guardrail failures (nothing written):');
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  const fetchedAt = new Date().toISOString();
  const changed = writeSnapshotIfChanged(entries, outPath, fetchedAt);
  updateFirstSeen(entries, firstSeenPath, todayISO());

  console.log(`Fetched ${url}`);
  console.log(`  rows parsed: ${parsedRows} (scored ${entries.length}, unscored ${unscoredRows})`);
  console.log(`  first-seen map: ${fs.existsSync(firstSeenPath) ? 'updated' : 'created'} at ${firstSeenPath}`);
  console.log(changed ? `  wrote ${outPath} (entries changed)` : `  ${outPath} unchanged (entries identical)`);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  fetchPageHTML,
  parseLeaderboard,
  validateEntries,
  updateFirstSeen,
  buildSnapshot,
  writeSnapshotIfChanged,
  unescapeEntities
};
