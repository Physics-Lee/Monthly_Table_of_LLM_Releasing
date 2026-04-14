# GitHub Pages 多仓库使用指南

> 问题：已经有 `physics-lee.github.io` 仓库用了 GitHub Pages，还能给其他仓库开 Pages 吗？
> 回答：**完全可以！**

---

## 一、GitHub Pages 的两种类型

### 1. User/Organization Pages（用户/组织站点）

- **仓库名**：必须是 `用户名.github.io`（你的就是 `physics-lee.github.io`）
- **域名**：`https://physics-lee.github.io`
- **内容来源**：通常只从一个仓库构建
- **用途**：个人主页、博客主站

### 2. Project Pages（项目站点）

- **仓库名**：任意仓库都可以开
- **域名**：`https://physics-lee.github.io/仓库名`
- **每个仓库都能独立开启 Pages**
- **用途**：各个项目的独立展示页

---

## 二、核心结论

**一个 GitHub 账号可以开无数个 Project Pages。**

你的 `physics-lee.github.io` 是 User Pages，它不影响其他任何仓库开启 Project Pages。

所以你的 `Monthly_Table_of_LLM_Releasing` 仓库完全可以开 Pages，地址会是：

```
https://physics-lee.github.io/Monthly_Table_of_LLM_Releasing
```

---

## 三、如何为你的新仓库开启 GitHub Pages

### 步骤 1：确保代码在仓库里

你的仓库：`https://github.com/Physics-Lee/Monthly_Table_of_LLM_Releasing`

需要把这些文件推送到仓库根目录或 `gh-pages` 分支：
- `index.html`
- `styles.css`
- `app.js`
- `data.json`
- `links.json`
- `README.md`

### 步骤 2：开启 Pages

1. 打开仓库页面 → 点击 **Settings**
2. 左侧菜单找到 **Pages**
3. **Source** 选择：
   - **Deploy from a branch**（从分支部署）
   - 选择 `main` 分支
   - 文件夹选择 `/(root)`
4. 点击 **Save**

### 步骤 3：等待部署

- 通常 1-5 分钟后生效
- 访问地址：`https://physics-lee.github.io/Monthly_Table_of_LLM_Releasing`

---

## 四、需要注意的问题

### 问题 1：国内访问不稳定

这是 GitHub Pages 的通病，部分地区可能需要翻墙才能访问。

**应对方案**：
- 在 README 里写清楚"如访问不畅，请使用网络工具"
- 或者同时部署到 Gitee Pages / Coze 作为国内备用入口

### 问题 2：Project Pages 的路径问题

Project Pages 的 URL 是 `https://用户名.github.io/仓库名/`，这意味着：

- 如果你的代码里写了**绝对路径**（如 `/data.json`），会 404
- 必须用**相对路径**（如 `./data.json` 或 `data.json`）

**检查我们的代码**：
- `index.html` 里引用的是 `./styles.css`、`./app.js`、`./data.json`、`./links.json` ✅
- 全部是相对路径，没问题

### 问题 3：自定义域名

Project Pages 也支持绑定自定义域名：
- 在仓库 Settings → Pages → Custom domain 里设置
- 但同样需要备案（国内）

---

## 五、GitHub Pages vs Coze vs Gitee Pages 对比

| 维度 | GitHub Pages | Coze | Gitee Pages |
|------|-------------|------|------------|
| **费用** | ¥0 | ¥0 | ¥0 |
| **国内访问** | ⚠️ 不稳定 | ✅ 快 | ✅ 极快 |
| **平台水印** | ❌ 无 | ⚠️ 可能有 | ❌ 无 |
| **自定义域名** | ✅ 支持 | ❌ 个人版不支持 | ✅ 支持 |
| **自动部署** | ✅ push 即部署 | ❌ 需手动上传 | ✅ push 即部署 |
| **技术门槛** | 低 | 低 | 低 |
| **与 Git 集成** | 原生支持 | 弱 | 原生支持 |

---

## 六、推荐策略

既然你决定用 GitHub Pages，建议采用 **"主站 GitHub Pages + 备用国内入口"** 的策略：

### 方案 A：纯 GitHub Pages（最简单）
- 直接推送到 `Monthly_Table_of_LLM_Releasing`
- 开启 Pages
- 接受国内访问不稳定的事实
- 适合主要用户群体在国外的场景

### 方案 B：GitHub Pages + Gitee Pages 双部署（最优）
- **GitHub Pages**：主仓库推送，自动部署，积累 Star
- **Gitee Pages**：同步推送到 Gitee 仓库，国内用户访问快
- 两个入口都在 README 里标明

### 方案 C：GitHub Pages + Coze 备用
- **GitHub Pages**：主入口，push 即更新
- **Coze**：每月手动上传一次，作为国内备用入口

---

## 七、下一步行动

如果你确定用 **GitHub Pages**，需要做的：

1. **把当前写好的文件推送到仓库**
   ```bash
   git add .
   git commit -m "Add interactive timeline website"
   git push origin main
   ```

2. **在仓库 Settings → Pages 里开启**
   - Source: `main` branch, `/(root)`

3. **等待 1-5 分钟**
   - 访问 `https://physics-lee.github.io/Monthly_Table_of_LLM_Releasing`

4. **更新 README 里的在线链接**
   - 把 `scripts/generate-readme.js` 里的 `ONLINE_URL` 改成真实地址
   - 重新运行 `node scripts/generate-readme.js`
   - 再 push 一次

---

## 八、总结

> **GitHub Pages 不是只能一个仓库用。**
> 
> `physics-lee.github.io` 是你的 User Pages 主站，而 `Monthly_Table_of_LLM_Releasing` 可以独立开启 Project Pages，地址是 `https://physics-lee.github.io/Monthly_Table_of_LLM_Releasing`。

唯一的缺点是**国内访问可能不稳定**。如果你的主要用户在国内，建议未来再补一个 Gitee Pages 或 Coze 作为备用入口。
