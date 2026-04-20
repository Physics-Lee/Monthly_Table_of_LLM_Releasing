import csv
import sys

# Read current CSV
with open('llm_release_timeline_2022-11_to_2026-04.csv', 'r', newline='', encoding='utf-8') as f:
    reader = csv.reader(f)
    rows = list(reader)

print(f"Total rows: {len(rows)}")
print(f"Header fields: {len(rows[0])}")
print()

# Map month to row index
month_to_idx = {}
for i, row in enumerate(rows):
    if row and row[0]:
        month_to_idx[row[0]] = i
        
# Check target rows
for month in ['23-Mar', '23-May', '23-Jun']:
    idx = month_to_idx.get(month)
    if idx is not None:
        row = rows[idx]
        print(f"Row {idx} ({month}): {len(row)} fields")
        if len(row) > 32:
            print(f"  LLM-Applications (idx 32): {repr(row[32])}")
        print()

# Modify rows
changes = {
    '23-Mar': 'GPT4All',
    '23-May': 'LM Studio',
    '23-Jun': 'AnythingLLM'
}

for month, app in changes.items():
    idx = month_to_idx.get(month)
    if idx is not None:
        current = rows[idx][32].strip() if len(rows[idx]) > 32 else ''
        if current:
            rows[idx][32] = current + ' + ' + app
        else:
            rows[idx][32] = app
        print(f"Updated {month}: {rows[idx][32]}")

# Ensure all rows have the same number of fields
max_fields = max(len(row) for row in rows)
print(f"\nMax fields: {max_fields}")
for row in rows:
    while len(row) < max_fields:
        row.append('')

# Write back
with open('llm_release_timeline_2022-11_to_2026-04.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print("\nCSV updated successfully.")
