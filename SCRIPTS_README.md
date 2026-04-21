# scripts/ 目录说明

> 说明各脚本的用途、推荐顺序和适用场景  
> 最后更新：2026-04-21

---

## 推荐顺序

### 日常单条更新

默认用下面两步：

```bash
node scripts/upsert-entry.js --month 25-May --vendor OpenAI --model "GPT-X" --url "https://example.com/gpt-x"
node scripts/check-missing-links.js
```

这是当前仓库**正式推荐**的 agent 工作流。

### 手工改源表后的重建

只有在你直接编辑 CSV 或 MD 时，才用：

```bash
node scripts/build-json.js
node scripts/check-missing-links.js
```

---

## 核心脚本

### `upsert-entry.js`

作用：

- 安全地更新一条发布记录
- 自动同步 CSV 和 MD
- 自动生成 `data.json`
- 自动生成 `links.json`
- 自动生成 `README.md`

适用场景：

- 新模型刚发布
- 补历史漏项
- 修正某个模型的链接
- 新增一个尚不存在的月份行

用法：

```bash
node scripts/upsert-entry.js --month 25-May --vendor OpenAI --model "GPT-X" --url "https://example.com/gpt-x"
```

可选参数：

```bash
node scripts/upsert-entry.js --month 25-May --vendor OpenAI --model "GPT-X" --url "https://example.com/gpt-x" --csv llm_release_timeline_2022-11_to_2026-04.csv --md llm_release_timeline_2022-11_to_2026-04.md --out .
```

行为说明：

- 月份已存在时，只更新对应厂商单元格
- 月份不存在时，按时间顺序插入新行
- 模型已存在时，不重复追加
- URL 会写入链接映射来源
- 执行后会重建全部产物

### `check-missing-links.js`

作用：

- 检查源 MD 表里是否还有纯文本模型没有超链接

适用场景：

- 每次运行 `upsert-entry.js` 或 `build-json.js` 之后

用法：

```bash
node scripts/check-missing-links.js
```

如果发现缺链：

1. 用 `upsert-entry.js` 重新补一条完整记录，或
2. 手工修 MD 后重新运行 `build-json.js` 和本检查脚本

### `build-json.js`

作用：

- 从 CSV 和 MD 重建 `data.json`
- 重建 `links.json`
- 重建 `README.md`

适用场景：

- 手工改了 CSV
- 手工改了 MD
- 做批量修复后需要整体重建

用法：

```bash
node scripts/build-json.js
```

数据流：

```text
CSV -> data.json
MD  -> links.json
data.json + links.json -> README.md
```

注意：

- 现在生成的 `data.json` 已是数组格式
- 网页端兼容字符串和数组两种单元格格式
- 但真实源数据仍然是 CSV + MD

---

## 辅助脚本

### `model-utils.js`

作用：

- 提供模型单元格归一化逻辑
- 同时服务于前端和构建脚本

核心能力：

- `normalizeModels(value)`
- `joinModels(value)`
- `flattenRowText(row, vendors)`

### `migrate-data-json-to-arrays.js`

作用：

- 把旧字符串版 `data.json` 迁移成数组版

适用场景：

- 一次性数据迁移
- 不属于日常更新流程

用法：

```bash
node scripts/migrate-data-json-to-arrays.js data.json
```

### `model-utils.test.js`

作用：

- 验证模型归一化逻辑
- 验证 `build-json.js` 会输出数组版 `data.json`

用法：

```bash
node scripts/model-utils.test.js
```

### `upsert-entry.test.js`

作用：

- 验证 `upsert-entry.js` 的两类核心行为

覆盖内容：

- 已有月份追加模型
- 缺失月份按顺序插入

用法：

```bash
node scripts/upsert-entry.test.js
```

---

## 旧脚本说明

如果你以后重新引入或补回以下脚本，它们属于“按需工具”，不是当前推荐主流程：

- `update-md-links.js`
- `fix-md-links.js`
- `fix_errors.py`

原则：

- 单条更新优先用 `upsert-entry.js`
- 只有批量修复或结构性清理时，才考虑额外脚本

---

## 典型工作流

### 工作流 1：新增一条新发布记录

```bash
node scripts/upsert-entry.js --month 25-May --vendor OpenAI --model "GPT-X" --url "https://example.com/gpt-x"
node scripts/check-missing-links.js
```

### 工作流 2：补历史漏项

```bash
node scripts/upsert-entry.js --month 24-Sep --vendor Qwen-Alibaba --model "Qwen2.5-Coder" --url "https://huggingface.co/Qwen"
node scripts/check-missing-links.js
```

### 工作流 3：手工修完源表后整体重建

```bash
node scripts/build-json.js
node scripts/check-missing-links.js
```

---

## 不推荐的做法

- 让 agent 直接手改整张 CSV
- 让 agent 直接手改整张 MD
- 只改 `data.json`
- 更新后不跑缺链检查
- 一次 prompt 让 agent 批量整理多个历史月份

---

## 一句话版本

**日常更新用 `upsert-entry.js`，整体重建用 `build-json.js`，每次都跑 `check-missing-links.js`。**
