# Scripts 目录说明

> 本文档说明 `scripts/` 目录下各脚本的功能和使用场景
> 最后更新：2026-04-21

---

## 核心脚本（每次更新必用）

### `build-json.js` — 数据构建脚本（必须）

**作用**：从 CSV + MD 生成所有输出文件

**数据流**：
```
CSV（主数据源） ──→ data.json（网页用的结构化数据）
MD（链接来源）  ──→ links.json（模型名→URL 映射）
                  └──→ README.md（带链接的表格）
```

**用法**：
```bash
node scripts/build-json.js
```

**成功输出**：
```
📦 LLM Timeline 数据构建
  CSV:  llm_release_timeline_2022-11_to_2026-04.csv
  MD:   llm_release_timeline_2022-11_to_2026-04.md
  OUT:  ./

✓ CSV 解析完成: 43 行, 36 列
✓ MD 解析完成: 43 表格行, 331 个链接
✓ 已写入: data.json
✓ 已写入: links.json
✓ 已写入: README.md

✅ 完成！
   data.json:  43 行 × 35 列
   links.json: 420 条映射
   README.md:  已生成
```

**失败处理**：
- 如果报错 "字段数不匹配"，检查 CSV 对应行的逗号数量
- 修复后重新运行

---

## 辅助脚本（按需使用）

### `check-missing-links.js` — 链接检查器（必须）

**作用**：检查哪些模型没有超链接

**使用场景**：
- 每次构建后**必须运行**，确保所有模型都有链接
- 不允许提交有缺失链接的数据

**用法**：
```bash
node scripts/check-missing-links.js
```

**输出示例**：
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

**发现缺失后**：
1. 在 `build-json.js` 的 `inferURL()` 函数中添加规则
2. 重新运行 `node scripts/build-json.js`

---

### `update-md-links.js` — 链接自动补全器

**作用**：根据 `links.json` 自动给 MD 中的纯文本模型名加上链接

**使用场景**：
- MD 中有大量模型名没有链接格式
- 批量将 `Model Name` 转换为 `[Model Name](URL)`

**用法**：
```bash
node scripts/update-md-links.js
```

**注意**：
- 只修改 MD 文件
- 不会改变 CSV 中的数据
- 保留已有的链接不变

---

### `fix-md-links.js` — 批量链接替换器

**作用**：一次性替换 MD 中的错误链接

**使用场景**：
- 某厂商的链接批量错误（如都指向了首页）
- 需要一次性替换多个模型的 URL

**用法**：
```bash
node scripts/fix-md-links.js
```

**工作原理**：
- 内置 80+ 条替换规则
- 直接字符串替换
- 只改 MD，不改 CSV

---

### `fix_errors.py` — 批量错误修复（一次性）

**作用**：批量修正 CSV 中的列位置错误和日期错误

**状态**：已执行完毕，保留作参考

**修复过的错误**：
- 模型放错列（如 Grok 在 DeepSeek 列）
- 日期错误（如 AWS Bedrock GA 日期）
- 重复条目

---

## 标准更新流程

```
编辑 llm_release_timeline_2022-11_to_2026-04.csv（必须，唯一数据源）
    ↓
编辑 llm_release_timeline_2022-11_to_2026-04.md（必须，为每个模型添加链接）
    ↓
node scripts/build-json.js（必须）
    ↓
如果报错：修复 CSV/MD 格式错误
    ↓
构建成功（看到 ✅ 完成！）
    ↓
node scripts/check-missing-links.js（必须）
    ↓
如果发现有缺链接：补充 MD 中的链接，重新构建，再次检查
    ↓
确认所有模型都有链接（check-missing-links.js 输出 0 missing）
    ↓
git add -A
git commit -m "feat/fix: 描述"
git push
    ↓
GitHub Actions 自动部署 → GitHub Pages（2-5分钟）
```

---

## 常见问题

**Q: 我只改了一个链接，需要跑哪个脚本？**

A: 直接修改 MD 文件中的链接，然后运行 `node scripts/build-json.js` 和 `node scripts/check-missing-links.js`。

**Q: 构建报错了怎么办？**

A: 查看报错信息中的行号，检查 CSV 对应行的逗号数量是否与表头一致（36列）。

**Q: 为什么只改 MD 不行？**

A: `build-json.js` 的数据结构完全来自 CSV。MD 只被用于提取链接。如果只改 MD 不改 CSV，模型的名称、位置都不会更新。

**Q: 为什么 MD 是必须的？**

A: `build-json.js` 的 `inferURL()` 只有约 100 条硬编码规则，只能覆盖常见模型。新厂商、新型号、中文模型名很可能匹配不上。如果要求每个 LLM 都有链接，必须在 MD 中手动指定 `[模型名](URL)`。

**Q: 可以跳过 check-missing-links.js 吗？**

A: **不可以。** 指南要求所有模型都必须有链接。跳过此步骤可能导致提交的表格中有模型无法点击。

---

*详见 `AGENT_UPDATE_GUIDE.md` 获取更详细的更新指南。*
