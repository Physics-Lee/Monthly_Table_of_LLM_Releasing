# 自定义域名建议

> 目标：为 `Monthly_Table_of_LLM_Releasing` 选择一个合适的自定义域名
> 分析时间：2026-04-14

---

## 一、核心前提

使用 GitHub Pages 的自定义域名，需要：
1. **购买一个域名**（如 Namecheap、Cloudflare、阿里云、腾讯云等）
2. **配置 DNS 解析**（添加 CNAME 或 A 记录指向 GitHub）
3. **在仓库 Settings → Pages → Custom domain 里填写域名**
4. **可选：配置 HTTPS**（GitHub 会自动申请 Let's Encrypt 证书）

**注意**：如果主要用户在国内，域名需要**备案**才能稳定解析到国内服务器。但 GitHub Pages 服务器在国外，所以：
- 用自定义域名 + GitHub Pages **不需要国内备案**
- 国内访问速度依然取决于 GitHub Pages 的网络状况

---

## 二、域名命名策略

### 策略 1：项目直译型（最直观）

| 域名 | 说明 |
|------|------|
| `llm-timeline.com` | 简洁、直接 |
| `llm-releases.com` | 强调"发布" |
| `llm-release.com` | 单数形式，更短 |
| `model-timeline.com` | 更通用，不局限于 LLM |
| `aimodel-timeline.com` | 加入 AI 关键词 |

**优点**：一眼就知道网站是做什么的
**缺点**：`.com` 域名可能已被注册，价格较高

### 策略 2：个人品牌型

| 域名 | 说明 |
|------|------|
| `physics-lee.com` | 你的个人品牌主站 |
| `physicslee.com` | 去掉连字符 |
| `phylee.dev` | 程序员风格 |

**优点**：适合长期个人品牌建设
**缺点**：这个域名更适合做个人主页，而不是专门放 LLM 时间线

### 策略 3：子域名方案（如果已有主域名）

如果你已经买了 `physics-lee.com` 或类似的域名，可以直接开子域名：

| 子域名 | 说明 |
|--------|------|
| `llm.physics-lee.com` | **强烈推荐** |
| `timeline.physics-lee.com` | 也不错 |
| `ai.physics-lee.com` | 更通用 |

**优点**：
- 零额外成本（不需要再买新域名）
- 统一管理
- 子域名和主站品牌一致

### 策略 4：趣味/记忆型

| 域名 | 说明 |
|------|------|
| `model-radar.com` | 模型雷达 |
| `llm-radar.com` | LLM 雷达 |
| `aimodel-radar.com` | AI 模型雷达 |
| `release-radar.com` | 发布雷达 |
| `modelpulse.com` | 模型脉搏 |
| `llmpulse.com` | LLM 脉搏 |

**优点**：更有品牌感，容易记忆
**缺点**：含义不够直白，需要一定解释成本

### 策略 5：技术社区风格

| 域名 | 说明 |
|------|------|
| `llm-tracker.org` |  tracker 追踪器 |
| `model-tracker.org` | 更通用 |
| `llm-watch.org` | watch 观察者 |
| `openmodels.org` | 开源模型 |

**优点**：`.org` 通常比 `.com` 便宜，适合社区/开源项目
**缺点**：国内用户对 `.org` 的信任度略低于 `.com`

---

## 三、我的推荐排序

### 🥇 第一推荐：子域名方案
**`llm.physics-lee.com`**（或你现有的任何主域名）

理由：
- 成本最低
- 品牌统一
- 不需要额外管理一个域名
- 最适合"个人维护的信息站"定位

### 🥈 第二推荐：项目直译型
**`llm-timeline.com`** 或 **`llm-releases.com`**

理由：
- 含义明确，SEO 友好
- 适合长期运营
- 如果主要面向国际用户，这是最佳选择

### 🥉 第三推荐：趣味型
**`model-radar.com`** 或 **`llm-radar.com`**

理由：
- 更有记忆点
- 如果未来想扩展成"模型评测+发布追踪"的综合平台，这个品牌名更灵活

---

## 四、域名后缀选择

| 后缀 | 价格 | 适用场景 | 国内认可度 |
|------|------|---------|-----------|
| `.com` | ¥50-100/年 | 国际通用，首选 | ⭐⭐⭐⭐⭐ |
| `.net` | ¥60-100/年 | 技术类项目 | ⭐⭐⭐⭐ |
| `.org` | ¥60-100/年 | 开源/社区项目 | ⭐⭐⭐⭐ |
| `.dev` | ¥100-150/年 | 开发者项目 | ⭐⭐⭐⭐ |
| `.info` | ¥30-50/年 | 信息类网站 | ⭐⭐⭐ |
| `.co` | ¥150-300/年 | 创业公司风格 | ⭐⭐⭐⭐ |
| 国别域名（如 `.cn`） | ¥30-60/年 | 国内项目 | ⭐⭐⭐⭐⭐ |

**注意**：`.cn` 域名需要实名认证，如果解析到 GitHub Pages（国外服务器），理论上不需要备案，但部分 DNS 服务商可能有额外要求。

---

## 五、购买渠道推荐

| 平台 | 特点 | 适合人群 |
|------|------|---------|
| **Cloudflare Registrar** | 成本价注册，无溢价，管理方便 | 国际用户、有翻墙条件 |
| **Namecheap** | 价格便宜，隐私保护免费 | 国际用户 |
| **阿里云万网** | 国内最大，中文界面，.cn 便宜 | 国内用户 |
| **腾讯云 DNSPod** | 国内稳定，解析速度快 | 国内用户 |
| **GoDaddy** | 老牌，但续费贵 | 不太推荐 |

---

## 六、DNS 配置示例

假设你买了 `llm-timeline.com`，在 DNS 服务商处添加：

### 方案 A：CNAME 记录（推荐）

| 类型 | 主机记录 | 记录值 |
|------|---------|--------|
| CNAME | `@` 或 `www` | `physics-lee.github.io` |

然后在仓库 Settings → Pages → Custom domain 填写：
- `llm-timeline.com`（如果用 `@`）
- 或 `www.llm-timeline.com`（如果用 `www`）

### 方案 B：A 记录（如果用 apex 域名）

| 类型 | 主机记录 | 记录值 |
|------|---------|--------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

---

## 七、最终建议

### 如果你已经有主域名（如 `physics-lee.com`）

**直接用子域名 `llm.physics-lee.com`**
- 零额外成本
- 5 分钟配置完成
- 品牌和现有资产统一

### 如果你还没有任何域名

**先不买域名**，用 GitHub Pages 的默认地址：
```
https://physics-lee.github.io/Monthly_Table_of_LLM_Releasing
```

等网站运行一段时间、确认有持续维护价值后，再考虑购买 `llm-timeline.com` 或 `llm-releases.com`。

### 如果你现在就想买一个

**国际用户/长期运营**：`llm-timeline.com`
**国内用户/预算有限**：在阿里云买 `llm-timeline.cn` 或 `llm-releases.cn`
**个人品牌扩展**：`physics-lee.com` 主站 + `llm.physics-lee.com` 子域名

---

## 八、检查清单

配置自定义域名时确认：
- [ ] 域名已购买并完成实名认证
- [ ] DNS 解析已添加（CNAME 或 A 记录）
- [ ] 仓库 Settings → Pages → Custom domain 已填写
- [ ] 等待 DNS 生效（通常 5 分钟到 24 小时）
- [ ] 勾选 "Enforce HTTPS"（GitHub 会自动申请 SSL 证书）
- [ ] 更新 README 和 `generate-readme.js` 里的 `ONLINE_URL`
