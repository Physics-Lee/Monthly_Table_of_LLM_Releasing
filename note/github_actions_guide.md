# GitHub Actions 选择与配置指南

> 目标：为 `Monthly_Table_of_LLM_Releasing` 选择合适的 GitHub Actions 工作流
> 分析时间：2026-04-14

---

## 一、你的项目需要 GitHub Actions 吗？

**答案是：建议配置，但不需要很复杂。**

你的项目是**纯前端静态网站**（HTML/CSS/JS + JSON），GitHub Pages 原生支持直接从 `main` 分支部署。但配置 GitHub Actions 可以带来以下好处：

| 好处 | 说明 |
|------|------|
| **自动部署** | push 代码后自动构建并部署到 Pages |
| **构建步骤** | 未来如果需要压缩 CSS/JS、生成站点地图等，可以在 Action 里完成 |
| **部署可控** | 可以精确控制部署时机、添加测试步骤 |
| **多分支支持** | 可以从非 `main` 分支部署，或部署预览环境 |

---

## 二、GitHub Pages 的两种部署方式

### 方式 A：经典分支部署（无需 Actions）

- Settings → Pages → Source 选择 `Deploy from a branch`
- 选择 `main` 分支，`/(root)`
- **优点**：最简单，零配置
- **缺点**：没有构建步骤，只能直接部署仓库里的静态文件

### 方式 B：GitHub Actions 部署（推荐）

- Settings → Pages → Source 选择 `GitHub Actions`
- 在仓库里创建 `.github/workflows/pages.yml`
- **优点**：可控、可扩展、是 GitHub 官方推荐的新方式
- **缺点**：需要写一个简单的 YAML 配置文件

**对于你的项目，推荐方式 B。**

---

## 三、推荐的工作流配置

### 3.1 最简版：直接部署静态文件

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**说明**：
- `on.push.branches: [main]` — 每次 push 到 main 分支时触发部署
- `path: '.'` — 把整个仓库根目录作为静态网站上传
- 不需要 Node.js，不需要构建步骤

### 3.2 进阶版：自动生成 README 后再部署

如果你希望 push CSV 后自动运行 `generate-readme.js`，可以用这个版本：

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Generate README
        run: node scripts/generate-readme.js

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**说明**：
- 增加了 `setup-node` 和 `generate-readme` 步骤
- 每次 push 时，GitHub Actions 会先自动更新 `README.md`，再部署网站

---

## 四、如何选择：推荐方案

| 你的需求 | 推荐配置 |
|---------|---------|
| 只想快速上线，不想折腾 | **方式 A**（经典分支部署，不写 Actions） |
| 想学习/使用官方推荐的新方式 | **最简版 Actions** |
| 希望 push CSV 后自动更新 README | **进阶版 Actions** |

**我的建议：直接用最简版 Actions。**

原因：
1. 这是 GitHub 官方现在推荐的标准做法
2. 配置简单，复制粘贴即可
3. 未来如果要加构建步骤（比如压缩 JS、生成 sitemap），很容易扩展
4. 部署日志清晰，出问题好排查

---

## 五、配置步骤

### Step 1：在仓库里创建工作流文件

```
Monthly_Table_of_LLM_Releasing/
├── .github/
│   └── workflows/
│       └── deploy.yml          # 新建这个文件
├── index.html
├── styles.css
├── ...
```

### Step 2：把上面的 YAML 内容粘贴进去

### Step 3：在仓库 Settings → Pages 里切换 Source

1. 打开仓库 → Settings → Pages
2. Source 选择 **"GitHub Actions"**
3. 保存

### Step 4：push 代码触发部署

```bash
git add .
git commit -m "Add GitHub Actions deployment"
git push origin main
```

### Step 5：查看部署状态

- 仓库主页 → Actions 标签页
- 可以看到每次部署的日志和状态
- 绿色 ✅ 表示部署成功

---

## 六、常见问题

### Q1：Actions 部署失败怎么办？

常见原因：
- `permissions` 没给够 → 检查 YAML 里的 `permissions` 部分
- 路径配置错误 → 确认 `upload-pages-artifact` 的 `path` 是对的
- 仓库 Settings → Pages 的 Source 没改成 GitHub Actions

### Q2：可以同时用分支部署和 Actions 吗？

**不可以。** 一个仓库的 Pages 只能选一个 Source，要么 "Deploy from a branch"，要么 "GitHub Actions"。

### Q3：PR 也能触发预览部署吗？

GitHub Pages 本身不支持 PR 预览（不像 Vercel/Netlify），但你可以：
- 在 Actions 里配置 PR 触发构建（不部署），用于检查代码是否有问题
- 或者使用第三方服务（如 Cloudflare Pages）做 PR 预览

### Q4：部署后多久能访问？

通常 30 秒到 2 分钟。

---

## 七、完整推荐配置（最终版）

综合考虑你的项目特点，我推荐这个配置：

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**特点**：
- 极简，没有不必要的步骤
- 纯静态文件直接部署
- 是 GitHub 官方推荐的标准 Actions 工作流
- 未来扩展方便

---

## 八、总结

| 问题 | 答案 |
|------|------|
| 是否需要 GitHub Actions？ | **建议配置**，但不是必须 |
| 最简单的方式是什么？ | 经典分支部署（Settings → Pages → Deploy from a branch） |
| 最推荐的方式是什么？ | GitHub Actions 部署（官方新标准、可扩展） |
| 你的项目适合什么 Actions？ | **最简静态部署**，不需要 Node.js 构建 |

如果你确定用 GitHub Actions，我可以直接帮你把 `.github/workflows/deploy.yml` 创建好。
