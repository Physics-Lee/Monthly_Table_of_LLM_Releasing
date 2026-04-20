# LLM-Apps 列预研笔记

## 定义标准

**必须同时满足：**
1. **不自研基础模型** — 不训练/微调 LLM 作为自己的核心产品（可以调用第三方 API）
2. **不开源** — 闭源商业产品

**排除：**
- 模型厂商自己做的应用（ChatGPT、Claude Code、Gemini App）
- 自研模型的产品（Midjourney、Runway、Suno、Character.AI）
- 开源工具（Ollama、vLLM、LangChain）

---

## 候选产品清单

### ✅ 确定符合标准

| 产品 | 类别 | 说明 |
|---|---|---|
| **Cursor** | AI 编辑器 | 调用 Claude/GPT-4/o3，纯应用层，闭源 |
| **Windsurf** | AI 编辑器 | Codeium 出品，调用第三方模型，闭源 |
| **GitHub Copilot** | AI 编程助手 | 调用 OpenAI Codex/GPT-4，微软不自研 Copilot 模型，闭源 |
| **Perplexity** | AI 搜索 | 调用 Claude/GPT-4/Gemini/Llama 等，不自研，闭源 |
| **Manus** | AI Agent | 调用 Claude/GPT-4 等，编排层，不自研，闭源 |
| **Poe** | AI 聚合平台 | Quora 出品，聚合各家模型，不自研，闭源 |
| **Jasper** | AI 写作 | 早期调用 GPT-3，现在多模型，不自研，闭源 |
| **Copy.ai** | AI 写作 | 调用第三方模型，不自研，闭源 |
| **Notion AI** | AI 文档 | 调用第三方模型（OpenAI/Anthropic），不自研，闭源 |
| **Grammarly** | AI 写作辅助 | 调用第三方模型，不自研，闭源 |
| **Gamma** | AI PPT | 调用第三方模型，不自研，闭源 |
| **Tome** | AI PPT | 调用第三方模型，不自研，闭源 |
| **Replit Ghostwriter** | AI 编程 | 调用第三方模型，不自研，闭源 |
| **Sourcegraph Cody** | AI 编程 | 调用第三方模型，不自研，闭源 |
| **Arc Max** | AI 浏览器 | The Browser Company，调用第三方模型，闭源 |
| **Raycast AI** | AI 效率工具 | 调用第三方模型，闭源 |

### ❌ 排除（自研模型）

| 产品 | 排除原因 |
|---|---|
| **Midjourney** | 自研扩散模型（非LLM但自研） |
| **Runway** | 自研视频生成模型 |
| **Suno** | 自研音乐生成模型 |
| **Udio** | 自研音乐生成模型 |
| **Character.AI** | 自研对话模型（基于 LaMDA 技术） |
| **Pi** | Inflection AI 自研模型 |
| **You.com / YouChat** | 自研搜索+对话模型 |
| **Amazon CodeWhisperer / Amazon Q** | 基于 Amazon Titan 自研模型 |
| **Claude Code** | Anthropic 自家模型应用 |
| **ChatGPT** | OpenAI 自家模型应用 |
| **Gemini App** | Google 自家模型应用 |
| **Grok** | xAI 自家模型应用 |
| **Meta AI** | Meta 自家模型应用 |

### ⚠️ 边界模糊（需进一步确认）

| 产品 | 模糊点 |
|---|---|
| **Tabnine** | 早期自研小模型，现在混合第三方+自研，可能不符合"不自研" |
| **Leonardo.ai** | 图像生成，部分功能调用 SD，部分可能自研 |
| **HeyGen** | 数字人视频，可能混合第三方+自研 |
| **Phind** | 开发者搜索，早期调用 GPT-4，后声称自研部分能力 |
| **Kimi 浏览器插件** | Moonshot 自家产品，❌ |
| **豆包 APP** | 字节自家产品，❌ |
| **文心一言 APP** | 百度自家产品，❌ |
| **讯飞星火 APP** | 讯飞自家产品，❌ |

---

## 推荐首批加入的（最知名/最有代表性）

按领域分类：

**编程/开发：**
1. **Cursor** — 最知名的 AI 编辑器
2. **Windsurf** — Codeium 出品，Cursor 竞品
3. **GitHub Copilot** — 最知名的 AI 编程助手
4. **Replit Ghostwriter** — 在线 IDE 的 AI 功能

**搜索/知识：**
5. **Perplexity** — AI 搜索代表
6. **Poe** — AI 聚合聊天平台

**Agent/自动化：**
7. **Manus** — AI Agent 代表（如果持续有热度）

**写作/内容：**
8. **Jasper** — 早期 AI 写作代表
9. **Notion AI** — 知识管理+AI
10. **Grammarly** — 写作辅助+AI

**生产力：**
11. **Gamma** — AI PPT
12. **Raycast AI** — 效率工具

---

## 技术边界讨论

### "不自研模型"的灰色地带

**问题 1：微调算不算自研？**
- 如果产品方对开源模型做了大量微调（如 Llama → 自己的产品），算不算自研？
- **建议**：如果模型权重不公开、且以公司品牌发布（如"XX模型"），算自研；如果只是内部微调优化体验、仍叫 Llama/GPT，不算自研。

**问题 2：蒸馏模型算不算自研？**
- 如用 GPT-4 输出训练自己的小模型
- **建议**：算自研（因为产生了新的模型权重）。

**问题 3：RAG + 提示工程算不算自研？**
- 如 Perplexity 的搜索+RAG pipeline
- **建议**：不算自研，因为核心推理仍依赖第三方模型，没有训练新模型。

### 为什么需要这列？

当前表格只记录**模型发布**，但用户更关心的是**能用到的产品**。LLM-Apps 这列填补了"应用层"的空白，帮助读者理解：
- 哪些产品是基于第三方模型的
- 模型能力如何转化为终端产品
- 应用层和模型层的分工

---

## 结论

**列名**：`LLM-Apps`（或 `LLM-Applications`）

**首批加入（建议 8-10 个最具代表性的）：**

| 时间 | 产品 |
|---|---|
| 2021-06 | GitHub Copilot (技术预览) |
| 2023-01 | Jasper |
| 2023-02 | Poe |
| 2023-03 | Grammarly AI |
| 2023-08 | Perplexity Pro |
| 2023-11 | Cursor |
| 2024-01 | Gamma |
| 2024-03 | Windsurf |
| 2025-03 | Manus |

**注意**：这列的产品发布时间难以精确到月（很多是渐进式发布），建议只记录首次公开/重大版本发布。

---

*预研日期：2026-04-20*
