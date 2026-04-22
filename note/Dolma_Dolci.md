# Dolma 与 Dolci：AI2 的开源数据集

> 本笔记详细介绍 AI2（Allen Institute for AI）公开的 Dolma（预训练数据集）和 Dolci（后训练数据集）。
> 最后更新：2026-04-22

---

## 概述

| | Dolma | Dolci |
|---|---|---|
| 用途 | 预训练（学习语言规律） | 后训练（教模型怎么回答） |
| 类型 | 原始语料库 | 指令微调数据集 |
| 规模 | 3T tokens（OLMo 3 用 5.9T） | 200万+ 样本 |
| 许可证 | ODC-BY | ODC-BY / CC BY-SA |
| 发布方 | AI2 | AI2 |
| 能否商用 | ✅ 可（需署名） | ✅ 可（部分CC BY-SA需相同方式共享） |
| 下载地址 | Hugging Face | Hugging Face |

---

## 一、Dolma（预训练数据集）

### 基本信息

- **全称**：Data to Olivaw Language Model Architecture
- **发布时间**：2023年8月
- **论文**：[Dolma: A 3 Trillion Token Open Corpus](https://arxiv.org/abs/2402.00159)
- **规模**：3T tokens（OLMo 3 扩展到 5.9T）
- **许可证**：ODC-BY

### 数据来源

Dolma 来自约 **200TB 原始文本**，经过清洗最终得到约 **11TB** 可用数据：

| 来源 | 详情 |
|------|------|
| **Common Crawl** | 24个快照（2020-05 至 2023-06） |
| **Semantic Scholar**（peS2o） | 3800万学术论文 |
| **C4** | 清洗后的网页文本 |
| **Reddit** | 高赞帖子（用于质量信号） |
| **The Pile** | 部分高质量子集 |
| **Wikipedia** | 百科全书 |
| **Books** | 书籍 |
| **GitHub** | 开源代码 |

### 清洗流程

```
原始数据（200TB）
    ↓
去重（模糊去重 + 精确去重）
    ↓
质量过滤（语言识别、长度、毒性）
    ↓
安全过滤（个人信息移除）
    ↓
Dolma（11TB / 3T tokens）
```

### 为什么重要

1. **首个真正开放的大规模预训练语料** — 多数开源模型只放权重，不放训练数据；Dolma 首次把 3T tokens 的完整训练数据公开
2. **推动可复现研究** — 任何人都能用 Dolma 从头训练模型，验证 AI2 的训练方法
3. **ODC-BY 许可证** — 商业可用，只需署名，降低了学术和商业研究的门槛

### 版本历史

| 版本 | 时间 | 规模 | 用于 |
|------|------|------|------|
| Dolma v1.5 | 2023-10 | 3T tokens | OLMo 1B |
| Dolma v1.7 | 2024-04 | 4.5T | OLMo 7B v1.7 |
| Dolma（OLMo 3用） | 2025-11 | 5.9T | OLMo 3 |

---

## 二、Dolci（后训练数据集）

### 基本信息

- **用途**：训练 OLMo 的后训练阶段（指令微调 + 偏好优化）
- **组成**：多个子集的混合（Mixture）

### Dolci 家族

| 数据集 | 用途 | 规模 | 说明 |
|--------|------|------|------|
| **Dolci-Instruct-SFT** | 监督微调（SFT） | 215万样本 | 核心指令数据 |
| **Dolci-Instruct-Tool-Use** | 工具使用 | 22.7万样本 | 函数调用任务 |
| **Dolci-Instruct-Verifiable-Reasoning** | 可验证推理 | 31万样本 | 数学/逻辑推理 |
| **Dolci-Instruct-Hardcoded** | 边界案例 | 69条 | 极端指令 |

### 数据来源

Dolci 的数据来自多个公开数据集的精选和重组：

| 来源 | 说明 |
|------|------|
| **Tülu 3** | AI2 早期的后训练数据 |
| **Open-Instruct** | 通用指令数据集 |
| **WizardLM** | 进化指令 |
| **OpenMathInstruct** | 数学推理 |
| **PRISM** | 多样化提示 |
| **LIMA** | 高质量精选响应 |
| **AI2 自建** | 新构建的工具使用和推理数据 |

### 为什么重要

1. **完全开放的后训练配方** — 多数模型的 SFT/RLHF 数据是闭源的，Dolci 首次把完整的后训练数据公开
2. **可验证的推理数据** — 包含带标准答案的数学题，确保模型推理可验证
3. **工具使用能力** — 专门的函数调用数据，让模型学会使用外部工具

---

## 三、AI2 的开源哲学

AI2 提出的"真正开放"（True Openness）包含 **6 个维度**：

| 维度 | 含义 | 大多数开源模型 | AI2 OLMo |
|------|------|---------------|---------|
| 权重开放 | 模型权重可下载 | ✅ | ✅ |
| 代码开放 | 训练代码公开 | ✅ | ✅ |
| **数据开放** | 预训练数据公开 | ❌ | ✅ |
| **配方开放** | 训练方法公开 | ❌ | ✅ |
| **评估开放** | 评测基准公开 | ❌ | ✅ |
| **后训练数据开放** | SFT/RLHF数据公开 | ❌ | ✅ |

这就是为什么 AI2 在 Artificial Analysis Openness Index 上能拿到 89 分 — 他们在每一个维度都做到了开放。

---

## 四、相关工具链

AI2 不仅公开数据集，还公开了配套工具：

| 工具 | 说明 |
|------|------|
| **OlmoCore** | 训练框架 |
| **Duplodocus** | 模糊去重工具 |
| **Datamap-rs** | 大规模数据清洗 |
| **OLMES** | 评测基准（Benchmark） |
| **Decon** | 测试集去除工具 |
| **Open Instruct** | 后训练 pipeline |

---

## 五、与其他数据集的对比

| 数据集 | 规模 | 开放程度 | 商业可用 |
|--------|------|----------|----------|
| **Dolma** | 3T tokens | 完全开放 | ✅（ODC-BY） |
| **The Pile** | 825GB | 开放 | ✅（Apache 2.0） |
| **RedPajama** | 1.2T tokens | 开放 | ✅ |
| **FineWeb** | 15T tokens | 开放 | ❌（仅研究） |
| **Llama 2 训练数据** | 2T tokens | ❌闭源 | - |

Dolma 是当时规模最大且完全开放可商用的预训练语料之一。

---

## 六、总结

- **Dolma** = 预训练原材料 → 教会模型"说话"
- **Dolci** = 后训练教材 → 教会模型"答得好"
- 两者都是 AI2 作为**非营利机构**免费公开的资产
- ODC-BY 许可证意味着**商业可用**，只需署名
- 这就是为什么 AI2 敢说"真正开源" — 从数据到模型的全流程透明

---

## 相关笔记

- [AI2_Apertus.md](./AI2_Apertus.md) - AI2 与 Apertus 机构介绍
- [Openness_Index.md](./Openness_Index.md) - Artificial Analysis Openness Index 详解
- [AI21_LiquidAI_roadmap.md](./AI21_LiquidAI_roadmap.md) - AI21 Labs 与 Liquid AI 发展路线
- [BJ_SH_AI_Institutions.md](./BJ_SH_AI_Institutions.md) - 北京上海AI研究机构与国际同类机构
