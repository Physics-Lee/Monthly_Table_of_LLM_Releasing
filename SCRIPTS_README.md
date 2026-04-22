# scripts/ 目录说明

> 说明当前脚本的真实职责、推荐顺序和使用场景
> 最后更新：2026-04-22

---

## 当前真源

**当前仓库唯一真源是 `data.json`。**

也就是说：

- `data.json`：手工源 / 脚本源
- `csv`：导出产物
- `md`：导出产物
- `links.json`：导出产物

当前主数据流：

```text
data.json -> csv
data.json -> md
data.json -> links.json
```

---

## 推荐顺序

### 日常单条更新

```bash
node scripts/upsert-entry.js --month 25-May --vendor OpenAI --model "GPT-X" --url "https://example.com/gpt-x"
node scripts/check-data-links.js
```

### 新增列

```bash
node scripts/add-vendor-column.js --vendor "Liquid AI" --after AI21
node scripts/check-data-links.js
```

### 手工改完 `data.json` 后整体重建

```bash
node scripts/build-json.js
node scripts/check-data-links.js
```

---

## 核心脚本

### `upsert-entry.js`

作用：

- 安全更新一条模型记录
- 直接修改 `data.json`
- 自动重建 `csv`、`md`、`links.json`

适用场景：

- 新模型发布
- 补历史漏项
- 修正某个模型的 URL
- 新增一个尚不存在的月份

用法：

```bash
node scripts/upsert-entry.js --month 25-May --vendor OpenAI --model "GPT-X" --url "https://example.com/gpt-x"
```

可选参数：

```bash
node scripts/upsert-entry.js --month 25-May --vendor OpenAI --model "GPT-X" --url "https://example.com/gpt-x" --data data.json --csv llm_release_timeline_2022-11_to_2026-04.csv --md llm_release_timeline_2022-11_to_2026-04.md --links links.json
```

行为说明：

- 月份已存在时，只更新该月份的目标列
- 月份不存在时，按时间顺序插入新行
- 模型已存在时，不重复追加，只刷新 URL
- vendor 必须已经存在，否则会报 `Unknown vendor column`

### `add-vendor-column.js`

作用：

- 新增一整列 vendor/category
- 直接修改 `data.json`
- 自动给所有月份补空数组
- 自动重建 `csv`、`md`、`links.json`

适用场景：

- 新增一个新的厂商列
- 新增一个新的分类列
- 调整列插入位置

用法：

```bash
node scripts/add-vendor-column.js --vendor "Liquid AI" --after AI21
```

或：

```bash
node scripts/add-vendor-column.js --vendor "Voyage" --before LLM-Applications
```

可选参数：

```bash
node scripts/add-vendor-column.js --vendor "Liquid AI" --after AI21 --data data.json --csv llm_release_timeline_2022-11_to_2026-04.csv --md llm_release_timeline_2022-11_to_2026-04.md --links links.json
```

行为说明：

- `--after` 和 `--before` 二选一
- 如果列已存在，则不重复创建
- 如果不给位置参数，默认插到最后

### `build-json.js`

作用：

- 从 `data.json` 重建 `csv`
- 从 `data.json` 重建 `md`
- 从 `data.json` 重建 `links.json`

适用场景：

- 你手工改了 `data.json`
- 你想强制重跑产物
- 你想确认导出结果和真源一致

用法：

```bash
node scripts/build-json.js
```

可选参数：

```bash
node scripts/build-json.js data.json llm_release_timeline_2022-11_to_2026-04.csv llm_release_timeline_2022-11_to_2026-04.md links.json
```

### `check-data-links.js`

作用：

- 检查 `data.json` 中所有模型是否都能在 `links.json` 找到对应 URL
- 检查 `links.json` 是否存在孤儿链接

适用场景：

- 每次运行 `upsert-entry.js` 后
- 每次运行 `add-vendor-column.js` 后
- 每次运行 `build-json.js` 后

用法：

```bash
node scripts/check-data-links.js
```

这是当前仓库默认的一致性检查脚本。

---

## 辅助脚本

### `check-missing-links.js`

作用：

- 检查导出的 MD 里是否还有纯文本模型名没有链接

说明：

- 它现在不是主检查脚本
- 因为 MD 已经不是主数据源
- 只有你在排查导出表格文本问题时才需要它

### `model-utils.js`

作用：

- 提供模型对象归一化逻辑
- 供前端和构建脚本共用

### `migrate-data-json-to-arrays.js`

作用：

- 旧迁移脚本
- 用于把更早期格式迁移成数组/对象数组

现在不是日常工作流的一部分。

---

## 测试脚本

### `model-utils.test.js`

验证：

- 模型归一化逻辑
- `build-json.js` 的核心输出行为

用法：

```bash
node scripts/model-utils.test.js
```

### `upsert-entry.test.js`

验证：

- 已有月份追加模型
- 缺失月份插入新行

用法：

```bash
node scripts/upsert-entry.test.js
```

### `add-vendor-column.test.js`

验证：

- 新列是否按指定位置插入
- 所有月份是否自动补空数组
- 重复新增时是否安全 no-op

用法：

```bash
node scripts/add-vendor-column.test.js
```

---

## 典型工作流

### 工作流 1：新增一条模型

```bash
node scripts/upsert-entry.js --month 25-May --vendor OpenAI --model "GPT-X" --url "https://example.com/gpt-x"
node scripts/check-data-links.js
```

### 工作流 2：补历史漏项

```bash
node scripts/upsert-entry.js --month 24-Sep --vendor Qwen-Alibaba --model "Qwen2.5-Coder" --url "https://huggingface.co/Qwen"
node scripts/check-data-links.js
```

### 工作流 3：新增一列

```bash
node scripts/add-vendor-column.js --vendor "Liquid AI" --after AI21
node scripts/check-data-links.js
```

### 工作流 4：手工改完真源后重建

```bash
node scripts/build-json.js
node scripts/check-data-links.js
```

---

## 不推荐的做法

- 让 agent 直接手改整张 CSV
- 让 agent 直接手改整张 MD
- 手工编辑 `links.json`
- 多个 `upsert-entry.js` 并行写同一个 `data.json`

最后这一点很重要：

**写同一个 `data.json` 的脚本必须顺序执行，不能并发执行。**

---

## 一句话版本

**日常更新用 `upsert-entry.js`，新增列用 `add-vendor-column.js`，整体重建用 `build-json.js`，每次都跑 `check-data-links.js`。**
