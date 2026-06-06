# Semi-Automated Release Updates Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a semi-automated workflow that discovers candidate LLM releases, lets a human review them, then applies approved entries through the existing `data.json` update pipeline.

**Architecture:** Keep `data.json` as the only source of truth. Add a candidate discovery layer that writes reviewed-but-not-yet-applied data into `pending-releases.json`, then add a small apply script that reuses the existing upsert/build/check logic. GitHub Actions should run discovery on demand or schedule, but should create reviewable output instead of silently changing the table.

**Tech Stack:** Node.js 20, existing CommonJS scripts, GitHub Actions, JSON files, existing `scripts/upsert-entry.js`, `scripts/build-json.js`, and `scripts/check-data-links.js`.

---

## Assumptions

- The first version should not directly scrape every vendor website with brittle HTML parsing.
- The first version should support a small, explicit source list, starting with stable official feeds or APIs where possible.
- A candidate must not enter `data.json` until a human approves it.
- Existing table columns remain authoritative; unknown vendors should be reported as candidates needing manual column creation.
- The existing single-entry update flow should remain the only path that mutates official data.

## Success Criteria

- Running one command produces a `pending-releases.json` file with candidate releases.
- Running one command validates the pending file and reports missing fields, duplicate models, unknown vendors, and already-recorded entries.
- Approved candidates can be applied to `data.json` without manually editing the full table.
- After applying candidates, CSV, MD, and `links.json` are rebuilt and `check-data-links.js` passes.
- GitHub Actions can run discovery on a schedule or manually and produce a reviewable PR or artifact.

---

### Task 1: Define Candidate Schema

**Files:**
- Create: `scripts/release-candidate-utils.js`
- Create: `scripts/release-candidate-utils.test.js`
- Create: `pending-releases.example.json`

**Step 1: Write tests for candidate normalization**

Test cases:
- Accept a valid candidate with `month`, `vendor`, `model`, `url`, `source`, and `status`.
- Default missing `status` to `pending`.
- Reject missing `month`, `vendor`, `model`, or `url`.
- Reject invalid `status` values.
- Normalize whitespace around string fields.

Run:

```bash
node scripts/release-candidate-utils.test.js
```

Expected: FAIL because the utility file does not exist yet.

**Step 2: Implement minimal utilities**

Add functions:
- `normalizeCandidate(candidate)`
- `normalizeCandidates(candidates)`
- `validateCandidate(candidate)`
- `readCandidates(filePath)`
- `writeCandidates(filePath, candidates)`

Allowed statuses:
- `pending`
- `approved`
- `rejected`
- `applied`

**Step 3: Add example pending file**

Create `pending-releases.example.json`:

```json
[
  {
    "month": "26-Jun",
    "vendor": "OpenAI",
    "model": "Example Model",
    "url": "https://example.com/model",
    "source": "manual example",
    "status": "pending",
    "notes": "Example only; do not apply."
  }
]
```

**Step 4: Verify**

Run:

```bash
node scripts/release-candidate-utils.test.js
```

Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/release-candidate-utils.js scripts/release-candidate-utils.test.js pending-releases.example.json
git commit -m "feat: add release candidate schema"
```

---

### Task 2: Add Candidate Validation

**Files:**
- Create: `scripts/check-release-candidates.js`
- Create: `scripts/check-release-candidates.test.js`
- Modify: `SCRIPTS_README.md`

**Step 1: Write tests**

Test validation behavior:
- Unknown vendor is reported.
- Candidate already present in `data.json` is reported as duplicate.
- Missing required fields fail validation.
- Approved candidates are checked the same way as pending candidates.
- Rejected and applied candidates are ignored by apply-readiness checks.

Run:

```bash
node scripts/check-release-candidates.test.js
```

Expected: FAIL because the script does not exist yet.

**Step 2: Implement validation script**

Command:

```bash
node scripts/check-release-candidates.js pending-releases.json
```

Behavior:
- Load `data.json`.
- Load candidate file.
- Validate schema using `release-candidate-utils.js`.
- Print grouped warnings:
  - invalid candidates
  - unknown vendors
  - already-existing model entries
  - candidates missing official-looking URLs, if detectable
- Exit with code `1` for invalid schema or unknown vendors.
- Exit with code `0` if candidates are valid but include already-existing entries.

**Step 3: Document command**

Update `SCRIPTS_README.md` with a short section:

```bash
node scripts/check-release-candidates.js pending-releases.json
```

Explain that this checks candidate quality before human approval or apply.

**Step 4: Verify**

Run:

```bash
node scripts/check-release-candidates.test.js
node scripts/check-release-candidates.js pending-releases.example.json
```

Expected: tests PASS; example either warns that the example is not intended to apply or passes as structurally valid.

**Step 5: Commit**

```bash
git add scripts/check-release-candidates.js scripts/check-release-candidates.test.js SCRIPTS_README.md
git commit -m "feat: validate release candidates"
```

---

### Task 3: Apply Approved Candidates

**Files:**
- Create: `scripts/apply-release-candidates.js`
- Create: `scripts/apply-release-candidates.test.js`
- Modify: `SCRIPTS_README.md`

**Step 1: Write tests**

Test behavior:
- Only candidates with `status: "approved"` are applied.
- Pending candidates are left untouched.
- Applied candidates are changed to `status: "applied"`.
- The script uses the same behavior as `upsert-entry.js` for existing months and new months.
- Duplicate existing entries do not create duplicate model names.

Run:

```bash
node scripts/apply-release-candidates.test.js
```

Expected: FAIL because the script does not exist yet.

**Step 2: Implement apply script**

Command:

```bash
node scripts/apply-release-candidates.js pending-releases.json
```

Behavior:
- Read candidates.
- Validate candidates first.
- For each `approved` candidate, call exported `upsertEntry()` from `scripts/upsert-entry.js`.
- Process candidates sequentially.
- Mark successfully applied candidates as `applied`.
- Write the updated pending file.
- Run or instruct the caller to run `node scripts/check-data-links.js`.

Keep this simple. Do not add database locking, queues, or complex conflict handling.

**Step 3: Add dry-run mode**

Command:

```bash
node scripts/apply-release-candidates.js pending-releases.json --dry-run
```

Behavior:
- Print what would be applied.
- Do not write `data.json`.
- Do not write the pending file.

**Step 4: Verify**

Run:

```bash
node scripts/apply-release-candidates.test.js
node scripts/check-data-links.js
```

Expected: tests PASS; data-link check PASS after any fixture-based test cleanup.

**Step 5: Commit**

```bash
git add scripts/apply-release-candidates.js scripts/apply-release-candidates.test.js SCRIPTS_README.md
git commit -m "feat: apply approved release candidates"
```

---

### Task 4: Add Initial Discovery Script

**Files:**
- Create: `scripts/discover-releases.js`
- Create: `scripts/sources.example.json`
- Create: `scripts/discover-releases.test.js`
- Modify: `SCRIPTS_README.md`

**Step 1: Define minimal source config**

Create `scripts/sources.example.json`:

```json
[
  {
    "vendor": "OpenAI",
    "type": "rss",
    "url": "https://example.com/feed.xml",
    "enabled": false
  }
]
```

Do not hard-code a large source list in the first implementation.

**Step 2: Write tests around parsing, not network**

Use local XML/JSON fixture strings inside tests.

Test behavior:
- Parse feed item title and URL into a candidate.
- Infer `month` from feed item date.
- Attach `source`.
- Default candidate `status` to `pending`.
- Do not output candidates for disabled sources.

Run:

```bash
node scripts/discover-releases.test.js
```

Expected: FAIL because the script does not exist yet.

**Step 3: Implement discovery script**

Command:

```bash
node scripts/discover-releases.js --sources scripts/sources.json --out pending-releases.json
```

Behavior:
- Read source config.
- Fetch enabled sources.
- Parse RSS/Atom only in v1.
- Create rough candidates.
- Merge with existing `pending-releases.json`.
- Avoid duplicates by `vendor + model + url`.
- Never modify `data.json`.

**Step 4: Keep model extraction conservative**

For v1, candidate `model` can initially use the feed item title. Do not attempt clever model-name extraction until review data proves the need.

**Step 5: Verify**

Run:

```bash
node scripts/discover-releases.test.js
node scripts/discover-releases.js --sources scripts/sources.example.json --out pending-releases.tmp.json
node scripts/check-release-candidates.js pending-releases.tmp.json
```

Expected: tests PASS; disabled example sources produce an empty or no-op pending file.

**Step 6: Commit**

```bash
git add scripts/discover-releases.js scripts/discover-releases.test.js scripts/sources.example.json SCRIPTS_README.md
git commit -m "feat: discover release candidates from feeds"
```

---

### Task 5: Add Review Workflow Documentation

**Files:**
- Create: `note/semi_automated_update_workflow.md`
- Modify: `AGENT_UPDATE_GUIDE.md`

**Step 1: Document human review loop**

Add a clear workflow:

```bash
node scripts/discover-releases.js --sources scripts/sources.json --out pending-releases.json
node scripts/check-release-candidates.js pending-releases.json
```

Then human edits only statuses:
- `pending` -> `approved`
- `pending` -> `rejected`

Then:

```bash
node scripts/apply-release-candidates.js pending-releases.json
node scripts/check-data-links.js
```

**Step 2: Add review checklist**

Checklist:
- Is this a real model/product release?
- Is the month correct?
- Is the vendor column correct?
- Is the URL official and specific?
- Is this already represented under a different name?

**Step 3: Update agent guide**

Add a short section to `AGENT_UPDATE_GUIDE.md` saying:
- Single known update still uses `upsert-entry.js`.
- Unknown batch discovery uses the semi-automated candidate flow.
- Agents must not apply `pending` candidates without explicit approval.

**Step 4: Commit**

```bash
git add note/semi_automated_update_workflow.md AGENT_UPDATE_GUIDE.md
git commit -m "docs: describe semi-automated update workflow"
```

---

### Task 6: Add GitHub Actions Discovery Workflow

**Files:**
- Create: `.github/workflows/discover-releases.yml`
- Modify: `.github/workflows/build.yml`

**Step 1: Create workflow dispatch first**

Add manual workflow:

```yaml
name: Discover Releases

on:
  workflow_dispatch:

jobs:
  discover:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: node scripts/discover-releases.js --sources scripts/sources.json --out pending-releases.json
      - run: node scripts/check-release-candidates.js pending-releases.json
      - uses: actions/upload-artifact@v4
        with:
          name: pending-releases
          path: pending-releases.json
```

Do not add schedule until the manual workflow is proven.

**Step 2: Optionally add PR creation**

If artifact-only is too awkward, add a follow-up workflow step using a standard PR action. Keep it separate from the first working version.

**Step 3: Align old build workflow**

Review `.github/workflows/build.yml`.

Recommended minimal change:
- Add `data.json` to watched paths.
- Add generated CSV and MD to `git add`.
- Confirm it does not loop unnecessarily.

**Step 4: Verify locally**

Run:

```bash
node scripts/discover-releases.test.js
node scripts/check-release-candidates.test.js
node scripts/apply-release-candidates.test.js
node scripts/model-utils.test.js
node scripts/upsert-entry.test.js
node scripts/add-vendor-column.test.js
node scripts/check-data-links.js
```

Expected: all PASS.

**Step 5: Commit**

```bash
git add .github/workflows/discover-releases.yml .github/workflows/build.yml
git commit -m "ci: add release discovery workflow"
```

---

### Task 7: Add Real Sources Gradually

**Files:**
- Create: `scripts/sources.json`
- Modify: `note/semi_automated_update_workflow.md`

**Step 1: Start with 3-5 sources**

Pick sources with stable official feeds or structured APIs. Good first candidates:
- OpenAI official news/blog feed, if available.
- Anthropic news feed, if available.
- Mistral news feed, if available.
- Hugging Face organization model listings only if the signal is manageable.
- GitHub releases for projects already tracked in `Open-Source`.

**Step 2: Run discovery manually**

Run:

```bash
node scripts/discover-releases.js --sources scripts/sources.json --out pending-releases.json
node scripts/check-release-candidates.js pending-releases.json
```

Expected:
- Candidate list is understandable.
- False positives are visible and easy to reject.

**Step 3: Review candidates**

Only change `status` and `notes`.

Do not rewrite official table files directly.

**Step 4: Apply approved entries**

Run:

```bash
node scripts/apply-release-candidates.js pending-releases.json --dry-run
node scripts/apply-release-candidates.js pending-releases.json
node scripts/check-data-links.js
```

Expected: approved entries enter `data.json`; generated files sync; link check PASS.

**Step 5: Commit**

```bash
git add scripts/sources.json pending-releases.json data.json links.json llm_release_timeline_2022-11_to_2026-04.csv llm_release_timeline_2022-11_to_2026-04.md note/semi_automated_update_workflow.md
git commit -m "data: apply reviewed release candidates"
```

---

## First-Version Non-Goals

- No full browser automation.
- No LLM-based autonomous judgment.
- No automatic vendor-column creation.
- No automatic publish without human approval.
- No scraping of private, paywalled, or login-only sources.
- No complex deduplication beyond exact or simple normalized matches.

## Final Verification Command

Run this before considering the implementation complete:

```bash
node scripts/release-candidate-utils.test.js
node scripts/check-release-candidates.test.js
node scripts/apply-release-candidates.test.js
node scripts/discover-releases.test.js
node scripts/model-utils.test.js
node scripts/upsert-entry.test.js
node scripts/add-vendor-column.test.js
node scripts/check-data-links.js
```

Expected: all tests pass, and `check-data-links.js` reports zero missing links and zero orphan links.
