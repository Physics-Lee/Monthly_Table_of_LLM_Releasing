# data.json 数组化改造方案

> 日期：2026-04-21
> 目标：将 `data.json` 从“字符串单元格”升级为“数组单元格”，同时保证网页端、README 生成和 CSV/MD 导出持续可用。

---

## 背景

当前仓库的主要问题不是网页渲染本身，而是数据编辑入口过于脆弱：

- `llm_release_timeline_2022-11_to_2026-04.csv` 容易因为逗号数量出错
- `llm_release_timeline_2022-11_to_2026-04.md` 容易因为整行表格编辑造成列错位
- `data.json` 虽然已经比 CSV/MD 更适合 agent 编辑，但每个单元格仍然是 `"A + B + C"` 这样的字符串

这意味着：

- 虽然避免了 CSV 的列数问题
- 但仍然保留了字符串拆分的不稳定性
- 页面、构建脚本、检查脚本都隐含依赖 `" + "` 这个约定

---

## 目标格式

### 当前格式

```json
{
  "vendors": ["OpenAI", "Google"],
  "rows": [
    {
      "Month": "25-Apr",
      "OpenAI": "GPT-4.1 + GPT-4.1 mini + o3",
      "Google": "Gemini 2.5 Flash"
    }
  ]
}
```

### 目标格式

```json
{
  "vendors": ["OpenAI", "Google"],
  "rows": [
    {
      "Month": "25-Apr",
      "OpenAI": ["GPT-4.1", "GPT-4.1 mini", "o3"],
      "Google": ["Gemini 2.5 Flash"]
    }
  ]
}
```

本次只做“数组字符串版”，不把 URL 合并进 `data.json`。

原因：

- 改动最小
- 可直接复用现有 `links.json`
- 先解决编辑稳定性，再考虑更深层的数据归一化

---

## 非目标

本次不做以下事情：

- 不修改网页视觉样式
- 不重构 `links.json` 的结构
- 不把 `data.json` 升级成 `{ name, url }` 对象数组
- 不引入数据库或新的外部依赖
- 不一次性重写整个更新工作流

---

## 现状分析

### 1. 网页端现状

[app.js](D:/Repositories/Monthly_Table_of_LLM_Releasing/app.js) 当前在 `formatCell()` 中直接执行：

```js
const models = text.split(' + ').map(s => s.trim()).filter(Boolean);
```

这说明页面现在默认假设每个单元格是字符串。如果直接把 `data.json` 改成数组而不改前端，网页会报错或显示异常。

### 2. 构建端现状

[scripts/build-json.js](D:/Repositories/Monthly_Table_of_LLM_Releasing/scripts/build-json.js) 当前：

- 从 CSV 读取每个单元格的原始字符串
- 写入 `data.json`
- 用 `formatCell()` 再把字符串拆开后去 `links.json` 里找 URL
- 生成 `README.md`

所以构建链路本身也默认值是字符串。

### 3. 风险总结

如果直接切换 `data.json` 格式，会有三个风险：

1. 网页端读取失败
2. README 生成逻辑失效
3. 检查脚本仍按字符串逻辑运行，结果失真

因此必须采用“先兼容，再迁移”的顺序。

---

## 推荐方案

采用两阶段迁移。

### 阶段 1：代码先兼容字符串和数组

先修改读取逻辑，不修改现有 `data.json` 结构。

需要改动的文件：

- [app.js](D:/Repositories/Monthly_Table_of_LLM_Releasing/app.js)
- [scripts/build-json.js](D:/Repositories/Monthly_Table_of_LLM_Releasing/scripts/build-json.js)
- [scripts/check-missing-links.js](D:/Repositories/Monthly_Table_of_LLM_Releasing/scripts/check-missing-links.js)

核心是统一增加一个归一化函数：

```js
function normalizeModels(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(v => String(v).trim()).filter(Boolean);
  }
  return String(value)
    .split('+')
    .map(v => v.trim())
    .filter(Boolean);
}
```

效果：

- 旧字符串数据继续可读
- 新数组数据也能直接使用
- 页面和脚本先具备“双格式兼容能力”

### 阶段 2：把 `data.json` 正式迁移成数组版

当阶段 1 已验证通过后，再让构建脚本真正输出数组结构。

迁移后：

- `data.json` 成为 agent 推荐编辑入口
- CSV/MD 只作为导出产物
- 页面与检查脚本已经兼容，不会因为数据格式切换而出问题

---

## 详细改动点

### A. 前端改动

文件：
[app.js](D:/Repositories/Monthly_Table_of_LLM_Releasing/app.js)

改动内容：

1. 增加 `normalizeModels(value)`
2. `formatCell()` 不再假设参数一定是字符串
3. 搜索逻辑里把数组拍平成文本再搜索
4. 保持页面最终显示效果不变，仍以多个 badge/link 的方式渲染

建议实现方式：

```js
function normalizeModels(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
  return String(value).split('+').map(v => v.trim()).filter(Boolean);
}
```

```js
function formatCell(value) {
  const models = normalizeModels(value);
  if (models.length === 0) return '';

  return models.map(model => {
    const url = findUrl(model);
    if (url) {
      return `<a href="${url}" target="_blank" class="model-link">${model}</a>`;
    }
    return `<span class="model-item-text">${model}</span>`;
  }).map(html => `<span class="model-item">${html}</span>`).join('');
}
```

搜索部分建议改为：

```js
const rowText = allData.vendors
  .flatMap(v => normalizeModels(row[v]))
  .join(' ')
  .toLowerCase();
```

这样无论 `row[v]` 是字符串还是数组，搜索都正常。

### B. 构建脚本改动

文件：
[scripts/build-json.js](D:/Repositories/Monthly_Table_of_LLM_Releasing/scripts/build-json.js)

改动内容：

1. 增加 `normalizeModels(value)`
2. `buildDataJSON()` 输出数组而不是原始字符串
3. `generateReadme()` 在输出 README 时把数组重新 `join(' + ')`
4. 未来如需导出 CSV/MD，也复用同一个格式化函数

建议新增两个辅助函数：

```js
function normalizeModels(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
  return String(value).split('+').map(v => v.trim()).filter(Boolean);
}

function joinModels(value) {
  return normalizeModels(value).join(' + ');
}
```

然后：

- `data.json` 用 `normalizeModels()`
- README/CSV/MD 用 `joinModels()`

这样“数据表示”和“展示表示”会正式分离。

### C. 链接检查脚本改动

文件：
[scripts/check-missing-links.js](D:/Repositories/Monthly_Table_of_LLM_Releasing/scripts/check-missing-links.js)

当前脚本主要检查 MD 是否还有未加链接的纯文本模型名。它不直接读取 `data.json`，所以不会被数组化直接击穿。

但建议顺手做两件事：

1. 增加一个新的检查路径，允许未来直接校验 `data.json` 中的所有模型是否都能在 `links.json` 中找到
2. 将“模型拆分逻辑”统一成共享实现，避免一处用 `' + '`，另一处又写成别的规则

如果不想扩大范围，本次至少要在文档里明确：

- 现有 `check-missing-links.js` 继续作为 MD 链接检查器
- 不承担 `data.json` 结构迁移的正确性验证

### D. 数据迁移脚本

建议新增一个一次性脚本，例如：

- `scripts/migrate-data-json-to-arrays.js`

职责：

- 读取现有 `data.json`
- 将所有厂商列从字符串转成数组
- 保留 `Month`
- 覆盖写回 `data.json`

该脚本只需要运行一次或少量几次，不必进入长期工作流。

---

## 迁移顺序

推荐严格按下面顺序执行：

1. 修改前端，兼容字符串和数组
2. 修改构建脚本，兼容字符串和数组
3. 本地用旧 `data.json` 验证网页仍正常显示
4. 修改构建脚本输出，让新生成的 `data.json` 为数组版
5. 运行迁移脚本或重新构建生成新的 `data.json`
6. 再次验证网页、README、CSV/MD 导出、链接检查
7. 最后更新说明文档，宣布 CSV/MD 不再是推荐编辑入口

这个顺序的目的只有一个：

在任何中间状态下，网页都不应该因为格式切换而挂掉。

---

## 验证清单

每一步改动后都要验证：

- 网页首页能正常加载
- 表格中模型仍然能正确显示
- 有链接的模型仍能跳转
- 无链接模型仍按纯文本显示
- 搜索功能仍能搜到数组里的模型名
- 厂商筛选、年份筛选、排序不受影响
- `README.md` 生成内容不变或仅结构等价
- 导出的 CSV/MD 格式不回退、不破坏现有流程

最关键的回归点：

- [app.js](D:/Repositories/Monthly_Table_of_LLM_Releasing/app.js) 页面渲染
- [scripts/build-json.js](D:/Repositories/Monthly_Table_of_LLM_Releasing/scripts/build-json.js) 构建输出

---

## 成功标准

满足以下条件即算改造成功：

1. `data.json` 中各厂商单元格改为数组
2. 网页端显示与当前视觉效果一致
3. `links.json` 无需改结构即可继续工作
4. `README.md` 仍能生成带链接的表格
5. 以后 agent 可以只编辑 JSON，不再直接编辑 CSV/MD

---

## 后续可选升级

如果本次数组化完成并稳定运行，下一步可以考虑：

### 方向 1：把 `data.json` 升级为对象数组

```json
"OpenAI": [
  { "name": "GPT-4.1", "url": "https://..." }
]
```

优点：

- 不再依赖单独的 `links.json`
- 单条记录更完整

缺点：

- 改动更大
- 前端和构建脚本都要继续调整

### 方向 2：让 `data.json + links.json` 成为唯一源

届时：

- CSV/MD 只导出，不手工编辑
- 文档和自动化都围绕 JSON 更新

这是更推荐的长期方向。

---

## 我的建议

最稳的做法不是“直接切换格式”，而是：

先做兼容层，再做数据迁移。

这样可以把风险控制在最小范围内，也能保证网页端在整个迁移过程里都持续可用。
