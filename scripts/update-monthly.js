// Daily monthly-table updater: spot newly released models on the AA leaderboard
// and add them to data.json, leaving an auditable report for everything else.
//
// Classification (deterministic rules, no AI - humans audit via the report):
//   1. already    normalized model name (or vendor-prefix-stripped name) already in
//                 the table somewhere -> silently skipped
//   2. variant    base name (reasoning-effort suffix stripped) already in the table
//                 -> skipped, reported (covers effort variants AND renames)
//   3. new?       firstSeen must be a real date (not "baseline") for ANY reporting:
//                 the one-time baseline backlog is skipped silently so weekly
//                 reports only cover this automation's own observations
//   4. no-column  newly appeared model whose AA vendor has no mapped table column
//                 -> skipped, reported (signal for a possible new column)
//   5. candidate  fetch the AA model page and parse "X was released on {Month} {Day}, {Year}":
//                   release within the last 40 days  -> auto-added to its release month
//                   release older than 40 days        -> backfill, report only
//                   no parseable date                 -> uncertain, report only
//
// Safety cap: at most MAX_AUTO_ADD models are added per run; anything beyond is
// reported as uncertain for human review.
//
// Usage: node scripts/update-monthly.js [--dry-run] [--report <path>]
//          [--data data.json] [--csv ...] [--md ...] [--links links.json]
//          [--snapshot scripts/aa-leaderboard.json] [--first-seen scripts/aa-first-seen.json]
//          [--html-cache <dir>]   (read cached model pages from <dir>/<slug>.html)
// Env:  AA_HTTP_PROXY — optional proxy for local runs (see fetch-aa.js)

const fs = require('node:fs');
const path = require('node:path');

const { fetchPageHTML } = require('./fetch-aa');
const { parseDataJSON } = require('./build-json');
const { upsertEntry } = require('./upsert-entry');
const { VENDOR_TO_COLUMN, buildMissingVendors } = require('./aa-vendor-ranking');

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const AA_MODEL_URL = 'https://artificialanalysis.ai/models/';
const MAX_AUTO_ADD = 5;
const RECENT_WINDOW_DAYS = 40;
// Report buckets (variant / no-column / backfill / uncertain) only cover items
// that appeared within this window; older untracked entries are silently
// skipped so daily Issues stay focused on fresh events.
const REPORT_WINDOW_DAYS = 7;

// Reasoning-effort suffixes are token compositions: "(max)", "(Non-reasoning)",
// "(max with fallback)", "(Non-reasoning, Low Effort)", "(Feb 2026)". A suffix
// is stripped only when EVERY comma/space-separated token is a known effort
// token or the whole content is a date, so "(Beta)" / "(preview)" stay put.
const SUFFIX_TOKENS = new Set([
  'non-reasoning', 'reasoning', 'instruct', 'with', 'fallback',
  'max', 'xhigh', 'ultra', 'high', 'medium', 'low', 'minimal',
  'effort', 'default'
]);

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    args[token.slice(2)] = argv[i + 1];
    i++;
  }
  return args;
}

// Lowercase alphanumeric only, so "Qwen3.8-2.4T-A95B" == "Qwen3.8 2.4T A95B".
function normalizeName(name) {
  return String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function stripEffortSuffix(name) {
  const text = String(name);
  const match = text.match(/\s*\(([^()]*)\)\s*$/);
  if (!match) return text.trim();

  const content = match[1].toLowerCase().trim();
  if (/^[a-z]{3,9} \d{4}$/.test(content)) return text.slice(0, match.index).trim();

  const tokens = content.split(/[\s,]+/).filter(Boolean);
  if (tokens.length > 0 && tokens.every(token => SUFFIX_TOKENS.has(token))) {
    return text.slice(0, match.index).trim();
  }
  return text.trim();
}

// AA prefixes some model names with the vendor ("DeepSeek V4 Flash 0731") while
// the table's DeepSeek column drops it ("V4-Flash-0731"), so both forms are tried.
function withVendorPrefixStripped(name, vendor) {
  const prefix = vendor.toLowerCase();
  return name.toLowerCase().startsWith(prefix) ? name.slice(prefix.length) : name;
}

function exactMatches(entry) {
  return new Set([
    normalizeName(entry.model),
    normalizeName(withVendorPrefixStripped(entry.model, entry.vendor))
  ]);
}

function baseMatches(entry) {
  const base = stripEffortSuffix(entry.model);
  return new Set([
    normalizeName(base),
    normalizeName(withVendorPrefixStripped(base, entry.vendor))
  ]);
}

function collectTableNames(data) {
  const names = new Set();
  for (const row of data.rows) {
    for (const vendor of data.vendors) {
      for (const cell of row[vendor] || []) {
        names.add(normalizeName(cell.name));
      }
    }
  }
  return names;
}

// "was released on August 26, 2026" -> Date; null when the page has no such sentence.
function parseReleaseDate(html) {
  const match = html.match(/was released on ([A-Z][a-z]+ \d{1,2}, \d{4})/);
  if (!match) return null;
  const date = new Date(match[1]);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthLabel(date) {
  return `${String(date.getFullYear()).slice(2)}-${MONTH_NAMES[date.getMonth()]}`;
}

// Local (not UTC) YYYY-MM-DD, so the report's release date always matches monthLabel.
function localDateLabel(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function daysAgo(date, now) {
  return (now - date) / 86400000;
}

// Vendors listed in aa-ranking.json's missingVendors but lacking an intro entry
// in aa-ranking.html (empty 简介 cell on the page).
function findMissingIntros(leaderboard, data) {
  const htmlPath = path.resolve(__dirname, '..', 'aa-ranking.html');
  if (!fs.existsSync(htmlPath)) return [];
  const html = fs.readFileSync(htmlPath, 'utf8');
  const block = html.match(/const vendorIntros = \{[\s\S]*?\};/);
  if (!block) return [];
  const documented = new Set([...block[0].matchAll(/'([^']+)':/g)].map(m => m[1]));
  return buildMissingVendors(leaderboard, data)
    .map(item => item.vendor)
    .filter(vendor => !documented.has(vendor));
}

async function fetchModelPage(slug, htmlCacheDir) {
  if (htmlCacheDir) {
    const cached = path.join(htmlCacheDir, `${slug}.html`);
    if (fs.existsSync(cached)) return fs.readFileSync(cached, 'utf8');
  }
  return fetchPageHTML(AA_MODEL_URL + slug);
}

async function classifyAndApply(options) {
  const {
    snapshot,
    firstSeen,
    data,
    dataPath, csvPath, mdPath, linksPath,
    dryRun,
    htmlCacheDir,
    now = new Date()
  } = options;

  const tableNames = collectTableNames(data);
  const buckets = {
    added: [],
    variant: [],
    noColumn: [],
    backfill: [],
    uncertain: []
  };
  let backlogSkipped = 0;

  const isKnown = names => [...names].some(name => tableNames.has(name));

  for (const entry of snapshot.entries) {
    const column = VENDOR_TO_COLUMN[entry.vendor];

    if (!column || !data.vendors.includes(column)) {
      if (isRecentlySeen(firstSeen, entry.model, now)) {
        buckets.noColumn.push({ model: entry.model, vendor: entry.vendor, score: entry.score });
      }
      continue;
    }

    if (isKnown(exactMatches(entry))) {
      continue; // already tracked somewhere in the table
    }

    const base = stripEffortSuffix(entry.model);
    if (isKnown(baseMatches(entry))) {
      if (isRecentlySeen(firstSeen, entry.model, now)) {
        buckets.variant.push({ model: entry.model, base });
      }
      continue;
    }

    if (!isNewlySeen(firstSeen, entry.model)) {
      backlogSkipped += 1; // pre-automation backlog: never auto-added, not reported weekly
      continue;
    }

    // Freshly appeared model: confirm the release date on its AA model page.
    let releaseDate = null;
    let pageError = null;
    try {
      const html = await fetchModelPage(entry.slug, htmlCacheDir);
      releaseDate = parseReleaseDate(html);
    } catch (error) {
      pageError = error.message;
    }

    if (!releaseDate) {
      if (isRecentlySeen(firstSeen, entry.model, now)) {
        buckets.uncertain.push({ model: entry.model, vendor: entry.vendor, reason: pageError || '详情页解析不到发布日期' });
      }
      continue;
    }

    const age = daysAgo(releaseDate, now);
    if (age > RECENT_WINDOW_DAYS || age < -1) {
      if (isRecentlySeen(firstSeen, entry.model, now)) {
        buckets.backfill.push({ model: entry.model, vendor: entry.vendor, reason: `发布于 ${localDateLabel(releaseDate)}，超出 ${RECENT_WINDOW_DAYS} 天自动窗口` });
      }
      continue;
    }

    if (buckets.added.length >= MAX_AUTO_ADD) {
      buckets.uncertain.push({ model: entry.model, vendor: entry.vendor, reason: `单次自动添加已达上限 ${MAX_AUTO_ADD} 条` });
      continue;
    }

    const month = monthLabel(releaseDate);
    const url = AA_MODEL_URL + entry.slug;
    let upsert = { addedModel: true };
    if (!dryRun) {
      upsert = upsertEntry({ dataPath, csvPath, mdPath, linksPath, month, vendor: column, model: base, url });
    }
    buckets.added.push({ model: base, column, month, url, released: localDateLabel(releaseDate), upsert });
    // Later variants of the same base (other effort levels) must not re-add it.
    tableNames.add(normalizeName(base));
    tableNames.add(normalizeName(withVendorPrefixStripped(base, entry.vendor)));
  }

  buckets.backlogSkipped = backlogSkipped;
  return buckets;
}

function isNewlySeen(firstSeen, model) {
  const seen = firstSeen[model];
  return Boolean(seen) && seen !== 'baseline';
}

// firstSeen is a real date AND within REPORT_WINDOW_DAYS of now.
function isRecentlySeen(firstSeen, model, now) {
  const seen = firstSeen[model];
  if (!seen || seen === 'baseline') return false;
  return (now - new Date(seen)) / 86400000 <= REPORT_WINDOW_DAYS;
}

function renderReport(buckets, dryRun) {
  const lines = [];
  const dateLabel = new Date().toISOString().slice(0, 10);

  lines.push(`## AA 日报：月表更新（${dateLabel}）${dryRun ? ' — dry-run' : ''}`);
  lines.push('');

  lines.push(`### ✅ 已自动添加（${buckets.added.length}）`);
  if (buckets.added.length === 0) lines.push('（无）');
  for (const item of buckets.added) {
    lines.push(`- **${item.model}** → \`${item.month}\` @ ${item.column}｜发布 ${item.released}｜[AA 页](${item.url})`);
  }

  lines.push('');
  lines.push(`### ↩️ 疑似变体/改名，已跳过（${buckets.variant.length}）`);
  if (buckets.variant.length === 0) lines.push('（无）');
  for (const item of buckets.variant) {
    lines.push(`- ${item.model} → 基名 \`${item.base}\` 已在表中`);
  }

  lines.push('');
  lines.push(`### 🧩 新出现但无对应表格列（${buckets.noColumn.length}）`);
  if (buckets.noColumn.length === 0) lines.push('（无）');
  for (const item of buckets.noColumn) {
    lines.push(`- ${item.vendor}｜${item.model}（${item.score}）`);
  }

  lines.push('');
  lines.push(`### 🕰️ 新出现但发布过早，仅记录（${buckets.backfill.length}）`);
  if (buckets.backfill.length === 0) lines.push('（无）');
  for (const item of buckets.backfill) {
    lines.push(`- ${item.model}（${item.vendor}）｜${item.reason}`);
  }

  lines.push('');
  lines.push(`### ❓ 存疑，请人工处理（${buckets.uncertain.length}）`);
  if (buckets.uncertain.length === 0) lines.push('（无）');
  for (const item of buckets.uncertain) {
    lines.push(`- ${item.model}（${item.vendor}）｜${item.reason}`);
  }

  lines.push('');
  lines.push(`（自动化启动前的历史积压 ${buckets.backlogSkipped} 条未列入本报告。）`);

  return lines.join('\n') + '\n';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = path.resolve(__dirname, '..');
  const dataPath = path.resolve(root, args.data || 'data.json');
  const csvPath = path.resolve(root, args.csv || 'llm_release_timeline_2022-11_to_2026-04.csv');
  const mdPath = path.resolve(root, args.md || 'llm_release_timeline_2022-11_to_2026-04.md');
  const linksPath = path.resolve(root, args.links || 'links.json');
  const snapshotPath = path.resolve(args.snapshot || path.join(__dirname, 'aa-leaderboard.json'));
  const firstSeenPath = path.resolve(args['first-seen'] || path.join(__dirname, 'aa-first-seen.json'));

  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  const firstSeen = JSON.parse(fs.readFileSync(firstSeenPath, 'utf8'));
  const data = parseDataJSON(dataPath);

  const buckets = await classifyAndApply({
    snapshot,
    firstSeen,
    data,
    dataPath, csvPath, mdPath, linksPath,
    dryRun: Boolean(args.dryRun),
    htmlCacheDir: args['html-cache'] ? path.resolve(args['html-cache']) : null
  });

  const missingIntros = findMissingIntros(snapshot, data);

  console.log(`added=${buckets.added.length} variant=${buckets.variant.length} no-column=${buckets.noColumn.length} backfill=${buckets.backfill.length} uncertain=${buckets.uncertain.length} backlog=${buckets.backlogSkipped}`);
  for (const item of buckets.added) {
    console.log(`  + ${item.model} -> ${item.month} @ ${item.column}`);
  }

  let report = renderReport(buckets, Boolean(args.dryRun));
  if (missingIntros.length > 0) {
    report += `\n### 📝 缺编者注的厂商（aa-ranking.html vendorIntros）\n${missingIntros.map(v => `- ${v}`).join('\n')}\n`;
  }

  const hasContent = buckets.added.length + buckets.variant.length + buckets.noColumn.length
    + buckets.backfill.length + buckets.uncertain.length + missingIntros.length > 0;

  if (args.report) {
    if (hasContent) {
      fs.writeFileSync(path.resolve(args.report), report, 'utf8');
      console.log(`report written: ${args.report}`);
    } else {
      console.log('nothing to report (no report file written)');
    }
  } else {
    console.log('');
    console.log(report);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  REPORT_WINDOW_DAYS,
  normalizeName,
  stripEffortSuffix,
  exactMatches,
  baseMatches,
  collectTableNames,
  parseReleaseDate,
  monthLabel,
  classifyAndApply,
  isNewlySeen,
  isRecentlySeen
};
