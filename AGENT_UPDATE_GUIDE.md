# AGENT 数据更新指南

> 放在仓库根目录，供 AI agent 和维护者统一使用
> 最后更新：2026-04-22

---

## 核心结论

**现在这个仓库的唯一真源是 `data.json`。**

以后默认不要手工编辑整张 CSV 或整张 MD 表，也不要手工编辑 `links.json`。

标准工作流是：

1. 用 `node scripts/upsert-entry.js` 更新单条记录
2. 如需新增整列，用 `node scripts/add-vendor-column.js`
3. 让脚本自动重建 `csv`、`md`、`links.json`
4. 运行 `node scripts/check-data-links.js` 做一致性检查

---

## 当前数据流

```text
data.json
  ├─ upsert-entry.js         -> 更新单条模型记录
  ├─ add-vendor-column.js    -> 新增一整列 vendor/category
  └─ build-json.js           -> 生成 csv / md / links.json
```

补充说明：

- `data.json`：唯一真源
- `llm_release_timeline_2022-11_to_2026-04.csv`：导出产物
- `llm_release_timeline_2022-11_to_2026-04.md`：导出产物
- `links.json`：导出产物，用于兼容和校验

---

## 推荐工作流

### 场景 1：新增一个新发布模型

```bash
node scripts/upsert-entry.js --month 25-May --vendor OpenAI --model "GPT-X" --url "https://example.com/gpt-x"
node scripts/check-data-links.js
```

效果：

- 如果月份已存在，只更新对应单元格
- 如果月份不存在，会自动按时间顺序插入新行
- 如果模型已存在，则只更新 URL
- 自动重建全部产物

### 场景 2：补一个历史漏项

```bash
node scripts/upsert-entry.js --month 24-Sep --vendor Qwen-Alibaba --model "Qwen2.5-Coder" --url "https://huggingface.co/Qwen"
node scripts/check-data-links.js
```

### 场景 3：新增一整列

```bash
node scripts/add-vendor-column.js --vendor "Liquid AI" --after AI21
node scripts/check-data-links.js
```

也支持：

```bash
node scripts/add-vendor-column.js --vendor "Voyage" --before LLM-Applications
```

效果：

- 在 `vendors` 中插入新列
- 给每个月自动补 `[]`
- 自动重建全部产物

---

## Agent 操作规范

默认规则：

- 一次只处理一个明确任务
- 单条更新默认调用 `scripts/upsert-entry.js`
- 新增列默认调用 `scripts/add-vendor-column.js`
- 不要手工重写整张 CSV
- 不要手工重写整张 MD
- 不要手工编辑 `links.json`
- 修改后必须运行：
  - `node scripts/check-data-links.js`

### 推荐 prompt 模板：单条更新

```text
请不要手工编辑整张 CSV、MD 或 links.json。
请调用：
node scripts/upsert-entry.js --month 25-May --vendor OpenAI --model "GPT-X" --url "https://example.com/gpt-x"

然后运行：
node scripts/check-data-links.js

最后告诉我：
1. 是否新建了月份行
2. 是否追加了模型或更新了 URL
3. 一致性检查结果
```

### 推荐 prompt 模板：新增列

```text
请不要手工编辑整份 data.json。
请调用：
node scripts/add-vendor-column.js --vendor "Liquid AI" --after AI21

然后运行：
node scripts/check-data-links.js

最后告诉我：
1. 新列插入到了哪里
2. 是否成功重建 csv / md / links.json
3. 一致性检查结果
```

---

## 什么时候不用 upsert-entry.js

以下情况不适合直接用 `upsert-entry.js`：

- 你要新增整列
- 你要调整列顺序
- 你要批量重排很多历史月份
- 你要大规模批量改名
- `data.json` 本身结构损坏

对应建议：

- 新增列或改列顺序：用 `add-vendor-column.js`
- 纯构建重跑：用 `build-json.js`
- 大规模结构变动：先确认方案，再动源文件

---

## 手工编辑的最低要求

如果确实必须手工改 [data.json](D:/Repositories/Monthly_Table_of_LLM_Releasing/data.json)：

1. 改完后运行：

```bash
node scripts/build-json.js
node scripts/check-data-links.js
```

2. 只有两步都通过，才允许提交

不推荐直接手工改：

- [llm_release_timeline_2022-11_to_2026-04.csv](D:/Repositories/Monthly_Table_of_LLM_Releasing/llm_release_timeline_2022-11_to_2026-04.csv)
- [llm_release_timeline_2022-11_to_2026-04.md](D:/Repositories/Monthly_Table_of_LLM_Releasing/llm_release_timeline_2022-11_to_2026-04.md)
- [links.json](D:/Repositories/Monthly_Table_of_LLM_Releasing/links.json)

---

## 常见问题

**Q: 还需要手工改 `links.json` 吗？**

A: 不需要。它现在是构建产物，不是人工维护源。

**Q: 还需要手工改 CSV 和 MD 吗？**

A: 日常更新不需要。它们由 `build-json.js` 从 `data.json` 导出。

**Q: 为什么 `check-missing-links.js` 不是主检查了？**

A: 因为现在 MD 是导出产物，不再是主源。主检查应该看 `data.json` 和 `links.json` 是否一致，所以默认跑 `check-data-links.js`。

**Q: 如果我要新增一列怎么办？**

A: 用：

```bash
node scripts/add-vendor-column.js --vendor "New Vendor" --after AI21
```

或：

```bash
node scripts/add-vendor-column.js --vendor "New Vendor" --before LLM-Applications
```

---

## 提交前检查

- `upsert-entry.js` 或 `add-vendor-column.js` 已执行
- `check-data-links.js` 已执行
- 没有顺手修改无关月份或无关列
- 没有手工重写整张表
- `data.json`、CSV、MD 三者已经同步

---

## 一句话版本

**单条更新走 `upsert-entry.js`，新增列走 `add-vendor-column.js`，重建走 `build-json.js`，检查一律跑 `check-data-links.js`。**
