# AGENT 数据更新指南

> 本文件放在根目录，确保每次 Agent 更新数据时都能看到  
> 最后更新：2026-04-21

---

## 核心原则（更新前必读）

**CSV 是唯一数据源，MD 只用于链接**

```
⚠️ 重要：build-json.js 的数据流
CSV（主数据源） → data.json 的数据结构
MD（链接来源）  → links.json 的 URL 映射
```

- [ ] 我正在编辑的是 `.csv` 文件（**唯一数据源**）
- [ ] 我正在编辑的是 `.md` 文件（**为每个模型添加链接**）
- [ ] 我知道运行 `node scripts/build-json.js` 会验证格式
- [ ] 如果构建报错"字段数不匹配"，我必须修复格式错误
- [ ] 构建成功后才会生成 `data.json` + `links.json` + `README.md`

---

## 正确更新方式

### 第一步：编辑 CSV（必须）

```
llm_release_timeline_2022-11_to_2026-04.csv
```

**格式规则：**
- 所有行的逗号数量必须与表头一致
- 多个模型用 ` + ` 分隔（注意空格）
- 如果单元格内容包含逗号，用双引号包裹：`"a,b,c"`
- 空单元格直接留空（两个逗号之间什么都不写）

**正误示例：**

```csv
# 表头（假设有 35 个逗号 = 36 列）
Month,Open-Source,OpenAI,Anthropic,...,新厂商

# ✅ 正确：逗号数量与表头一致
25-Apr,,GPT-4.1 + GPT-4.1 mini,,Gemini 2.5 Flash,,,...,

# ❌ 错误：逗号数量不对（会触发构建失败）
25-Apr,,GPT-4.1 + GPT-4.1 mini,Gemini 2.5 Flash,,,...,
```

### 第二步：编辑 MD（必须，添加链接）

```
llm_release_timeline_2022-11_to_2026-04.md
```

**每个模型都必须有链接。** MD 是链接的唯一来源。

**格式：**
```markdown
| Month | Open-Source | OpenAI | ... |
|-------|-------------|--------|-----|
| 25-Apr | OpenCode | [GPT-4.1](https://openai.com/gpt-4-1) | ... |
```

**规则：**
- 每个模型名用 `[模型名](URL)` 格式
- 多个模型用 ` + ` 分隔：`[模型A](URL) + [模型B](URL)`
- 如果 MD 中没有链接，`build-json.js` 会尝试自动推断，但**覆盖不全**
- 如果 MD 和 CSV 的数据冲突，**以 CSV 为准**（但链接以 MD 为准）

**注意：**
- MD 表格的数据不会被用于生成 `data.json`
- MD 只被提取 `[模型名](URL)` 格式的链接

### 第三步：构建和验证

```bash
node scripts/build-json.js
```

**构建脚本做什么：**
1. 读取 CSV → 生成 `data.json`（数据结构）
2. 读取 MD → 提取链接 → 生成 `links.json`（URL 映射）
3. 结合 data.json + links.json → 生成 `README.md`（GitHub 页面显示的表格）

**构建成功输出：**
```
📦 LLM Timeline 数据构建
  CSV:  llm_release_timeline_2022-11_to_2026-04.csv
  MD:   llm_release_timeline_2022-11_to_2026-04.md
  OUT:  ./

✓ CSV 解析完成: 43 行, 36 列
✓ MD 解析完成: 43 表格行, 315 个链接
✓ 已写入: data.json
✓ 已写入: links.json
✓ 已写入: README.md

✅ 完成！
   data.json:  43 行 × 36 列
   links.json: 315 条映射
   README.md:  已生成
```

**构建失败输出（必须修复）：**
```
❌ 第 31 行字段数不匹配: 期望 36 列, 实际 35 列
   内容: 25-Apr,OpenCode,GPT-4.1 + GPT-4.1 mini,Gemini 2.5 Flash,...
Error: CSV 格式错误: 第 31 行字段数不匹配，请检查逗号数量或引号配对
```

### 第四步：检查缺失链接（必须）

```bash
node scripts/check-missing-links.js
```

输出示例：
```
Found 5 models without hyperlinks:

25-Apr:
  [OpenAI] GPT-5 - 🔍 inferable
      -> https://openai.com/blog/gpt-5
  [Google] Gemini 3 - ❌ no URL

Summary: 5 plain-text models found
With URL in links.json: 2
Inferable URL: 1
No URL found: 2
```

**如果输出显示有模型缺少链接，必须修复：**
1. 在 MD 中添加 `[模型名](URL)`
2. 重新运行 `node scripts/build-json.js`
3. 再次运行 `node scripts/check-missing-links.js` 确认无遗漏

**不允许提交有缺失链接的数据。**

---

## 新增公司/列

如果要添加新厂商列：

1. **在 CSV 表头添加新列名**（加一个逗号 + 列名）
2. **在所有数据行末尾添加一个逗号**（对应新列，即使留空）
3. 重新运行 `node scripts/build-json.js` 验证

---

## 新增月份/行

如果要添加新月份：

1. 在 CSV 末尾添加新行
2. 第一列是月份（如 `25-Jun`）
3. **确保逗号数量与表头一致**
4. 重新运行构建验证

---

## 常见问题

**Q: 构建脚本报错"字段数不匹配"怎么办？**

A: 这是 CSV 格式错误。检查报错的行：
1. 查看报错信息：期望 X 列, 实际 Y 列
2. 数逗号数量，确保与表头一致
3. 检查是否有单元格内容包含未转义的逗号
4. 修复后重新运行构建

**Q: 为什么只改 MD 不行？**

A: `build-json.js` 的数据结构完全来自 CSV。MD 只被用于提取链接。如果只改 MD 不改 CSV，模型的名称、位置都不会更新。

**Q: 怎么知道当前有多少列？**

A: 查看构建成功的输出：`✓ CSV 解析完成: 43 行, 36 列` —— 这里的 36 就是当前列数。

**Q: 新增厂商后怎么验证成功了？**

A: 
1. 构建成功（看到 ✅ 完成！）
2. 检查生成的 `README.md`，确认新厂商列出现
3. 检查网站是否正常显示

**Q: 只想改一个链接，不动其他内容？**

A: 可以直接编辑 MD 文件修改 URL，然后运行构建脚本。但注意：如果该模型在 CSV 中不存在，链接不会生效。

**Q: 为什么 MD 是必须的？**

A: `build-json.js` 的 `inferURL()` 只有约 100 条硬编码规则，只能覆盖常见模型。新厂商、新型号、中文模型名很可能匹配不上。如果要求每个 LLM 都有链接，必须在 MD 中手动指定 `[模型名](URL)`。

---

## 完整更新流程

```
编辑 llm_release_timeline_2022-11_to_2026-04.csv（必须，唯一数据源）
    ↓
编辑 llm_release_timeline_2022-11_to_2026-04.md（必须，为每个模型添加链接）
    ↓
node scripts/build-json.js
    ↓
如果报错：修复 CSV 格式错误（字段数不匹配）
    ↓
构建成功（看到 ✅ 完成！）
    ↓
node scripts/check-missing-links.js（必须：检查是否有模型缺链接）
    ↓
如果发现有缺链接：补充 MD 中的链接，重新构建，再次检查
    ↓
确认所有模型都有链接（check-missing-links.js 输出 0 missing）
    ↓
git add .
git commit -m "YYYY-MM-DD: 添加 XX 厂商 / 更新 XX 模型"
git push
    ↓
GitHub Actions 自动生成 → GitHub Pages 自动部署（2-5 分钟）
```

---

## 紧急联系

如果构建持续失败，检查：
1. `note/data_update_workflow.md` — 详细的数据更新流程
2. `note/20260421-1028_cleanup_notes.md` — 清理笔记

---

*本指南确保 Agent 更新数据时不会破坏表格结构。*
