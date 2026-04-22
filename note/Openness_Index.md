# Artificial Analysis Openness Index

> 本笔记整理 Artificial Analysis Openness Index 的评分维度、排名靠前的模型及关键洞察。
> 最后更新：2026-04-22

---

## 什么是 Openness Index

**Artificial Analysis Openness Index** 是 Artificial Analysis 发布的模型"开放性"评估体系，衡量一个模型有多"开源透明"。

**官网**：https://artificialanalysis.ai/evaluations/artificial-analysis-openness-index

---

## 评分维度

| 维度 | 含义 | 分值范围 |
|------|------|----------|
| **Model Availability** | 权重是否开放、API可访问性 | 0-6 |
| **Model Transparency** | 训练代码/方法是否公开 | 0-12 |
| **Pre-training Data Access** | 预训练数据是否可获取 | 0-3 |
| **Pre-training Data License** | 预训练数据许可证 | 0-3 |
| **Post-training Data Access** | 后训练数据是否可获取 | 0-3 |

总分标准化为 **0-100 分**，越高越开放。

---

## 评分细则（Model Availability 为例）

| 分值 | 开放程度 |
|------|----------|
| 0 | 闭源，无公开API |
| 1 | 闭源，有API但限制token可见性 |
| 2 | 闭源，有公开API |
| 3 | **开源权重** |

---

## 排名靠前的模型

| 排名 | 模型 | 开放指数 | 机构 |
|------|------|----------|------|
| 1 | **Apertus 70B Instruct** | 100 | Apeirx |
| 1 | **Apertus 8B Instruct** | 100 | Apeirx |
| 3 | **Olmo 3 7B Instruct** | 89 | AI2 |
| 4 | **Olmo 3.1 32B Instruct** | 88.89 | AI2 |
| 4 | **Molmo 7B-D** | 88.89 | AI2 |
| 4 | **Olmo 3.1 32B Think** | 89 | AI2 |
| - | NVIDIA Nemotron Nano 9B v2 | 67 | NVIDIA |
| - | Llama 3/4 系列 | 60-70 | Meta |
| - | DeepSeek V3 | 60-70 | DeepSeek |

## 排名垫底的模型

| 模型 | 开放指数 | 机构 |
|------|----------|------|
| **o3** | 6 | OpenAI |
| **Gemini 2.5 Pro** | 6 | Google |
| **Gemini 2.5 Flash-Lite** | 6 | Google |

---

## 关键洞察

### 1. AI2 霸榜开放性

AI2（Allen Institute for AI）的 OLMo 和 Molmo 系列是当时最透明的模型家族。OLMo 3.1 32B Think 得分 89，是综合表现最好的模型。

**原因**：OLMo 系列不仅开源权重，还公开了完整的训练数据（Dolma）、训练代码（OLMo）、评估方法（OLMES）和训练配方（Recipe），真正实现"全流程可复现"。

### 2. Apertus 满分

Apertus 是一个专门做完全开源的创业公司，70B 和 8B 均达满分 100，意味着在所有维度均达到最高开放标准。

### 3. 闭源巨头垫底

OpenAI o3 和 Google Gemini 2.5 系列仅得 6 分，属于"闭源+API限制token可见性"。

### 4. Llama/DeepSeek 权重开放但数据不透明

Meta Llama 和 DeepSeek 的权重是开放的，但训练数据未公开，因此在 Pre-training Data Access 和 Post-training Data Access 两个维度失分，总分约 60-70。

---

## 开放性 vs 智能性

开放性高的模型不一定性能最强，智能性（Intelligence Index）和开放性往往存在 tradeoff：

| 模型 | 开放指数 | 智能指数 | 特点 |
|------|----------|----------|------|
| OLMo 3.1 32B Think | 89 | 12.16 | 透明且聪明 |
| GPT-4o | 低 | 高 | 闭源但强大 |
| o3 | 6 | 极高 | 极封闭但推理能力强 |

---

## 为什么这个指标重要

1. **可复现性**：开放训练数据意味着任何人都能验证模型训练过程
2. **可信度**：透明度高的模型更容易被信任用于关键场景
3. **推动行业**：为"真开源"设立标准，防止"伪开源"混淆视听
4. **合规需求**：某些场景需要可审计的AI系统

---

## 相关笔记

- [AI21_LiquidAI_roadmap.md](./AI21_LiquidAI_roadmap.md) - AI21 Labs 与 Liquid AI 发展路线
- [BJ_SH_AI_Institutions.md](./BJ_SH_AI_Institutions.md) - 北京上海AI研究机构与国际同类机构
- [LLM_APPS_RESEARCH.md](./LLM_APPS_RESEARCH.md) - LLM 应用研究
- [AI_INFRASTRUCTURE_RESEARCH.md](./AI_INFRASTRUCTURE_RESEARCH.md) - AI 基础设施研究
