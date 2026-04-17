# GitHub Pages 经典分支部署检查清单

> 部署方式：经典分支部署（无需 GitHub Actions）
> 目标仓库：https://github.com/Physics-Lee/Monthly_Table_of_LLM_Releasing
> 分析时间：2026-04-14

---

## 一、核心结论

**经典分支部署是最简单的方式：**
- 不需要写 `.github/workflows/deploy.yml`
- 不需要配置 GitHub Actions
- push 到 `main` 分支后，GitHub 自动部署

---

## 二、部署前检查清单

### 文件清单（确认都已准备好）

- [x] `index.html` — 主页面
- [x] `styles.css` — 样式文件
- [x] `app.js` — 交互逻辑
- [x] `data.json` — 时间线数据
- [x] `links.json` — 来源链接映射
- [x] `README.md` — 项目说明
- [x] `.coze` — Coze 部署配置（可选，留在仓库里不影响）
- [x] `scripts/generate-readme.js` — README 生成脚本

### 路径检查（Project Pages 必须用相对路径）

| 文件 | 引用方式 | 状态 |
|------|---------|------|
| `index.html` → `styles.css` | `./styles.css` | ✅ 正确 |
| `index.html` → `app.js` | `./app.js` | ✅ 正确 |
| `index.html` → `data.json` | `./data.json` | ✅ 正确 |
| `index.html` → `links.json` | `./links.json` | ✅ 正确 |

**绝对路径（如 `/data.json`）会导致 404**，我们的代码已经避免了这个问题。

---

## 三、部署步骤

### Step 1：推送代码到 GitHub

```bash
git add .
git commit -m "Add interactive timeline website"
git push origin main
```

### Step 2：开启 GitHub Pages

1. 打开仓库页面：https://github.com/Physics-Lee/Monthly_Table_of_LLM_Releasing
2. 点击顶部菜单 **Settings**
3. 左侧菜单找到 **Pages**
4. **Source** 选择 `Deploy from a branch`
5. **Branch** 选择 `main`
6. **Folder** 选择 `/(root)`
7. 点击 **Save**

### Step 3：等待部署

- 通常 **1-5 分钟** 后生效
- 首次部署可能需要稍久一点

### Step 4：访问网站

你的 Project Pages 地址是：

```
https://physics-lee.github.io/Monthly_Table_of_LLM_Releasing
```

### Step 5：更新 README 里的在线链接

1. 打开 `scripts/generate-readme.js`
2. 把 `ONLINE_URL` 改成真实地址：
   ```javascript
   const ONLINE_URL = 'https://physics-lee.github.io/Monthly_Table_of_LLM_Releasing';
   ```
3. 本地运行：
   ```bash
   node scripts/generate-readme.js
   ```
4. 再次 push：
   ```bash
   git add README.md scripts/generate-readme.js
   git commit -m "Update online URL to GitHub Pages"
   git push origin main
   ```

---

## 四、部署后验证清单

打开 `https://physics-lee.github.io/Monthly_Table_of_LLM_Releasing`，确认：

- [ ] 页面能正常加载，没有 404
- [ ] 表格完整显示 42 个月的数据
- [ ] 中文显示正常，没有乱码
- [ ] 厂商筛选器可以勾选/取消
- [ ] 年份筛选下拉框有效
- [ ] 搜索框能过滤模型
- [ ] 带链接的模型名是蓝色可点击的
- [ ] GitHub 按钮跳转正确
- [ ] 响应式布局正常（手机/桌面）

---

## 五、后续更新工作流

每次更新数据时：

1. 修改 `llm_release_timeline_2022-11_to_2026-04.csv`
2. 重新生成 `data.json` 和 `links.json`
3. 运行 `node scripts/generate-readme.js`
4. `git add . && git commit -m "更新至 2026-05" && git push origin main`
5. GitHub Pages 会在 push 后 **1-3 分钟** 自动更新

---

## 六、常见问题

### Q1：页面打开是 404？

可能原因：
- 刚开启 Pages，还没部署完成（等 5 分钟再试）
- `index.html` 不在仓库根目录（确认它在根目录）
- 仓库是私有的（GitHub Pages 支持私有仓库，但 404 通常是路径问题）

### Q2：样式或数据加载不出来？

- 按 F12 打开浏览器控制台
- 检查 Network 标签里是否有 404 错误
- 确认引用的是相对路径 `./xxx` 而不是绝对路径 `/xxx`

### Q3：国内用户访问慢/打不开？

这是 GitHub Pages 的已知问题。应对方案：
- 在 README 顶部写清楚"如访问不畅，请使用网络工具"
- 未来可以补一个 Gitee Pages 或 Coze 作为国内备用入口

### Q4：可以绑定自定义域名吗？

可以。Settings → Pages → Custom domain 里填写即可。但经典分支部署和 Actions 部署都支持自定义域名，不影响你的选择。

---

## 七、总结

| 步骤 | 操作 | 预计时间 |
|------|------|---------|
| 推送代码 | `git push origin main` | 10 秒 |
| 开启 Pages | Settings → Pages → main → /(root) → Save | 30 秒 |
| 等待部署 | 自动进行 | 1-5 分钟 |
| 更新 URL | 改 `ONLINE_URL` 再 push | 1 分钟 |
| **总计** | | **3-7 分钟** |

---

> 你的代码已经准备就绪，现在只需要 push 到 GitHub 并开启 Pages 即可。
