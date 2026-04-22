# AI2 与 Apertus：两个满分透明度的机构

> 本笔记整理 AI2（Allen Institute for AI）和 Apertus（Swiss AI Initiative）的基本信息、代表模型及开放性特点。
> 最后更新：2026-04-22

---

## 一、AI2（Allen Institute for AI）

| 项目 | 内容 |
|------|------|
| 全称 | Allen Institute for AI |
| 简称 | AI2、Ai2 |
| 成立 | **2014年** |
| 创始人 | 保罗·艾伦（微软联合创始人） |
| 地址 | 美国西雅图 |
| 官网 | https://allenai.org/ |
| 性质 | 非营利研究机构（501(c)(3)） |

### 使命

> "Advance AI through true openness" — 推动AI发展的同时保持完全透明

AI2 的核心理念是"真开源"：不只是开放权重，而是开放**数据+代码+权重+训练配方+评估方法**，让任何人都能完整复现模型训练过程。

### 代表模型

| 模型 | 发布时间 | 说明 |
|------|----------|------|
| **OLMo** | 2024-02 | 首个全流程开源模型，开放所有训练组件 |
| **OLMo 2** | 2024-11 | 7B/13B，号称"当时完全开源最强" |
| **OLMo 2 32B** | 2025-03 | 首个全开源超越GPT-3.5/4o mini的模型 |
| **OLMoE** | 2024-09 | MoE架构，完全开源 |
| **Tülu 3** | 2024-11 | 指令微调系列，8B/70B/405B |
| **Tülu 3 405B** | 2025 | 全开源后训练应用于最大规模 |
| **Molmo** | 2024 | 多模态开源模型 |
| **Molmo 2** | 2025 | 视频-语言模型家族 |
| **OLMo 3** | 2025-11 | 7B/32B，Base+Instruct+Think+RL Zero完整系列 |
| **OLMo 3.1** | 2025-12 | 32B Think 在 Artificial Analysis 开放性指数排名第一 |

### 核心数据与工具

| 产出 | 说明 |
|------|------|
| **Dolma** | 3T token英文语料库（OLMo 3用5.9T） |
| **OLMES** | 评测基准 |
| **Open LLM Leaderboard** | AI2维护的权威开源模型榜单 |
| **LM Evaluation Harness** | 通用LLM评测框架，12K+ stars |

### 开放性指数得分

- **OLMo 3.1 32B Instruct/Think**：88.89-89
- 在 Artificial Analysis Openness Index 中排名前列

### 地位

AI2 被认为是**与 BAAI 结构最相似的机构**——非营利、政府/ philanthropist背书、专注开源透明。只不过 AI2 比 BAAI 早成立4年，在"全流程开源"这件事上走得最彻底。

---

## 二、Apertus（Swiss AI Initiative）

| 项目 | 内容 |
|------|------|
| 全称 | Swiss AI Initiative |
| 简称 | Apertus |
| 成立 | **2025年9月2日**（正式发布） |
| 依托 | **EPFL + ETH Zurich + CSCS**（瑞士联邦理工+国家超算中心） |
| 官网 | https://apertus.ai/ |
| 性质 | 国家AI研究项目 |

### 使命

> "Provide a blueprint for how a trustworthy, sovereign and inclusive AI model can be developed" — 打造可信赖、主权在手的开源AI范式

Apertus 是瑞士国家AI战略的产物，强调**主权AI**（Sovereign AI）——在欧洲AI Act框架下开发，确保数据合规、透明度高、不依赖美国巨头。

### 代表模型

| 模型 | 发布时间 | 说明 |
|------|----------|------|
| **Apertus 70B** | 2025-09 | 旗舰版，700亿参数 |
| **Apertus 8B** | 2025-09 | 轻量版，80亿参数 |

### 关键数据

| 指标 | 数值 |
|------|------|
| 训练数据量 | 15T tokens |
| 语言覆盖 | 1000+语言 |
| 许可证 | **Apache 2.0** |
| 开发者 | EPFL、ETH Zurich、CSCS |
| 生态合作 | Hugging Face、Swisscom |

### 开放性指数得分

- **Apertus 70B Instruct**：**100分（满分）**
- **Apertus 8B Instruct**：**100分（满分）**

在 Artificial Analysis Openness Index 中 Apertus 是**唯一拿到满分100的模型**，意味着它在所有开放性维度均达到最高标准。

### 与 AI2 的区别

| 维度 | AI2 | Apertus |
|------|------|---------|
| 成立 | 2014年 | 2025年 |
| 依托 | 保罗·艾伦（ philanthropist） | 瑞士政府+联邦理工 |
| 机构性质 | 美国非营利 | 瑞士国家AI战略 |
| 核心使命 | AI透明+可复现 | 主权AI+合规 |
| 模型规模 | OLMo 3-32B | Apertus 70B/8B |
| 开放指数 | 88.89 | **100** |

---

## 三、两者共同点

1. **非营利/国家背书** — 都不是商业公司驱动的AI开发
2. **完全开源** — 权重+代码+数据全公开
3. **开放性指数极高** — 89和100分，远超 Llama/DeepSeek 的60-70分
4. **学术机构主导** — EPFL/ETH、AI2均依托顶级学术资源
5. **有对应追踪表位置** — 和 BAAI 同一类型，可以放在 Open-Source 或新列

---

## 四、是否值得加入追踪表

| | AI2 | Apertus |
|---|---|---|
| 代表作 | OLMo、Tülu、Molmo | Apertus 70B/8B |
| 发布节奏 | 密集（几乎每月） | 刚起步 |
| 知名度 | 高 | 中（增长中） |
| 建议 | ✅ 加入 | ✅ 加入（和AI2同期参考） |

两者都与 BAAI 性质相似，代表"国家/学术背书的非营利开源AI"，适合作为 Open-Source 列的补充，或新增独立列。

---

## 五、开源对比

> 本表格对比各知名模型在 **数据、代码、权重、训练方法、评估方法** 五个维度的开放程度。
> ✅ = 完全开放，⚠️ = 部分开放，❌ = 未公开

| 模型 | 数据 | 代码 | 权重 | 训练方法 | 评估方法 | 说明 |
|------|------|------|------|----------|----------|------|
| **OLMo 3 (AI2)** | ✅ Dolma 语料库 | ✅ OLMo-core | ✅ | ✅ 完整配方 | ✅ OLMES | 全流程完全透明，开放检查点 |
| **Apertus 70B** | ✅ 合规语料库 | ✅ transformers | ✅ | ✅ 完整配方 | ✅ | 满分100，开源最彻底 |
| **DeepSeek V3/R1** | ⚠️ 模糊说明 | ✅ 推理代码 | ✅ MIT | ⚠️ 技术报告 | ⚠️ 部分 | 权重开放，但训练数据未完整公开 |
| **Llama 3 (Meta)** | ⚠️ 论文披露 | ⚠️ 推理代码 | ✅ | ⚠️ 论文描述 | ⚠️ 论文描述 | 有论文《The Llama 3 Herd of Models》 |
| **Llama 4 (Meta)** | ❌ | ❌ | ✅ | ❌ | ❌ | 仅开放权重，训练流程封闭 |
| **Qwen 3.5 (阿里)** | ⚠️ 语料来源说明 | ✅ 部分开源 | ✅ Apache 2.0 | ⚠️ 技术报告 | ✅ | 权重和评测较透明 |
| **Mistral Small 3** | ❌ | ❌ | ✅ | ❌ | ❌ | 仅开放权重 |
| **GLM-4 (智谱)** | ⚠️ 论文披露 | ✅ | ✅ Apache 2.0 | ⚠️ 论文描述 | ⚠️ 论文描述 | THUDM开源，权重+推理代码 |
| **Kimi K2.6 (月之暗面)** | ⚠️ 论文披露 | ✅ | ✅ | ⚠️ 论文描述 | ⚠️ 论文描述 | 26年4月开源，有技术报告 |
| **MiniMax-M1** | ✅ 技术报告 | ✅ | ✅ Apache 2.0 | ✅ | ✅ | 权重+训练代码+评估全开放 |
| **Step-3.5 Flash (阶跃星辰)** | ✅ 技术报告 | ✅ | ✅ Apache 2.0 | ✅ 训练框架 | ⚠️ 部分 | 预训练权重+Steptron框架全放 |
| **Gemma 3 (Google)** | ❌ | ❌ | ✅ | ❌ | ❌ | 仅开放权重 |

### 维度说明

| 维度 | 含义 |
|------|------|
| **数据** | 预训练/微调所使用的语料库是否公开 |
| **代码** | 训练/推理代码是否开源 |
| **权重** | 模型权重是否开放下载 |
| **训练方法** | 训练配方（超参、课程学习、RL流程等）是否公开 |
| **评估方法** | 评测基准、测试集、评估脚本是否公开 |

### 透明度分级

| 等级 | 代表模型 | 特征 |
|------|----------|------|
| **S级（90+）** | OLMo 3, Apertus | 五维全开放，可完整复现 |
| **A级（70-89）** | DeepSeek, Qwen | 权重+部分训练细节，核心数据未公开 |
| **B级（50-69）** | Llama, Gemma, Mistral | 仅开放权重，训练流程黑箱 |

---

## 相关笔记

- [Openness_Index.md](./Openness_Index.md) - Artificial Analysis Openness Index 详解
- [AI21_LiquidAI_roadmap.md](./AI21_LiquidAI_roadmap.md) - AI21 Labs 与 Liquid AI 发展路线
- [BJ_SH_AI_Institutions.md](./BJ_SH_AI_Institutions.md) - 北京上海AI研究机构与国际同类机构
- [LLM_APPS_RESEARCH.md](./LLM_APPS_RESEARCH.md) - LLM 应用研究
- [AI_INFRASTRUCTURE_RESEARCH.md](./AI_INFRASTRUCTURE_RESEARCH.md) - AI 基础设施研究
