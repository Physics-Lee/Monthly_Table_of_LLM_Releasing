# Kimi 分析笔记：wmpeng/codingplan

> 分析对象：https://github.com/wmpeng/codingplan  
> 分析时间：2026-04-14

---

## 一、项目概述

**codingplan** 是一个由 **wmpeng** 维护的开源项目，核心目标是：

> **聚合并对比国内各大 AI 平台的 Coding Plan / Token Plan 订阅价格与权益。**

- **GitHub 仓库**：https://github.com/wmpeng/codingplan
- **在线访问地址**：https://api.dreamfree.space/c/s/cpgh
- **Star 数**：129
- **Fork 数**：6
- **创建时间**：2026-03-06
- **最近更新**：2026-04-14

---

## 二、项目结构

仓库采用**纯前端静态网站**架构，数据与展示分离，通过 JSON 配置文件驱动页面渲染。

```
codingplan/
├── .coze                    # Coze 平台部署配置文件
├── .github/                 # GitHub 相关配置
├── .gitignore
├── README.md                # 由脚本自动生成的 Markdown 文档
├── index.html               # 主站：Coding Plan / Token Plan 对比
├── relays.html              # 子站：API 中转站对比
├── tools.html               # 子站：AI 编程工具对比
├── config.json              # 主站配置（标题、推荐、说明、更新日志等）
├── plans.json               # 主站数据：各平台套餐详情
├── relays-config.json       # 中转站页面配置
├── relays.json              # 中转站数据
├── tools-config.json        # 工具页面配置
├── tools.json               # 工具对比数据
├── styles/
│   ├── shared.css           # 全局共享样式
│   └── main.css             # 主站专属样式
├── scripts/
│   ├── shared.js            # 全局共享脚本（如超宽屏设置）
│   ├── generate-readme.js   # Node.js 脚本：根据 config.json + plans.json 自动生成 README.md
│   └── （index.html 内嵌主逻辑）
├── assets/                  # 静态资源（如微信二维码）
```

---

## 三、核心设计思路

### 1. 数据驱动（JSON-first）

所有对比内容都存储在独立的 JSON 文件中，HTML 页面通过内嵌 JavaScript 动态读取并渲染表格。

- **`plans.json`**：主站核心数据，每条记录是一个平台套餐，包含：
  - `vendor`（平台名称）
  - `plan`（套餐名，如 Lite / Pro / Max）
  - `type`（Coding Plan / Token Plan）
  - `action`（带推广码的跳转链接）
  - 价格：`monthlyPrice`, `quarterlyPrice`, `yearlyPrice`, `firstMonthPrice`
  - 额度：`fiveHoursRequests`, `weeklyRequests`, `monthlyRequests`
  - `models`（支持的模型列表）
  - `benefits`（附赠权益，如免费 MCP）
  - `note`（备注说明）

- **`config.json`**：控制页面展示层，包含：
  - 页面标题、副标题、支持模型列表
  - 平台推荐评分（1-5 星 + 理由）
  - 表格列名、筛选器配置
  - 更新日志
  - 账号出售板块（当前为空）

### 2. 自动化生成 README

通过 `scripts/generate-readme.js`（Node.js 脚本），将 `config.json` + `plans.json` 自动转换为 GitHub 可读的 `README.md`。

**优点**：
- 网站数据和 README 保持同步，避免重复维护。
- 支持价格格式化（如划线原价、季度/年度折扣计算）。

### 3. 多页面架构

项目不止一个页面，而是围绕"AI 编程消费"主题做了三个垂直页面：

| 页面 | 内容 | 数据来源 |
|------|------|---------|
| `index.html` | 国内 AI 平台 Coding Plan / Token Plan 订阅对比 | `config.json` + `plans.json` |
| `relays.html` | API 中转站（如 OpenRouter、SiliconFlow）对比 | `relays-config.json` + `relays.json` |
| `tools.html` | AI 编程工具（如 Cursor、Copilot、Claude Code）对比 | `tools-config.json` + `tools.json` |

三个页面共享 `styles/shared.css` 和 `scripts/shared.js`，保持视觉和交互一致性。

---

## 四、页面功能特性

### 1. 筛选与排序

主站 `index.html` 支持多维度筛选：
- 平台（Vendor）
- 类型（Coding Plan / Token Plan）
- 支持模型
- 价格区间（首月价、月付价、季付价、年付价、Token 限额）

筛选结果实时显示 " Showing X / Y 个套餐"。

### 2. 超宽屏模式

通过 `shared.js` 实现了一个设置面板：
- 用户可以开启/关闭 **Ultra Wide 模式**
- 状态保存在 `localStorage`
- 开启后页面布局更宽，适合大屏浏览复杂表格

### 3. 推广链接变现

几乎所有套餐的"跳转"按钮都带有**推广码/邀请码**（如 `ic=QHIO7TWK3Z`、`code=LXhBWH1gnf`），说明项目有**CPS 返利**或**拉新分成**的商业模式。

### 4. 账号出售板块（预留）

`config.json` 中有一个 `accountSale` 字段，当前 `accounts` 数组为空，但结构已预留：
- 标题、描述
- 账号列表（平台、详情、价格）
- 微信联系方式 + 二维码

这是典型的"信息站 + 私域引流"设计。

---

## 五、部署方式

### 1. Coze 部署（主要入口）

`.coze` 文件显示项目通过 **Coze（扣子）平台**部署：

```ini
[project]
entrypoint = "index.html"
requires = ["python-3.12"]

[deploy]
run = ["python", "-m", "http.server", "5000", "--bind", "0.0.0.0"]
```

- 使用 Python 内置 HTTP 服务器作为静态文件服务
- 对外域名是 `https://api.dreamfree.space/c/s/cpgh`

### 2. GitHub 仓库作为源码托管

GitHub 仅用于代码托管和版本控制，实际流量入口是 Coze 发布的站点。

---

## 六、内容运营策略

### 1. 高频更新

从 `config.json` 的 `updates` 字段可以看到更新节奏非常快：
- 2026.4.14：新增腾讯 TokenPlan
- 2026.4.12：新增智谱国际版、小米 MiMo
- 2026.4.10：新增 Qwen-3.6-Plus
- 2026.4.3：新增京东云 JoyBuilder
- 2026.3.28：新增 GLM-5.1

**几乎每 1-3 天更新一次**，紧跟国内 AI 平台的发布节奏。

### 2. 平台推荐评分

项目不是简单罗列数据，而是给出了主观推荐：

| 平台 | 评分 | 核心理由 |
|------|------|---------|
| 智谱AI | ⭐⭐⭐⭐⭐ | 独占 GLM-5.1、提供免费 MCP |
| MiniMax | ⭐⭐⭐⭐⭐ | 价格最低档便宜、独占 M2.7 |
| 字节·方舟 | ⭐⭐⭐⭐ | 独占 Doubao-Seed-2.0、送 OpenClaw |
| 阿里·百炼 | ⭐⭐⭐ | 独占 Qwen-3.6-Plus，但只有 Pro 档性价比不高 |
| 小米·MiMo | ⭐⭐⭐ | 独占 MiMo，但 Token 计费性价比低 |

评分标准公开：价格竞争力 1 分 + 模型独占/覆盖 1 分 + 附加权益 1 分。

---

## 七、可借鉴的优点

1. **数据与展示分离**：JSON 驱动，更新数据无需改代码。
2. **自动化文档**：Node.js 脚本自动生成 README，维护成本低。
3. **多页面矩阵**：一个主题下拆分多个垂直对比页面，覆盖更多搜索场景。
4. **快速迭代**：紧跟行业动态，保持内容新鲜度。
5. **商业模式清晰**：推广链接 + 私域引流（微信）+ 账号交易预留。
6. **国内可访问**：通过 Coze 部署，避免了 GitHub Pages 在国内的不稳定性。

---

## 八、与本项目的关联思考

我们的项目 `llm_release_timeline` 也是一个**信息聚合类**项目（大模型发布时间线），可以从 codingplan 借鉴：

| 可借鉴点 | 应用到我们的项目 |
|---------|----------------|
| JSON 数据驱动 | 将 CSV 转换为结构化 JSON，便于前端渲染 |
| 自动生成 README | 用脚本根据 JSON 自动生成 Markdown 表格 |
| 多页面扩展 | 除了时间线，可增加"价格对比页"、"模型能力对比页" |
| 筛选功能 | 时间线页面支持按厂商、按年份、按模型类型筛选 |
| 部署策略 | 考虑 Gitee Pages 或 Coze 发布，确保国内访问稳定 |
| 推广变现 | 在相关模型/平台链接中加入推广码 |

---

## 九、总结

**wmpeng/codingplan** 是一个非常典型的"**信息差变现型**"开源项目：

- 技术栈极简（纯 HTML/CSS/JS + JSON）
- 运营节奏极快（紧跟 AI 平台发布）
- 商业模式清晰（推广 CPS + 私域引流）
- 用户体验到位（筛选、超宽屏、自动同步 README）

对于我们的 `llm_release_timeline` 项目，最值得学习的是它的**"数据驱动 + 自动化 + 快速迭代"**的工作流。
