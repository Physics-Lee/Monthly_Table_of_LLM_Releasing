# AGENT 数据更新指南

> 放在仓库根目录，供 AI agent 和维护者统一使用  
> 最后更新：2026-04-21

---

## 核心结论

**以后 agent 默认不要手工编辑整张 CSV 或整张 MD 表。**

标准工作流是：

1. 用 `node scripts/upsert-entry.js` 更新一条发布记录
2. 让脚本自动同步源 CSV、源 MD、`data.json`、`links.json`、`README.md`
3. 再运行 `node scripts/check-missing-links.js` 做缺链检查

只有在以下场景下，才建议直接编辑源表：

- 新增厂商列
- 批量大修历史数据
- 修复脚本本身无法表达的结构性问题

---

## 当前数据流

```text
upsert-entry.js
  ├─ 更新 CSV（数据源）
  ├─ 更新 MD（链接源）
  ├─ 重新生成 data.json
  ├─ 重新生成 links.json
  └─ 重新生成 README.md
```

补充说明：

- CSV 仍然是数据源
- MD 仍然是链接源
- `data.json`、`links.json`、`README.md` 是构建产物
- `data.json` 现在已经是数组格式，网页端可直接读取

---

## 推荐工作流

### 场景 1：新增一个刚发布的模型

用法：

```bash
node scripts/upsert-entry.js --month 25-May --vendor OpenAI --model "GPT-X" --url "https://example.com/gpt-x"
node scripts/check-missing-links.js
```

效果：

- 如果 `25-May` 已存在，就只改这一行的 `OpenAI` 单元格
- 如果模型不在该单元格里，就追加进去
- 如果该模型已有链接，会被更新为新 URL
- 自动重建所有产物

### 场景 2：补一个历史漏项

用法：

```bash
node scripts/upsert-entry.js --month 24-Sep --vendor Qwen-Alibaba --model "Qwen2.5-Coder" --url "https://huggingface.co/Qwen"
node scripts/check-missing-links.js
```

效果：

- 只补一条历史记录
- 不需要人工数逗号，也不需要改整张表

### 场景 3：新增一个月份，但这个月目前仓库里还没有行

用法：

```bash
node scripts/upsert-entry.js --month 26-May --vendor Google --model "Gemini 4" --url "https://example.com/gemini-4"
node scripts/check-missing-links.js
```

效果：

- 脚本会按时间顺序插入新月份
- 不需要手工在 CSV 和 MD 里同时插行

---

## agent 操作规范

### 默认规范

让 agent 按下面的规则执行：

- 一次只处理一条发布记录
- 默认调用 `scripts/upsert-entry.js`
- 不要手工重写整张 CSV
- 不要手工重写整张 MD
- 更新后必须运行：
  - `node scripts/check-missing-links.js`

### 推荐 prompt 模板

```text
请不要手工编辑整张 CSV 或 MD。

请调用：
node scripts/upsert-entry.js --month 25-May --vendor OpenAI --model "GPT-X" --url "https://example.com/gpt-x"

然后运行：
node scripts/check-missing-links.js

最后告诉我：
1. 是否新建了月份行
2. 是否追加了模型
3. 缺链检查结果
```

---

## 什么时候不要用 upsert-entry.js

以下情况不适合直接用这个脚本：

- 你要新增一个全新的厂商列
- 你要调整列顺序
- 你要批量重排很多历史月份
- 你要做大规模链接修复
- CSV 或 MD 源文件已经结构性损坏

这几种情况应该先人工确认方案，再决定是否直接编辑源文件或补新脚本。

---

## 手工编辑的最低要求

如果确实必须手工改源文件：

1. 先改 CSV
2. 再改 MD
3. 运行：

```bash
node scripts/build-json.js
node scripts/check-missing-links.js
```

4. 只有在两步都通过后，才允许提交

---

## 常见问题

**Q: 我只想补一条模型，还要不要改 CSV 和 MD？**

A: 不要手工改。直接用：

```bash
node scripts/upsert-entry.js --month ... --vendor ... --model "..." --url "..."
```

脚本会替你同时更新两边。

**Q: 我只想改链接，不想动别的内容怎么办？**

A: 仍然优先用 `upsert-entry.js`，传同样的 `month`、`vendor`、`model`，但把 `url` 改成新的链接。脚本会刷新 MD 和构建产物。

**Q: 构建失败显示字段数不匹配怎么办？**

A: 这是 CSV 结构错误。优先检查最近是否有人手工改了 CSV；如果是脚本更新后报错，再回查脚本输入参数是否写错厂商或月份。

**Q: 为什么不直接让 agent 改 data.json？**

A: 因为当前仓库的真实生成链路仍然以 CSV 和 MD 为源。直接改 `data.json` 会在下一次构建时被覆盖。

---

## 提交前检查

- `upsert-entry.js` 已执行
- `check-missing-links.js` 已执行
- 没有顺手修改无关月份或无关厂商
- 没有手工重写整张表
- 新模型在 `README.md` 和网页数据里都可见

---

## 一句话版本

**单条更新一律走 `node scripts/upsert-entry.js`。只有结构性修改，才直接动 CSV/MD。**
