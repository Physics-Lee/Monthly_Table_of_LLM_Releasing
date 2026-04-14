# 方案 B 详细实施指南：用 Coze 部署完整静态网站

> 目标：将 `llm_release_timeline` 发布为一个专业的交互式静态网站  
> 部署平台：Coze（扣子）  
> 费用：¥0  
> 预计耗时：30-60 分钟

---

## 一、整体架构

```
llm_release_timeline/
├── .coze                    # Coze 部署配置
├── index.html               # 主页面
├── data.json                # 从 CSV 转换的结构化数据
├── styles.css               # 页面样式
├── app.js                   # 交互逻辑
└── README.md                # 项目说明（可选）
```

**工作流程**：
1. `data.json` 存储所有时间线数据
2. `index.html` 加载页面框架
3. `app.js` 读取 `data.json`，动态渲染表格和筛选器
4. `styles.css` 控制视觉呈现
5. `.coze` 告诉 Coze 如何用 Python HTTP 服务器运行这个网站

---

## 二、Step 1：准备数据（CSV → JSON）

### 2.1 转换思路

原始 CSV 是"月份 × 厂商"的矩阵格式。为了前端方便渲染，建议转成两种 JSON 结构：

**结构 A：矩阵格式**（直接对应表格渲染）
```json
{
  "vendors": ["OpenAI", "Anthropic", "Google", "Meta", ...],
  "rows": [
    {
      "month": "22-Nov",
      "OpenAI": "ChatGPT GPT-3.5",
      "Anthropic": "",
      "Google": "",
      ...,
      "open_source": "LangChain"
    },
    ...
  ]
}
```

**结构 B：事件列表格式**（更适合时间轴、搜索、筛选）
```json
{
  "events": [
    {
      "month": "22-Nov",
      "year": 2022,
      "vendor": "OpenAI",
      "model": "ChatGPT GPT-3.5",
      "url": null
    },
    {
      "month": "23-Feb",
      "year": 2023,
      "vendor": "Google",
      "model": "Bard",
      "url": "https://blog.google/technology/ai/bard-google-ai-search/"
    }
  ]
}
```

### 2.2 推荐做法

**主数据用结构 A（矩阵）**，因为用户最习惯看表格。同时可以在 `app.js` 里把矩阵实时转成事件列表，用于搜索和筛选。

### 2.3 数据来源链接处理

`llm_release_timeline_2022-11_to_2026-04.md` 里很多模型名带有超链接。转换 JSON 时，可以把链接提取出来：

```json
{
  "month": "23-Mar",
  "vendor": "Anthropic",
  "model": "Claude 1",
  "url": "https://www.anthropic.com/news/introducing-claude"
}
```

对于 CSV 里没有链接的模型，可以在 JSON 里用 `"url": null` 占位，后续再补充。

---

## 三、Step 2：设计页面功能

### 3.1 核心功能清单

| 功能 | 优先级 | 说明 |
|------|--------|------|
| **表格渲染** | P0 | 按月显示，厂商为列，模型为单元格内容 |
| **厂商筛选** | P0 | 顶部勾选框，控制显示哪些厂商列 |
| **年份筛选** | P0 | 只显示特定年份的数据行 |
| **搜索框** | P1 | 按模型名搜索，高亮匹配结果 |
| **模型链接** | P0 | 点击带链接的模型名，跳转官方来源 |
| **响应式布局** | P1 | 表格支持横向滚动，适配手机 |
| **深色模式** | P2 | 切换浅色/深色主题 |
| **导出数据** | P2 | 下载当前筛选后的 CSV |

### 3.2 页面布局建议

```
┌─────────────────────────────────────────┐
│  LLM Release Timeline          [GitHub] │
│  2022-11 ~ 2026-04 | 持续更新中...       │
├─────────────────────────────────────────┤
│  [搜索框]                               │
│  [年份: 全部 ▼] [厂商筛选 ▼] [重置]     │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │  月份  | OpenAI | Anthropic | ...│   │
│  │ 22-Nov | ChatGPT |        | ... │   │
│  │ 23-Mar | GPT-4   | Claude 1| ...│   │
│  │ ...                              │   │
│  └─────────────────────────────────┘    │
│           ← 横向滚动 →                  │
├─────────────────────────────────────────┤
│  显示 43 / 43 个月  |  数据来源链接      │
└─────────────────────────────────────────┘
```

---

## 四、Step 3：编写核心代码

### 4.1 `.coze` 配置文件

在项目根目录创建 `.coze`：

```ini
[project]
entrypoint = "index.html"
requires = ["python-3.12"]

[dev]
build = []
run = ["python", "-m", "http.server", "5000", "--bind", "0.0.0.0"]

[deploy]
build = []
run = ["python", "-m", "http.server", "5000", "--bind", "0.0.0.0"]
```

**说明**：
- `entrypoint` 指定入口文件
- `run` 用 Python 内置 HTTP 服务器托管静态文件
- `build = []` 表示不需要构建步骤

### 4.2 `index.html` 框架

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LLM Release Timeline</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>LLM Release Timeline</h1>
      <p class="subtitle">2022-11 ~ 2026-04 | 持续更新中</p>
      <a href="https://github.com/你的用户名/llm_release_timeline" class="github-link">GitHub</a>
    </header>

    <div class="filters">
      <input type="text" id="searchInput" placeholder="搜索模型名称...">
      <select id="yearFilter">
        <option value="all">全部年份</option>
        <option value="2022">2022</option>
        <option value="2023">2023</option>
        <option value="2024">2024</option>
        <option value="2025">2025</option>
        <option value="2026">2026</option>
      </select>
      <div class="vendor-filters" id="vendorFilters"></div>
      <button id="resetBtn">重置筛选</button>
    </div>

    <div class="table-wrapper">
      <table id="timelineTable">
        <thead></thead>
        <tbody></tbody>
      </table>
    </div>

    <div class="footer">
      <span id="stats">加载中...</span>
    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

### 4.3 `styles.css` 核心要点

```css
:root {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --accent-primary: #6366f1;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 24px;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
}

/* 表格容器横向滚动 */
.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

th, td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  font-size: 13px;
}

th {
  background: #f1f5f9;
  font-weight: 600;
  position: sticky;
  top: 0;
}

/* 第一列月份固定 */
th:first-child, td:first-child {
  position: sticky;
  left: 0;
  background: var(--bg-secondary);
  font-weight: 600;
  z-index: 2;
}

th:first-child {
  background: #f1f5f9;
  z-index: 3;
}

/* 模型链接 */
.model-link {
  color: var(--accent-primary);
  text-decoration: none;
}
.model-link:hover {
  text-decoration: underline;
}

/* 筛选器样式 */
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.vendor-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.vendor-filters label {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.vendor-filters input:checked + span {
  color: var(--accent-primary);
  font-weight: 500;
}
```

### 4.4 `app.js` 核心逻辑

```javascript
// 全局状态
let allData = { vendors: [], rows: [] };
let activeVendors = new Set();
let activeYear = 'all';
let searchQuery = '';

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  initFilters();
  render();
});

// 加载数据
async function loadData() {
  const res = await fetch('data.json');
  allData = await res.json();
  activeVendors = new Set(allData.vendors);
}

// 初始化筛选器
function initFilters() {
  const container = document.getElementById('vendorFilters');
  allData.vendors.forEach(vendor => {
    const label = document.createElement('label');
    label.innerHTML = `
      <input type="checkbox" value="${vendor}" checked>
      <span>${vendor}</span>
    `;
    label.querySelector('input').addEventListener('change', () => {
      updateActiveVendors();
      render();
    });
    container.appendChild(label);
  });

  document.getElementById('yearFilter').addEventListener('change', (e) => {
    activeYear = e.target.value;
    render();
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    render();
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    activeYear = 'all';
    searchQuery = '';
    activeVendors = new Set(allData.vendors);
    document.getElementById('yearFilter').value = 'all';
    document.getElementById('searchInput').value = '';
    container.querySelectorAll('input').forEach(cb => cb.checked = true);
    render();
  });
}

function updateActiveVendors() {
  activeVendors.clear();
  document.querySelectorAll('#vendorFilters input:checked').forEach(cb => {
    activeVendors.add(cb.value);
  });
}

// 渲染表格
function render() {
  const thead = document.querySelector('#timelineTable thead');
  const tbody = document.querySelector('#timelineTable tbody');

  // 过滤行
  let filteredRows = allData.rows.filter(row => {
    if (activeYear !== 'all') {
      const year = '20' + row.month.split('-')[0];
      if (year !== activeYear) return false;
    }
    if (searchQuery) {
      const rowText = allData.vendors.map(v => row[v] || '').join(' ').toLowerCase();
      if (!rowText.includes(searchQuery)) return false;
    }
    return true;
  });

  // 过滤列：只保留 Month + 选中的厂商
  const visibleVendors = ['Month', ...allData.vendors.filter(v => activeVendors.has(v))];

  // 渲染表头
  thead.innerHTML = '<tr>' + visibleVendors.map(v => `<th>${v}</th>`).join('') + '</tr>';

  // 渲染表体
  tbody.innerHTML = filteredRows.map(row => {
    return '<tr>' + visibleVendors.map(vendor => {
      const cell = row[vendor] || '';
      // 如果有 URL，渲染为链接（这里简化处理，实际需要在 data.json 里存 url）
      return `<td>${formatCell(cell)}</td>`;
    }).join('') + '</tr>';
  }).join('');

  // 更新统计
  document.getElementById('stats').textContent = `显示 ${filteredRows.length} / ${allData.rows.length} 个月`;
}

function formatCell(text) {
  if (!text) return '';
  // 简化版：把 " + " 替换为换行，让单元格内多个模型分行显示
  return text.split(' + ').join('<br>');
}
```

---

## 五、Step 4：数据中的链接处理

CSV 本身没有链接，但 `llm_release_timeline_2022-11_to_2026-04.md` 里有大量带链接的模型名。

### 推荐做法

把 Markdown 里的链接提取到单独的 `links.json`：

```json
{
  "Claude 1": "https://www.anthropic.com/news/introducing-claude",
  "GPT-4V": "https://openai.com/index/gpt-4v-system-card/",
  "Sora": "https://openai.com/index/sora-is-here/",
  ...
}
```

然后在 `app.js` 渲染时查找匹配：

```javascript
async function loadLinks() {
  const res = await fetch('links.json');
  return await res.json();
}

function formatCell(text, links) {
  if (!text) return '';
  return text.split(' + ').map(model => {
    const url = links[model.trim()];
    if (url) {
      return `<a href="${url}" target="_blank" class="model-link">${model}</a>`;
    }
    return model;
  }).join('<br>');
}
```

---

## 六、Step 5：上传到 Coze 并发布

### 6.1 注册与创建

1. 访问 [coze.cn](https://www.coze.cn) 并登录
2. 进入「开发」→「创建应用」
3. 选择「网页应用」或「自定义项目」（具体入口可能随 Coze 版本调整）
4. 上传整个项目文件夹

### 6.2 配置检查

- 确认入口文件是 `index.html`
- 确认 `.coze` 文件已包含在项目根目录
- 确认所有资源路径使用相对路径（如 `./data.json`、`./styles.css`）

### 6.3 预览与发布

1. 点击「预览」查看效果
2. 调整样式或功能
3. 点击「发布」→ 设置为「公开可访问」
4. 复制生成的链接，即可分享

---

## 七、后续维护工作流

当时间线数据更新时：

1. **更新 CSV** → 添加新的月份或模型
2. **运行转换脚本** → 重新生成 `data.json` 和 `links.json`
3. **本地测试** → 用 Python HTTP 服务器预览
   ```bash
   python -m http.server 5000
   ```
4. **重新上传到 Coze** → 覆盖旧文件
5. **完成**

---

## 八、进阶优化方向

| 优化项 | 效果 |
|--------|------|
| **时间轴视图** | 把表格切换为横向时间轴，更直观 |
| **模型卡片弹窗** | 点击模型名弹出详情（参数、来源、相关新闻） |
| **厂商颜色标识** | 每个厂商有自己的主题色，快速识别 |
| **深色模式** | 适配夜间浏览 |
| **PWA 支持** | 可添加到手机桌面，像 App 一样使用 |
| **访问量统计** | 接入百度统计或 Umami |

---

## 九、参考资源

- `wmpeng/codingplan` 仓库：https://github.com/wmpeng/codingplan
- Coze 官方文档：https://www.coze.cn/docs
- 本仓库现有文件：`llm_release_timeline_2022-11_to_2026-04.csv`、`llm_release_timeline_2022-11_to_2026-04.md`
