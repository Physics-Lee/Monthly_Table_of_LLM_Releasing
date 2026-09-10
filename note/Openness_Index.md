# Artificial Analysis Openness Index

> 本笔记整理 Artificial Analysis Openness Index 的评分维度、排名靠前的模型及关键洞察。
> 最后更新：2026-09-08
> 更正（2026-09-08）：此前记录的"Apertus 满分 100"有误——线上实为 88.89，与 OLMo 3 并列榜首；原始分为 18 分制（非 27 分制），16/18 = 88.89。

---

## 什么是 Openness Index

**Artificial Analysis Openness Index** 是 Artificial Analysis 发布的模型"开放性"评估体系，衡量一个模型有多"开源透明"。

**官网**：https://artificialanalysis.ai/evaluations/artificial-analysis-openness-index

---

## 评分维度

| 维度 | 含义 | 分值范围 |
|------|------|----------|
| **Model Availability** | 权重是否开放下载、权重许可证 | 0-6（权重获取 0-3 + 权重许可 0-3） |
| **Model Transparency** | 数据要素 + 方法披露（下方四个 Data 子维度计入本项的数据要素部分） | 0-12（预/后训练数据要素取平均 0-6 + 方法披露 0-3 + 方法许可 0-3） |
| **Pre-training Data Access** | 预训练数据是否可获取 | 0-3 |
| **Pre-training Data License** | 预训练数据许可证 | 0-3 |
| **Post-training Data Access** | 后训练数据是否可获取 | 0-3 |
| **Post-training Data License** | 后训练数据许可证 | 0-3 |

原始分满分 **18 分**（Availability 6 + Transparency 12），标准化为 **0-100 分**（16/18 = 88.89），越高越开放。

**数据许可评分档**：3 分 = 商用无需署名、无实质限制（CC0 级）；1 分 = 商用需署名（CC-BY / ODC-BY 级）。OLMo 与 Apertus 的数据许可均在此档（各得 1/3），这是榜首模型唯一的失分点。

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
| 1 | **Olmo 3 / 3.1 系列（Instruct/Think）** | 88.89 | AI2 |
| 1 | **Apertus 70B / 8B Instruct** | 88.89 | Swiss AI Initiative |
| 1 | **K2 Think V2 / K2-V2（high/medium/low）** | 88.89 | MBZUAI |
| - | **Molmo 7B-D** | 88.89 | AI2 |
| - | NVIDIA Nemotron Nano 9B v2 | 67 | NVIDIA |
| - | Llama 3/4 系列 | 60-70 | Meta |
| - | DeepSeek V3 | 60-70 | DeepSeek |

榜首前 14 名并列 88.89（MBZUAI K2 系列 4 个变体、OLMo 3/3.1 家族、Apertus 70B/8B 等），成分分完全一致：权重、方法、数据获取全部满分，仅预训练/后训练数据许可各扣 2 分（"商用需署名"档各得 1/3）。该指数发布时官方明确**没有任何模型拿到满分**——满分要求训练语料达到 CC0 级许可，而语料大量来自署名许可来源，法律上几乎不可行。

## 排名垫底的模型

| 模型 | 开放指数 | 机构 |
|------|----------|------|
| **o3** | 6 | OpenAI |
| **Gemini 2.5 Pro** | 6 | Google |
| **Gemini 2.5 Flash-Lite** | 6 | Google |

---

## 关键洞察

### 1. 榜首并列：AI2 / Apertus / MBZUAI

AI2 的 OLMo/Molmo 系列、瑞士 Apertus、阿联酋 K2 Think V2 并列第一（88.89-89），成分分完全相同。

**原因**：OLMo 系列不仅开源权重，还公开了完整的训练数据（Dolma）、训练代码（OLMo）、评估方法（OLMES）和训练配方（Recipe），真正实现"全流程可复现"。

### 2. 榜首无人满分，失分全在数据许可

Apertus（Swiss AI Initiative：EPFL + ETH Zurich + CSCS 的瑞士国家项目，**非创业公司**）70B/8B 得分 88.89，与 OLMo 3 完全同级。两家唯一失分点相同：数据许可为"商用需署名"档。100 分需要 CC0 级数据许可，基本是理论值。

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
