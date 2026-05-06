# Add Month Row Plan

## Goal

Add a stable workflow for opening a new empty month row, starting with `26-May`.

The current update scripts are good for model-level updates, but there is no dedicated command for "a new month has started, create an empty row". Using `upsert-entry.js` with a fake model would create avoidable data noise, so this should be a separate small script.

## Proposed Script

Create `scripts/add-month-row.js`.

Example usage:

```powershell
node scripts\add-month-row.js --month 26-May
```

Expected behavior:

- Read `data.json`.
- If the month already exists, make no data change and report that it already exists.
- If the month does not exist, insert a new row in chronological order.
- Fill every vendor/category column with an empty array.
- Rebuild derived artifacts from `data.json`:
  - `llm_release_timeline_2022-11_to_2026-04.csv`
  - `llm_release_timeline_2022-11_to_2026-04.md`
  - `links.json`

## Implementation Notes

Prefer reusing the existing helpers in `scripts/upsert-entry.js` and `scripts/build-json.js` where possible:

- `ensureMonthRow(data, month)` already knows how to create and sort month rows.
- `parseDataJSON(...)`, `renderCSV(...)`, `renderMarkdownTable(...)`, and `buildLinksJSON(...)` already define the canonical data flow.

This keeps the new script small and avoids duplicating month sorting or export logic.

## File Naming Decision

For the first implementation, keep the existing CSV/Markdown filenames:

- `llm_release_timeline_2022-11_to_2026-04.csv`
- `llm_release_timeline_2022-11_to_2026-04.md`

Reason: these filenames are referenced in scripts and docs. Renaming them to `to_2026-05` is a broader cleanup task and can be handled separately after the month-row workflow is stable.

The visible date range in user-facing text, such as `README.md` and `index.html`, should still be updated from `2026-04` to `2026-05`.

## Verification

After creating the row, run:

```powershell
node scripts\check-data-links.js
```

Expected result:

- The referenced model count should stay the same, because the new month row is empty.
- Missing links should be `0`.
- Orphan links should be `0`.
- `data.json`, CSV, and Markdown should all contain a `26-May` row.

Optional spot checks:

```powershell
Select-String -Path data.json,llm_release_timeline_2022-11_to_2026-04.csv,llm_release_timeline_2022-11_to_2026-04.md -Pattern "26-May"
```

## Future Workflow

At the start of each new month:

```powershell
node scripts\add-month-row.js --month 26-May
node scripts\check-data-links.js
```

When a model is released later:

```powershell
node scripts\upsert-entry.js --month 26-May --vendor OpenAI --model "Example Model" --url "https://example.com"
node scripts\check-data-links.js
```

This gives the repo two clear operations:

- `add-month-row.js` opens a new month.
- `upsert-entry.js` adds or fixes model entries.
