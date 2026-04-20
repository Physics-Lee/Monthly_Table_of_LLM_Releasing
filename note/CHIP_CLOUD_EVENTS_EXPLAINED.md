# 新加入的 LLM-芯片 和 LLM-云计算 事件说明

本项目在现有模型发布时间表基础上，新增了两列基础设施事件：**LLM-芯片** 和 **LLM-云计算**。

以下是所有事件的详细说明。

---

## 一、LLM-芯片（共 13 个事件）

芯片是 AI 模型的"发动机"。没有芯片，就没有大模型。以下事件代表了 2022-2026 年间 AI 芯片领域的重大里程碑。

| # | 时间 | 事件 | 说明 |
|---|---|---|---|
| 1 | **2023-08** | **SK Hynix HBM3E** | 新一代高带宽内存量产。HBM（High Bandwidth Memory）是 GPU 的"显存"，HBM3E 比上一代带宽提升 50%，是所有高端 AI 芯片（H100、MI300X、Blackwell）的标配。没有它，大模型训练根本跑不动。 |
| 2 | **2023-11** | **AWS Trainium2** | 亚马逊自研 AI 训练芯片发布。云厂商开始摆脱对 NVIDIA 的依赖，自己做芯片降低成本。Trainium2 专为 AWS 云上的模型训练设计。 |
| 3 | **2023-12** | **AMD MI300X** | AMD 首款真正对标 NVIDIA H100 的 AI 芯片，192GB HBM3 显存，比 H100 显存更大。标志着 AMD 从"NVIDIA 追随者"变成"可替代选项"。 |
| 4 | **2023-12** | **Google TPU v5p** | Google 自研 AI 芯片的第五代，专为 Transformer 模型优化。TPU 是 Google 训练 Gemini 系列的秘密武器，但只供 Google Cloud 使用。 |
| 5 | **2024-03** | **NVIDIA Blackwell B200** | NVIDIA 下一代旗舰 AI 芯片，采用双芯粒架构，支持 FP4 精度，专门为大模型训练设计。Blackwell 是 2024-2025 年所有顶级模型的训练底座。 |
| 6 | **2024-04** | **Microsoft Maia 100** | 微软自研 AI 推理芯片，用于 Azure 云服务。微软不甘只做 NVIDIA 的客户，开始自己造芯片。Maia 100 主要用于运行 Copilot 等推理任务。 |
| 7 | **2024-08** | **NVIDIA H200** | H100 的升级款，显存从 80GB 提升到 141GB（HBM3e）。对于大模型推理来说，显存就是一切。H200 让单卡可以运行更大的模型。 |
| 8 | **2024-12** | **Google TPU v6e Trillium** | Google TPU 第六代，Gemini 2.0 的训练平台。这一代 TPU 强调推理效率，意味着 Google 不仅在训练上用 TPU，推理也要全面替代 NVIDIA。 |
| 9 | **2025-01** | **NVIDIA Nemotron 3** | NVIDIA 从"卖铲子"变成"自己也淘金"，推出自研大模型 Nemotron 系列，并发布配套的推理优化方案。这标志着 NVIDIA 从纯硬件公司向"AI 全栈"转型。 |
| 10 | **2025-06** | **AMD MI350X** | AMD 下一代 AI 芯片，288GB HBM3E，首次在显存容量上超越 NVIDIA。如果 AMD 能在软件生态上追上，这将是 NVIDIA 垄断地位的最大威胁。 |
| 11 | **2025-12** | **NVIDIA Nemotron 3 Nano** | NVIDIA 小参数模型，针对边缘设备和低延迟场景。说明 NVIDIA 不仅要占领数据中心，还要把 AI 推理推到手机、汽车、IoT 设备上。 |
| 12 | **2026-01** | **Microsoft Maia 200** | 微软第二代自研芯片，3nm 工艺，216GB HBM3e，专为推理设计。Maia 200 的目标是大幅降低 Copilot 等服务的推理成本。 |
| 13 | **2026-03** | **NVIDIA Nemotron 3 Super** | NVIDIA 大参数模型，性能对标 GPT-4。NVIDIA 不再只是提供训练工具，而是要成为模型提供商本身。 |

### 芯片层核心趋势

1. **NVIDIA 一家独大但面临挑战** — AMD MI300X/MI350X、Google TPU、云厂商自研芯片都在蚕食份额
2. **显存是瓶颈** — HBM3E 从稀缺到标配，决定了谁能训练更大的模型
3. **从训练到推理** — 早期芯片强调训练速度，现在推理成本和能效成为焦点
4. **云厂商自研芯片** — AWS Trainium、Google TPU、Microsoft Maia，三大云都在摆脱 NVIDIA 依赖

---

## 二、LLM-云计算（共 10 个事件）

云计算是 AI 模型的"电力系统"。模型训练需要海量算力，部署需要稳定服务。以下事件记录了 AI 云基础设施的里程碑。

| # | 时间 | 事件 | 说明 |
|---|---|---|---|
| 1 | **2022-11** | **Azure OpenAI Service** | 微软 Azure 独家提供 OpenAI API 服务。这是 AI 云化的起点——企业不需要自己买 GPU、自己部署模型，直接调用 API 就能用 GPT-4。 |
| 2 | **2023-04** | **AWS Bedrock GA** | 亚马逊推出"模型超市"，一个企业账号可以调用 Claude、Llama、Titan 等多家模型。云厂商从"卖算力"升级为"卖模型服务"。 |
| 3 | **2023-12** | **Google AI Hypercomputer** | Google Cloud 的 AI 超级计算架构，整合 TPU v5p、存储、网络。Google 用这套系统训练 Gemini Ultra，并向企业开放。 |
| 4 | **2024-03** | **AWS Trainium2 GA** | 亚马逊自研训练芯片 Trainium2 正式商用。这意味着 AWS 客户可以用更便宜的自研芯片训练模型，而不是昂贵的 NVIDIA GPU。 |
| 5 | **2024-05** | **CoreWeave 75亿美元** | GPU 云初创公司 CoreWeave 获得 75 亿美元债务融资。AI 云成为资本市场最热的赛道，融资规模堪比大型基础设施项目。 |
| 6 | **2024-08** | **Lambda Labs 3.2亿美元** | 另一家 GPU 云公司 Lambda Labs 融资 3.2 亿美元。创业者发现：不是所有人都能买到/租到 NVIDIA GPU，专门做 GPU 租赁是一门大生意。 |
| 7 | **2024-12** | **AWS AI Factories** | 亚马逊推出"AI 工厂"服务，帮企业在自有数据中心部署 AWS AI 基础设施。这是从"公有云"向"混合云+私有化"的扩展。 |
| 8 | **2025-06** | **AWS GPU降价45%** | AWS 宣布 NVIDIA GPU 实例降价 45%。AI 算力从稀缺品变成大宗商品，价格战开始。这对AI创业公司是大好事，训练成本大幅降低。 |
| 9 | **2025-12** | **CoreWeave 85亿美元** | CoreWeave 再次融资 85 亿美元，估值飙升。GPU 云市场进入"军备竞赛"阶段，资本密集型特征明显。 |
| 10 | **2026-02** | **Microsoft-OpenAI Stargate 1000亿美元** | 微软和 OpenAI 宣布投资 1000 亿美元建设 AI 数据中心。这是人类历史上最大的单个科技基础设施项目之一，标志着 AI 进入"超大规模基建"时代。 |

### 云计算层核心趋势

1. **云厂商绑定模型厂商** — Azure 绑定 OpenAI、AWS 绑定 Anthropic、Google 自研 Gemini
2. **从卖算力到卖模型服务** — Bedrock、Azure OpenAI Service 让企业"一键调用"大模型
3. **AI 云创业公司崛起** — CoreWeave、Lambda Labs 等专门做 GPU 租赁，填补市场空白
4. **算力商品化** — GPU 价格持续下降，推理成本 2 年降 280 倍
5. **能源成为硬约束** — 1000 亿美元的数据中心投资，电力供应跟不上，液冷成为标配

---

## 三、为什么记录这些事件？

### 模型层 vs 基础设施层的关系

```
芯片（硬件） → 云计算（平台） → 模型（软件） → 应用（产品）
     ↑              ↑              ↑            ↑
  H100/MI300X   Azure/AWS      GPT-4/Claude   ChatGPT/Copilot
  Blackwell     GCP/CoreWeave  Gemini/Grok    Cursor/Perplexity
```

**模型是面子，基础设施是里子。**

- GPT-4 能发布，是因为微软 Azure 给 OpenAI 提供了上万张 H100
- Claude 3 能发布，是因为 AWS 给 Anthropic 提供了算力
- 国产模型能用，是因为华为 Ascend、海光 DCU 在替代 NVIDIA

没有芯片，没有云，就没有大模型。

### 记录这些的意义

1. **理解模型发布的"幕后推手"** — 为什么 GPT-4 在 2023-03 发布？因为 H100 在 2022-09 量产了
2. **把握行业趋势** — 芯片和云的投资节奏，预示着模型能力的跃升时间表
3. **投资/创业参考** — 芯片短缺时做什么、算力降价时做什么、云厂商自研芯片时做什么

---

## 四、事件时间线总览

```
2022-11  Azure OpenAI Service        ← AI 云化起点
2023-04  AWS Bedrock GA              ← "模型超市"出现
2023-08  SK Hynix HBM3E              ← 内存瓶颈突破
2023-11  AWS Trainium2               ← 云厂商自研芯片
2023-12  AMD MI300X + Google TPU v5p ← NVIDIA 挑战者出现
2023-12  Google AI Hypercomputer     ← 超级计算平台
2024-03  NVIDIA Blackwell B200       ← 下一代训练芯片
2024-03  AWS Trainium2 GA            ← 自研芯片商用
2024-04  Microsoft Maia 100          ← 微软自研芯片
2024-05  CoreWeave 75亿美元          ← GPU 云爆发
2024-08  NVIDIA H200                 ← 推理芯片升级
2024-08  Lambda Labs 3.2亿美元       ← 创业机会涌现
2024-12  Google TPU v6e Trillium     ← TPU 推理时代
2024-12  AWS AI Factories            ← 私有化部署
2025-01  NVIDIA Nemotron 3           ← NVIDIA 自己做模型
2025-06  AMD MI350X                  ← AMD 追赶加速
2025-06  AWS GPU降价45%              ← 算力商品化
2025-12  NVIDIA Nemotron 3 Nano      ← 边缘 AI
2025-12  CoreWeave 85亿美元          ← 资本军备竞赛
2026-01  Microsoft Maia 200          ← 推理成本战
2026-02  Microsoft-OpenAI Stargate   ← 千亿基建时代
2026-03  NVIDIA Nemotron 3 Super     ← NVIDIA 全栈化
```

---

*文档生成时间：2026-04-20*
