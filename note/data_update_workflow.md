# 数据更新流程

> 记录日期：2026-04-18
> 适用仓库：`Physics-Lee/Monthly_Table_of_LLM_Releasing`

---

## 核心文件说明

| 文件 | 作用 | 是否为源数据 |
|------|------|-------------|
| `*.csv` | 原始数据，人类可读 | ✅ 源数据 |
| `*.md` | 带超链接的表格，人类可读 | ✅ 源数据（URL 在此） |
| `data.json` | Web App 渲染用的结构化数据 | ❌ 由脚本生成 |
| `links.json` | 模型名 → URL 映射表 | ❌ 由脚本生成 |
| `README.md` | GitHub 页面显示的表格 | ❌ 由脚本生成 |
| `index.html` + `app.js` | 交互式 Web 页面 | 静态文件 |

---

## 完整更新步骤

### 第一步：编辑源数据

**只改这两个文件，其他文件不要手动编辑：**

1. `llm_release_timeline_2022-11_to_2026-04.csv` — 核心数据（月份、模型名）
2. `llm_release_timeline_2022-11_to_2026-04.md` — 超链接（每个模型名后的 URL）

> CSV 中新增模型时：只在 CSV 的对应月份格子填模型名  
> MD 中新增模型时：用 `[模型名](URL)` 格式

### 第二步：运行构建脚本

```bash
node scripts/build-json.js
```

脚本自动完成：
- CSV 解析 → `data.json`
- MD 链接提取 → `links.json`（同时也补充 Hardcoded URL 推断）
- `data.json` + `links.json` → `README.md`

### 第三步：Git 提交

```bash
git add .
git commit -m "YYYY-MM-DD: 更新内容描述"
git push
```

---

## 发布渠道

### GitHub Pages（自动）

push 后 **2-5 分钟**自动生效，无需任何操作。

```
→ physics-lee.github.io/Monthly_Table_of_LLM_Releasing
```

触发条件：Settings → Pages → Source: **master branch (Classic)**

### GitHub Actions（自动）

这是**自动生成数据文件**的系统，不是用来展示网页的（网页靠上面的 Classic Pages）。

工作流程：
```
你 push CSV/MD
        ↓
GitHub Actions 自动运行 scripts/build-json.js
        ↓
生成 data.json + links.json + README.md
        ↓
自动 commit 到 master
        ↓
Classic GitHub Pages 检测到 master 有更新 → 网站重新加载
```

两个系统独立工作、互不干扰：

| 系统 | 作用 | 触发方式 |
|------|------|---------|
| **GitHub Actions** | 运行脚本生成数据文件 | 监听 CSV/MD 的 push |
| **GitHub Pages (Classic)** | 展示网页 | 检测 master 分支更新 |

### Coze（手动）

push 后**不会**自动更新，需手动在 Coze 后台重新发布：

1. 登录 [coze.cn](https://www.coze.cn)
2. 找到对应应用
3. 重新发布

```
→ api.dreamfree.space/c/s/llm-timeline
```

---

## 目录结构

```
Monthly_Table_of_LLM_Releasing/
├── index.html              # Web 页面入口
├── app.js                 # 交互逻辑（加载 data.json + links.json）
├── styles.css             # 样式
├── data.json              # ⚠️ 由脚本生成，不要手动编辑
├── links.json             # ⚠️ 由脚本生成，不要手动编辑
├── README.md              # ⚠️ 由脚本生成，不要手动编辑
├── llm_release_timeline_2022-11_to_2026-04.csv   # ✅ 源数据
├── llm_release_timeline_2022-11_to_2026-04.md    # ✅ 源数据（URL 在此）
├── scripts/
│   ├── build-json.js      # 主构建脚本
│   └── generate-readme.js # 旧脚本（已被 build-json.js 取代）
├── .github/
│   └── workflows/
│       └── build.yml      # GitHub Actions 配置（自动运行 build-json.js）
├── .coze                  # Coze 本地调试配置
└── note/                  # 内部笔记
```

---

## 常见问题

**Q: 为什么 CSV 的 23-Aug 行有 21 字段而不是 20？**  
A: 早期版本有尾随逗号 bug，已修复。如再出现，检查行末是否多了一个逗号。

**Q: links.json 里的 URL 从哪来？**  
A: 主要从 MD 提取，少量通过 Hardcoded 推断补全（见 `inferURL()` 函数）。

**Q: 新增一个月份怎么做？**  
A: 在 CSV 最后一行插入新月份行，在 MD 表格末尾添加对应行，URL 写在 MD 的 `[模型名](URL)` 中，然后运行 `build-json.js`。

**Q: GitHub Pages 没更新怎么办？**
A: 去 Settings → Pages → 确认 Source 是 master branch / (root)，然后等 10 分钟再刷新。

**Q: GitHub Actions 和 GitHub Pages 是什么关系？我用的是 Classic Pages。**
A: GitHub Pages（Classic）和 GitHub Actions 是两套独立的系统：
- **GitHub Pages（Classic）** = 负责展示网页（你选的那个），push 到 master 就自动更新
- **GitHub Actions** = 负责**运行脚本生成数据文件**，由 `.github/workflows/build.yml` 触发

两者配合方式：Actions 生成 README.md 等文件 → commit 到 master → Classic Pages 检测到分支更新 → 网页刷新。
- 设置 Classic Pages：Settings → Pages → Source: master branch
- 设置 Actions：Settings → Actions → 保持默认即可，Actions 是自动触发的
