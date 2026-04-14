# Coding Plan 对比工具（wmpeng/codingplan）调查笔记

> 调查对象：https://github.com/wmpeng/codingplan  
> 对应网站：https://api.dreamfree.space/c/s/cpgh （以及 https://z4crk6mg95.coze.site/）

---

## 一、项目概述

这是一个**纯前端静态网站**，用于对比国内主流 AI 平台的 Coding Plan / Token Plan 套餐价格和权益。作者通过 **Coze（扣子）平台** 部署发布。

### 核心特点
- **无后端服务器**：所有数据放在 JSON 文件里，前端直接 `fetch` 加载
- **无大模型调用**：页面是纯信息展示 + 筛选排序，没有 AI 对话功能
- **部署在 Coze**：利用 Coze 的免费静态托管能力，国内访问稳定

---

## 二、技术架构

### 文件结构

```
wmpeng/codingplan/
├── .coze                    # Coze 部署配置文件
├── .github/                 # GitHub Actions 或模板（未详细调查）
├── .gitignore
├── README.md                # 由脚本自动生成的项目说明
├── index.html               # 主页面：Coding Plan 对比（123KB）
├── tools.html               # 子页面：AI 编程工具对比（25KB）
├── relays.html              # 子页面：API 中转站对比（55KB）
├── plans.json               # 套餐数据（32 条记录）
├── tools.json               # 工具数据
├── relays.json              # 中转站数据
├── config.json              # 网站配置（标题、推荐、评分规则、筛选文案等）
├── tools-config.json        # 工具页配置
├── relays-config.json       # 中转站页配置
├── styles/
│   ├── shared.css           # 公共样式（7KB）
│   └── main.css             # 主样式（2.7KB）
├── scripts/
│   ├── generate-readme.js   # 根据 config.json + plans.json 自动生成 README.md
│   └── shared.js            # 公共工具函数（超宽屏设置、HTML 转义）
└── assets/
    └── wechat-qr.jpg        # 微信二维码（账号出售联系）
```

### 关键技术细节

| 项目 | 内容 |
|------|------|
| **前端框架** | 无框架，纯原生 HTML + CSS + JavaScript |
| **数据加载** | `fetch('./plans.json')` + `fetch('./config.json')` |
| **样式方案** | CSS 变量（支持暗色/亮色模式）+ 自定义动画 |
| **交互功能** | 筛选器（平台、模型、类型、价格区间）、表格排序、超宽屏切换 |
| **构建工具** | 无构建步骤，直接部署原始文件 |

### Coze 部署配置（`.coze`）

```toml
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

**解读**：Coze 用 Python 的 `http.server` 作为静态文件服务器，托管整个目录。没有后端逻辑，没有模型调用。

---

## 三、数据来源与更新机制

### 数据存储
所有对比数据都硬编码在 JSON 文件中：
- `plans.json`：32 条套餐记录，包含平台、价格、支持模型、请求数限制等
- `config.json`：页面文案、推荐语、评分标准、更新日志、账号出售信息等

### 更新流程（推测）
1. 作者手动收集各平台最新价格和权益
2. 修改 `plans.json` 和 `config.json`
3. 运行 `node scripts/generate-readme.js` 自动更新 `README.md`
4. 推送到 GitHub
5. Coze 自动/手动重新部署

### README 自动生成
`scripts/generate-readme.js` 的功能：
- 读取 `config.json` 和 `plans.json`
- 生成平台推荐列表（带星级）
- 生成 Markdown 格式的套餐对比表格
- 处理划线价格（优惠价格 vs 原始价格）
- 输出到 `README.md`

---

## 四、费用分析

### 这个网站调用大模型 API 吗？
**不调用。**

这是一个纯静态信息展示网站：
- 没有 AI 对话入口
- 没有 Bot 交互
- 页面内容全部来自本地 JSON 文件
- Coze 只提供静态托管和域名

### 实际成本
| 项目 | 费用 |
|------|------|
| **Coze 静态托管** | ¥0（免费） |
| **域名** | ¥0（使用 Coze 分配的二级域名） |
| **大模型 API 调用** | ¥0（没有调用） |
| **数据维护** | 作者的时间成本 |

### 为什么选 Coze 部署
- 免费托管
- 国内访问稳定（火山引擎 CDN）
- 不需要买服务器、配域名
- 一键发布，更新方便

---

## 五、页面功能拆解

### 主页面（index.html）
- 顶部标题 + 更新时间 + 支持模型列表
- GitHub 跳转链接
- 平台推荐卡片（带星级和评分理由）
- 多维度筛选栏：平台、套餐类型、模型、首月价格、包月价格、包季价格、包年价格
- 可排序的数据表格
- 更新日志
- 账号出售信息（微信二维码）

### 子页面
- `tools.html`：AI 编程工具对比
- `relays.html`：API 中转站对比

---

## 六、对你的启发（LLM Release Timeline 项目）

如果你也想做一个类似的公开网站，可以借鉴它的模式：

| 可借鉴点 | 说明 |
|---------|------|
| **纯前端静态化** | 你的 CSV/MD 数据可以转成 JSON，前端渲染成表格 |
| **Coze 免费托管** | 国内可访问，零服务器成本 |
| **自动生成 README** | 可以写个脚本，从 CSV 自动生成 Markdown 表格 |
| **筛选 + 排序** | 年份、厂商、模型类型等维度筛选 |
| **更新日志** | 增强网站的可信度和活跃度 |

### 关键区别
- `codingplan` 的数据是**手动维护的 JSON**
- 你的 `llm_release_timeline` 已经有**结构化的 CSV 和 Markdown**
- 你可以直接基于 CSV 生成网页，甚至做一个**交互式时间线**

---

## 七、结论

> **wmpeng/codingplan 是一个纯前端静态网站，通过 Coze 免费托管发布。它不调用任何大模型 API，所有成本为 0。页面数据来自手动维护的 JSON 文件，README 由脚本自动生成。**

如果你想复制这个模式发布你的 LLM Release Timeline，核心成本也只有**你的时间**，没有金钱支出。
