# AI21 Labs 与 Liquid AI 发展路线

> 本笔记整理两家公司的主要发布节点、数据来源及架构特点。
> 最后更新：2026-04-22

---

## AI21 Labs

### 基本信息

| 项目 | 内容 |
|------|------|
| 总部 | 以色列 |
| 成立 | 2017 年 |
| 累计融资 | $617M（Google、NVIDIA、Intel 等投资） |
| 官方博客 | https://www.ai21.com/blog |
| 核心产品线 | Jamba 系列（SSM-Transformer 混合架构） |

### 发布路线图

| 月份 | 发布内容 | 链接 |
|------|----------|------|
| 23-Mar | Jurassic-2 | - |
| 24-Mar | **Jamba**（首个 SSM-Transformer 混合架构，256K 上下文） | [官方博客](https://www.ai21.com/blog/jamba-a-new-hybrid-architecture-sets-a-new-milestone-in-the-open-source-community) |
| 24-Aug | Jamba 1.5 Mini + Large | [官方博客](https://www.ai21.com/blog/announcing-jamba-model-family/) |
| 25-Mar | Jamba 1.6 + Maestro（AI 规划编排系统） | [PR Newswire](https://www.prnewswire.com/news-releases/ai21-introduces-jamba-1-6--raising-the-bar-for-accuracy-and-speed-in-open-models-302394382.html) |
| 25-Jul | Jamba 1.7 | - |
| 25-Oct | Jamba Reasoning 3B | - |
| 26-Jan | **Jamba 2**（3B + Mini，Apache 2.0） | [官方博客](https://ai21.com/blog/introducing-jamba2) |
| 25-Nov | AI21 Maestro 正式版 | - |

### 架构特点

- **Jamba 架构**：SSM（状态空间模型）+ Transformer 的混合架构
  - Mamba 层与 Attention 层交错排列（比例约 1:7）
  - MoE（混合专家）层每两块出现一次
  - 优势：长上下文处理 + 高吞吐量
- **Jamba 1.5**：398B 总参，94B 活跃参数，256K 上下文
- **Jamba 1.6**：数据分类准确率比 1.5 提升 26%
- **Maestro**：AI 规划和编排系统，对标复杂任务的 Agent 编排

---

## Liquid AI

### 基本信息

| 项目 | 内容 |
|------|------|
| 总部 | 美国剑桥（MIT 分拆） |
| 成立 | 2024 年 |
| 创始人 | Ramin Hasani、Mathias Lechner、Alexander Amini、Daniela Rus（MIT CSAIL） |
| 融资 | $250M+ |
| 官方博客 | https://www.liquid.ai/blog |
| 核心产品线 | LFM 系列（液态神经网络，非 Transformer） |

### 发布路线图

| 月份 | 发布内容 | 链接 |
|------|----------|------|
| 24-Sep/Oct | **LFM 首发**（LFM-1B/3B/40B MoE） | [官方博客](https://liquid.ai/blog) |
| 25-Jul | **LFM2**（边缘最快模型，200% 吞吐量提升） | [官方新闻](https://www.liquid.ai/press/liquid-ai-releases-worlds-fastest-and-best-performing-open-source-small-foundation-models) |
| 26-Jan | **LFM2.5**（1.2B 系列，28T tokens 预训练） | [官方博客](https://liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai) |
| 26-Jan | LFM2.5-1.2B-Thinking（端侧推理模型，<1GB） | [官方博客](https://liquid.ai/blog/lfm2-5-1-2b-thinking-on-device-reasoning-under-1gb) |
| 26-Feb | LFM2-24B-A2B（最大规模 LFM2） | [官方博客](https://liquid.ai/blog/lfm2-24b-a2b-from-cloud-to-ai-pc) |
| 26-Mar | LFM2.5-350M | [官方博客](https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind) |
| 26-Apr | LFM2.5-VL-450M（视觉-语言模型） | [官方博客](https://liquid.ai/blog/lfm2-5-vl-450m) |

### 架构特点

- **液态神经网络（Liquid Neural Networks）**：灵感来自线虫（302 个神经元）
  - 用微分方程驱动神经元，推理时仍能继续学习、实时适应
  - 19 个神经元即可控制自动驾驶
- **LFM 架构**：Hybrid SSM，非纯 Transformer
- **核心竞争力**：边缘部署的高效小模型，强调 Intelligence Density（智能密度）
- **生态**：Hugging Face 开源（10M+ 下载）、LEAP 边缘部署平台、Apollo 应用

---

## 对比总结

| 维度 | AI21 Labs | Liquid AI |
|------|-----------|-----------|
| 成立时间 | 2017 年 | 2024 年 |
| 融资规模 | $617M | $250M+ |
| 架构路线 | SSM-Transformer 混合 | 液态神经网络 + Hybrid SSM |
| 核心优势 | 企业级长上下文 | 边缘/端侧高效部署 |
| 主攻市场 | 企业 AI（B2B） | 边缘 AI + 消费电子 |
| 开源力度 | Jamba 全系列开源 | LFM 全系列开源 |
| 发布节奏 | 几乎每月都有更新 | 集中在下半年爆发 |

---

## 相关笔记

- [LLM_APPS_RESEARCH.md](./LLM_APPS_RESEARCH.md) - LLM 应用研究
- [AI_INFRASTRUCTURE_RESEARCH.md](./AI_INFRASTRUCTURE_RESEARCH.md) - AI 基础设施研究
