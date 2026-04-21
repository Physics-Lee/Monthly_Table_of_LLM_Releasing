# 数据更新流程

> 记录日期：2026-04-21（更新）  
> 适用仓库：`Physics-Lee/Monthly_Table_of_LLM_Releasing`

---

## 核心文件说明

| 文件 | 作用 | 是否为源数据 |
|------|------|-------------|
| `*.csv` | 原始数据，人类可读 | ✅ 源数据（**Agent 编辑时容易错位，不推荐**） |
| `*.md` | 带超链接的表格，人类可读 | ✅ 源数据（**URL 在此，推荐 Agent 编辑**） |
| `data.json` | Web App 渲染用的结构化数据 | ❌ 由脚本生成 |
| `links.json` | 模型名 → URL 映射表 | ❌ 由脚本生成 |
| `README.md` | GitHub 页面显示的表格 | ❌ 由脚本生成 |
| `index.html` + `app.js` | 交互式 Web 页面 | 静态文件 |

---

## 完整更新步骤

### 第一步：编辑源数据

**只改这两个文件，其他文件不要手动编辑。**

**推荐让 Agent 编辑 Markdown（`*.md`）：**
- 列边界清晰（`|` 分隔），Agent 不容易错位
- 无需处理 CSV 的引号和转义规则
- Git diff 更直观，只显示修改的单元格

**如果必须编辑 CSV，请严格遵守格式规则：**

```
⚠️ 关键规则：
1. 每行必须有 34 个逗号（= 35 列）
2. 单元格内容如果包含逗号，必须用双引号包裹："a,b,c"
3. 单元格内容如果包含双引号，必须转义："a""b"
4. 多个模型用 " + " 分隔，不要加逗号
```

**格式示例：**

```csv
# ✅ 正确
25-Apr,,GPT-4.1 + GPT-4.1 mini,,Gemini 2.5 Flash,,,,...

# ❌ 错误（逗号数量不对，会导致整行数据错位）
25-Apr,,GPT-4.1 + GPT-4.1 mini,Gemini 2.5 Flash,,,,...
```

### 第二步：运行构建脚本（强制验证）

```bash
node scripts/build-json.js
```

**重要：脚本现在会严格验证 CSV 格式。** 如果某行字段数与表头不匹配，构建会**立即崩溃**并显示错误信息：

```
❌ 第 31 行字段数不匹配: 期望 35 列, 实际 34 列
   内容: 25-Apr,OpenCode,GPT-4.1 + GPT-4.1 mini + GPT-4.1 nano + o3 + o4-mini,,Gemini 2.5 Flash,...
Error: CSV 格式错误: 第 31 行字段数不匹配，请检查逗号数量或引号配对
```

**构建成功输出：**
```
✓ CSV 解析完成: 42 行, 35 列
✓ MD 解析完成: 42 表格行, 312 个链接
✓ 已写入: data.json
✓ 已写入: links.json
✓ 已写入: README.md
✅ 完成！
```

**⚠️ 如果构建失败，必须修复 CSV/MD 格式后才能继续。** 不要跳过验证直接提交。

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
├── llm_release_timeline_2022-11_to_2026-04.csv   # ✅ 源数据（Agent 编辑需谨慎）
├── llm_release_timeline_2022-11_to_2026-04.md    # ✅ 源数据（URL 在此，推荐 Agent 编辑）
├── scripts/
│   ├── build-json.js      # 主构建脚本（含严格 CSV 验证）
│   ├── check-missing-links.js
│   ├── fix-md-links.js
│   └── update-md-links.js
├── .github/
│   └── workflows/
│       └── build.yml      # GitHub Actions 配置（自动运行 build-json.js）
└── note/                  # 内部笔记
```

---

## Agent 编辑最佳实践

### 推荐：编辑 Markdown

让 Agent 直接修改 `llm_release_timeline_2022-11_to_2026-04.md`：

```markdown
| Month | Open-Source | OpenAI | Anthropic | ... |
|-------|-------------|--------|-----------|-----|
| 25-Apr | OpenCode | GPT-4.1 + GPT-4.1 mini | | ... |
```

**Agent Prompt 模板：**
```
请在 llm_release_timeline_2022-11_to_2026-04.md 中：
1. 找到 25-Apr 行
2. 在 OpenAI 列添加 "GPT-5.5"，格式为 [GPT-5.5](URL)
3. 确保不破坏表格的列对齐（| 分隔符数量不变）
4. 编辑后运行 node scripts/build-json.js 验证
5. 如果构建失败，修复格式错误直到通过
```

### 不推荐：直接编辑 CSV

如果 Agent 必须编辑 CSV，请在 Prompt 中强制要求：
```
编辑 CSV 后必须：
1. 统计该行的逗号数量，确认等于 34 个
2. 运行 node scripts/build-json.js
3. 如果脚本报错，立即修复 CSV 格式
4. 构建成功后再提交
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

**Q: 构建脚本报错"字段数不匹配"怎么办？**
A: 这是 CSV 格式错误。检查报错的行：
1. 用文本编辑器打开 CSV，定位到报错行号
2. 数一下该行的逗号数量，确认等于 34 个
3. 检查是否有单元格内容包含未转义的逗号
4. 修复后重新运行 `node scripts/build-json.js`

**Q: Agent 编辑后数据错位了，怎么排查？**
A: 错位通常发生在 CSV 编辑时。对比 CSV 和 MD 的同一行：
```bash
grep "25-Apr" llm_release_timeline_2022-11_to_2026-04.csv
grep "25-Apr" llm_release_timeline_2022-11_to_2026-04.md
```
如果 CSV 中某列有内容而 MD 中对应列为空，说明 CSV 的逗号数量不对，导致后续列左移或右移。
