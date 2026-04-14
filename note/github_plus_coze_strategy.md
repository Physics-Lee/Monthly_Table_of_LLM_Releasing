# GitHub Repo + Coze 联合部署策略

> 目标：像 `wmpeng/codingplan` 一样，用 **GitHub 仓库管理源码 + Coze 托管运行站点**
> 分析时间：2026-04-14

---

## 一、为什么选择这个组合

`wmpeng/codingplan` 的核心模式是：

| 平台 | 职责 | 原因 |
|------|------|------|
| **GitHub** | 代码托管、版本控制、社区展示 | 开发者生态好、免费、可积累 Star |
| **Coze** | 实际流量入口、国内可访问 | 部署简单、国内访问稳定、免费 |

这个组合的**本质**是：
> GitHub 是"后台"和"名片"，Coze 是"前台"和"实际服务入口"。

---

## 二、这个组合的具体分工

### GitHub 负责什么

1. **源码托管**
   - HTML / CSS / JS 代码
   - JSON 数据文件
   - 配置文件（如 `.coze`）
   
2. **版本控制**
   - 每次更新都有 commit 记录
   - 可追溯、可回滚
   - 多人协作时可发 PR

3. **社区与信任背书**
   - README 展示项目价值
   - Star / Fork 积累社交证明
   - Issue 收集用户反馈

4. **自动化生成内容**
   - 像 `codingplan` 一样，用脚本根据 JSON 数据自动生成 `README.md`
   - 保证网站数据和 README 永远同步

### Coze 负责什么

1. **国内流量入口**
   - 用户实际访问的是 Coze 发布的链接
   - 国内访问速度快、无需翻墙

2. **静态网站托管**
   - 上传项目文件夹即可运行
   - 不需要买服务器、不需要配域名

3. **零成本运维**
   - 纯静态页面不消耗 AI 积分
   - 完全免费

---

## 三、工作流程设计

### 日常更新流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  更新数据   │ ──→ │  推送 GitHub │ ──→ │  上传 Coze  │
│ (CSV/JSON)  │     │  (commit)    │     │  (发布站点)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

**具体步骤**：
1. 修改 `llm_release_timeline_2022-11_to_2026-04.csv`
2. 运行转换脚本，重新生成 `data.json`
3. 运行 `generate-readme.js`，更新 `README.md`
4. `git add .` → `git commit -m "更新至 2026-05"` → `git push`
5. 把最新代码打包上传到 Coze，覆盖旧版本
6. 完成

### 两个入口的关系

| 入口 | URL 示例 | 用户类型 |
|------|---------|---------|
| **GitHub 仓库** | `https://github.com/你的用户名/llm_release_timeline` | 开发者、想 fork 的人 |
| **Coze 站点** | `https://xxxxx.coze.site` | 普通浏览者、国内用户 |

在 `index.html` 的页眉放一个 **GitHub 链接**，在 `README.md` 里放一个 **在线访问链接**，形成双向导流。

---

## 四、项目结构（最终版）

参考 `codingplan`，你的仓库最终应该长这样：

```
llm_release_timeline/
│
├── .coze                          # Coze 部署配置（TOML 格式）
├── .gitignore
├── README.md                       # 由脚本自动生成
│
├── index.html                      # 主页面（时间线表格）
├── styles.css                      # 页面样式
├── app.js                          # 交互逻辑
│
├── data.json                       # 时间线核心数据
├── links.json                      # 模型 → 来源链接映射
│
├── llm_release_timeline_2022-11_to_2026-04.csv    # 原始数据
├── llm_release_timeline_2022-11_to_2026-04.md     # 带链接的 Markdown
│
├── scripts/
│   ├── csv-to-json.js              # CSV → data.json 转换脚本
│   ├── extract-links.js            # 从 Markdown 提取链接 → links.json
│   └── generate-readme.js          # 根据 data.json 生成 README.md
│
├── assets/
│   └── （未来可能用到的图片、图标等）
│
└── note/                           # 分析笔记（已有的内容）
    ├── kimi_analysis_of_wmpeng.md
    ├── coze_publish_options.md
    ├── coze_publish_option_b_guide.md
    └── ...
```

---

## 五、关键代码/文件模板

### 5.1 `.coze`（TOML 格式）

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

### 5.2 `scripts/generate-readme.js`

核心逻辑参考 `codingplan`：
- 读取 `data.json`
- 生成 Markdown 表格
- 把链接渲染成 `[模型名](链接)` 格式
- 写入 `README.md`

### 5.3 `scripts/csv-to-json.js`

- 读取 CSV 文件
- 解析表头和每一行
- 把 `" + "` 分隔的模型拆分为数组（方便前端处理）
- 输出 `data.json`

### 5.4 `scripts/extract-links.js`

- 读取 Markdown 文件
- 用正则匹配 `[模型名](链接)`
- 输出 `links.json`

---

## 六、与 `codingplan` 的异同

| 维度 | `codingplan` | 你的 `llm_release_timeline` |
|------|-------------|---------------------------|
| **GitHub 用途** | 源码托管 + README 展示 | 相同 |
| **Coze 用途** | 实际流量入口 | 相同 |
| **数据更新频率** | 每 1-3 天 | 按月更新即可 |
| **数据形态** | 套餐列表（结构化强） | 时间矩阵（表格形态强） |
| **变现方式** | 推广链接 CPS + 私域引流 | 目前无，可加来源链接 |
| **页面复杂度** | 多页面（3 个 HTML） | 建议先从 1 个页面开始 |

---

## 七、潜在问题与应对

### 问题 1：Coze 可能有平台水印

**事实**：Coze 会在页面注入 `coze-coding-branding-script`，可能出现 "Powered by Coze" 标识。

**应对**：
- 如果介意水印，未来可以迁移到 **Gitee Pages**（但你就明确说想复制 `codingplan` 模式，所以先接受这一点）
- `codingplan` 本身也在这个平台上，说明对于信息站来说，水印不影响使用

### 问题 2：每次更新需要手动上传 Coze

**事实**：Coze 目前不支持自动从 GitHub 拉取更新。

**应对**：
- 更新频率不高（按月），手动上传成本可接受
- 未来如果 Coze 支持 Git 同步或 Webhook，可以进一步优化

### 问题 3：域名不独立

**事实**：个人版只能用 `xxx.coze.site`。

**应对**：
- 在 README 和社交媒体传播时，强调 GitHub 仓库地址（更稳定）
- Coze 链接作为"国内快速访问入口"

---

## 八、下一步行动计划

如果你确认采用 **GitHub + Coze** 模式，建议按以下顺序执行：

1. **准备数据转换脚本**
   - `csv-to-json.js`
   - `extract-links.js`

2. **编写前端页面**
   - `index.html`（表格 + 筛选器）
   - `styles.css`（响应式、美观）
   - `app.js`（动态渲染、搜索、筛选）

3. **编写 README 生成脚本**
   - `generate-readme.js`

4. **本地测试**
   - `python -m http.server 5000`
   - 浏览器打开 `http://localhost:5000`

5. **推送到 GitHub**
   - 初始化仓库、提交代码

6. **上传到 Coze 发布**
   - 获得公开链接

7. **双向引流**
   - `README.md` 里放 Coze 访问链接
   - `index.html` 页眉放 GitHub 仓库链接

---

## 九、结论

**GitHub Repo + Coze 是一个可行且免费的模式。**

它的最大优势是：
- **GitHub** 提供版本控制、社区信任和长期可维护性
- **Coze** 提供国内可访问、零成本托管的实际入口

`wmpeng/codingplan` 已经验证了这个模式的有效性。你的 `llm_release_timeline` 数据形态不同（时间矩阵 vs 价格列表），但底层架构完全可以照搬。

如果你现在就开始，我可以直接帮你写完所有代码和脚本。
