import csv

# Read current CSV
with open(
    "llm_release_timeline_2022-11_to_2026-04.csv", "r", newline="", encoding="utf-8"
) as f:
    reader = csv.reader(f)
    rows = list(reader)

header = rows[0]
print(f"Header columns: {len(header)}")
print(f"Column names: {header}")
print()

# Find column indices
month_idx = 0
openai_idx = header.index("OpenAI")
anthropic_idx = header.index("Anthropic")
mistral_idx = header.index("Mistral")
xai_idx = header.index("xAI")
deepseek_idx = header.index("DeepSeek")
qwen_idx = header.index("Qwen-Alibaba")
cohere_idx = header.index("Cohere")
ant_idx = header.index("Ant-Group")
stepfun_idx = header.index("StepFun")
kimi_idx = header.index("Kimi-Moonshot")
doubao_idx = header.index("Doubao-ByteDance")
llm_app_idx = header.index("LLM-Applications")
ai_cloud_idx = header.index("AI-Cloud")

print(f"OpenAI idx: {openai_idx}")
print(f"Anthropic idx: {anthropic_idx}")
print(f"Mistral idx: {mistral_idx}")
print(f"xAI idx: {xai_idx}")
print(f"DeepSeek idx: {deepseek_idx}")
print(f"Qwen idx: {qwen_idx}")
print(f"Cohere idx: {cohere_idx}")
print(f"Ant idx: {ant_idx}")
print(f"StepFun idx: {stepfun_idx}")
print(f"Kimi idx: {kimi_idx}")
print(f"Doubao idx: {doubao_idx}")
print(f"LLM App idx: {llm_app_idx}")
print(f"AI Cloud idx: {ai_cloud_idx}")

# Fix 1: 22-Nov - Remove Azure OpenAI Service (wrong date, should be 2023-Jan)
# Row 2 (index 1)
rows[1][ai_cloud_idx] = ""
print("\nFix 1: Removed Azure OpenAI Service from 22-Nov")

# Fix 2: 23-Apr - Remove AWS Bedrock GA (wrong date, should be 23-Sep)
# Row 7 (index 6)
rows[6][ai_cloud_idx] = ""
print("Fix 2: Removed AWS Bedrock GA from 23-Apr")

# Fix 3: 23-Sep - Add AWS Bedrock GA
# Row 12 (index 11)
rows[11][ai_cloud_idx] = "AWS Bedrock GA"
print("Fix 3: Added AWS Bedrock GA to 23-Sep")

# Fix 4: 23-Jul - Move Bailing from StepFun to Ant-Group
# Row 10 (index 9)
rows[9][stepfun_idx] = ""
rows[9][ant_idx] = "Bailing"
print("Fix 4: Moved Bailing to Ant-Group in 23-Jul")

# Fix 5: 24-Feb - Remove Jurassic-2 (wrong date, was 2023-Mar)
# Row 17 (index 16)
rows[16][header.index("AI21")] = ""
print("Fix 5: Removed Jurassic-2 from 24-Feb")

# Fix 6: 24-May - Move Ling from StepFun to Ant-Group
# Row 20 (index 19)
rows[19][stepfun_idx] = ""
rows[19][ant_idx] = "Ling"
print("Fix 6: Moved Ling to Ant-Group in 24-May")

# Fix 7: 24-Nov - Fix column placement
# Row 26 (index 25)
# Currently: Mistral Large 2.1 + Pixtral Large in xAI col, Qwen2.5-Coder + QwQ-32B in Cohere col
# Should be: Mistral in Mistral col, Qwen in Qwen col
print(f"\nBefore fix 7 - 24-Nov:")
print(f"  xAI col: '{rows[25][xai_idx]}'")
print(f"  Mistral col: '{rows[25][mistral_idx]}'")
print(f"  Cohere col: '{rows[25][cohere_idx]}'")
print(f"  Qwen col: '{rows[25][qwen_idx]}'")

rows[25][xai_idx] = ""  # Remove from xAI
rows[25][mistral_idx] = "Mistral Large 2.1 + Pixtral Large"  # Add to Mistral
rows[25][cohere_idx] = ""  # Remove from Cohere
rows[25][qwen_idx] = "Qwen2.5-Coder Family + QwQ-32B"  # Add to Qwen

print("After fix 7:")
print(f"  xAI col: '{rows[25][xai_idx]}'")
print(f"  Mistral col: '{rows[25][mistral_idx]}'")
print(f"  Cohere col: '{rows[25][cohere_idx]}'")
print(f"  Qwen col: '{rows[25][qwen_idx]}'")

# Fix 8: 25-Oct - Move Ling-1T + Ring-1T + Ming-flash-omni from Doubao to Ant-Group
# Row 37 (index 36)
print(f"\nBefore fix 8 - 25-Oct:")
print(f"  Doubao col: '{rows[36][doubao_idx]}'")
print(f"  Ant col: '{rows[36][ant_idx]}'")

rows[36][doubao_idx] = ""  # Remove from Doubao
rows[36][ant_idx] = "Ling-1T + Ring-1T + Ming-flash-omni-Preview"  # Add to Ant

print("After fix 8:")
print(f"  Doubao col: '{rows[36][doubao_idx]}'")
print(f"  Ant col: '{rows[36][ant_idx]}'")

# Fix 9: 26-Mar - Move Grok 4.2 Multi-Agent from DeepSeek to xAI
# Row 42 (index 41)
print(f"\nBefore fix 9 - 26-Mar:")
print(f"  xAI col: '{rows[41][xai_idx]}'")
print(f"  DeepSeek col: '{rows[41][deepseek_idx]}'")

rows[41][deepseek_idx] = ""  # Remove from DeepSeek
rows[41][xai_idx] = "Grok 4.2 Multi-Agent"  # Add to xAI

print("After fix 9:")
print(f"  xAI col: '{rows[41][xai_idx]}'")
print(f"  DeepSeek col: '{rows[41][deepseek_idx]}'")

# Fix 10: 26-Apr - Move Kimi K2.6 from Doubao to Kimi
# Row 43 (index 42)
print(f"\nBefore fix 10 - 26-Apr:")
print(f"  Kimi col: '{rows[42][kimi_idx]}'")
print(f"  Doubao col: '{rows[42][doubao_idx]}'")

rows[42][doubao_idx] = ""  # Remove from Doubao
rows[42][kimi_idx] = "Kimi K2.6"  # Add to Kimi

print("After fix 10:")
print(f"  Kimi col: '{rows[42][kimi_idx]}'")
print(f"  Doubao col: '{rows[42][doubao_idx]}'")

# Ensure all rows have the same number of columns
max_cols = len(header)
for i, row in enumerate(rows):
    while len(row) < max_cols:
        row.append("")
    if len(row) > max_cols:
        rows[i] = row[:max_cols]

# Write back
with open(
    "llm_release_timeline_2022-11_to_2026-04.csv", "w", newline="", encoding="utf-8"
) as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print(f"\n✅ All fixes applied. CSV written with {len(rows)} rows.")
