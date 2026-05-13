# 测试文件 vs 数据检查：区别说明

> 记录日期：2026-05-13
> 适用仓库：`Physics-Lee/Monthly_Table_of_LLM_Releasing`

---

## 一句话区分

| 工具 | 检查对象 | 检查时机 | 失败意味着什么 |
|------|---------|---------|--------------|
| `*.test.js` | **脚本代码**是否正确工作 | 修改脚本后 | 脚本有 bug，需要修复代码 |
| `check-data-links.js` | **数据内容**是否正确 | 每次修改数据后 | 数据有问题（缺失链接、孤儿链接） |

---

## 详细说明

### 1. `*.test.js` — 代码测试

**作用：** 验证脚本本身的逻辑是否正确。

**例子：**
- `upsert-entry.test.js`：确认"添加模型到已有月份"还能正常工作
- `model-utils.test.js`：确认"字符串/数组/对象格式归一化"不出错
- `add-vendor-column.test.js`：确认"插入新列到指定位置"仍然正确

**什么时候跑：**
```bash
# 改了 upsert-entry.js 的排序逻辑后
node scripts/upsert-entry.test.js
```

**失败意味着什么：**
> 你改代码时把原来的功能搞坏了。比如月份排序错了、模型去重失效了、csv 格式生成了错误的分隔符。

**特点：**
- 用临时目录跑，不碰真实 `data.json`
- 零依赖（只用 Node.js 内置 `assert`）
- 跑得快（< 1 秒）

---

### 2. `check-data-links.js` — 数据校验

**作用：** 验证 `data.json` 中的数据是否完整一致。

**检查项：**
1. **Missing links**：`data.json` 中的模型名在 `links.json` 中找不到对应 URL
2. **Orphan links**：`links.json` 中的 URL 在 `data.json` 中没有任何模型引用

**什么时候跑：**
```bash
# 每次用 upsert-entry.js / add-vendor-column.js / delete-entry.js 修改数据后
node scripts/check-data-links.js
```

**失败意味着什么：**
> 数据录入有误。比如模型名拼写不一致（`GPT-4` vs `GPT-4.0`）、URL 没配、或者删模型时漏了清理 `links.json`。

**特点：**
- 直接读真实 `data.json` 和 `links.json`
- 是数据提交前的**强制检查**
- 失败时返回 exit code 1，可用于 CI

---

## 类比

| 场景 | 对应工具 | 检查什么 |
|------|---------|---------|
| 汽车生产线 | `*.test.js` | 机器臂的动作程序是否正确 |
| 质检台 | `check-data-links.js` | 生产出来的零件是否合格 |

**两者互不替代：**
- 机器臂程序没问题（测试通过），不代表零件一定合格（还需质检）
- 零件合格（质检通过），不代表机器臂程序永远正确（改了程序要重新测）

---

## 当前仓库的测试文件

| 文件 | 对应脚本 | 是否核心 | 建议 |
|------|---------|---------|------|
| `upsert-entry.test.js` | `upsert-entry.js` | ✅ 核心 | **保留** — 最常用脚本 |
| `model-utils.test.js` | `model-utils.js` | ✅ 核心 | **保留** — 所有脚本依赖 |
| `add-vendor-column.test.js` | `add-vendor-column.js` | ⚠️ 低频 | 保留（列结构改坏代价大） |
| `add-month-row.test.js` | `add-month-row.js` | ❌ 极少用 | 可删（`upsert-entry` 已覆盖月份创建） |

---

## 推荐工作流

```bash
# 改脚本后（比如优化了排序逻辑）
node scripts/upsert-entry.test.js
node scripts/model-utils.test.js

# 改数据后（比如加了新模型）
node scripts/upsert-entry.js --month 26-May --vendor OpenAI --model "GPT-X" --url "https://..."
node scripts/check-data-links.js
```

---

*本文档应随脚本更新而更新。*
