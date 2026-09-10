# Marin（斯坦福开放实验室）

> 本笔记整理 Marin 项目的基本信息、发布历史与 AA 评分情况，作为月表 `Marin-Stanford` 列的调研依据。
> 最后更新：2026-09-10

---

## 一、基本信息

| 项目 | 内容 |
|------|------|
| 全称 | Marin（开放实验室 / open lab） |
| 发起 | 2025-05-19 正式公告，诞生于斯坦福 CRFM（基础模型研究中心） |
| 核心人物 | **Percy Liang**（斯坦福副教授、CRFM 主任、Together AI 联创，CS336 "Language Models From Scratch" 主讲）、David Hall（Open Athena） |
| 官网 | https://marin.community |
| GitHub | https://github.com/marin-community/marin（JAX 技术栈，Levanter 训练框架） |
| 性质 | 社区共建的"开放开发"（open development）研究项目 |

### 与 OLMo（AI2）路线的区别

开放程度分三层：开放权重（Llama/Gemma）→ 开放配方（BLOOM/Pythia/OLMo/LLM360）→ **开放过程（Marin）**：每个实验先在 GitHub Issue 声明目标与假设，配置以 PR 提交可被外部 Review，训练指标实时公开（W&B），成功、失败与中途修改全部留档。

---

## 二、发布历史（已收录月表）

| 模型/事件 | 时间 | 月表行 | 说明 |
|-----------|------|--------|------|
| **Marin 8B Base**（代号 deeper-starling） | 2025-05-19 | 25-May | Llama 架构、~12.7T tokens、Apache-2.0；官方口径在 14/19 项基准上超过 Llama 3.1 8B Base |
| **Marin 8B Instruct** | 2025-05-19 | 25-May | SFT 版（Tülu 3、OpenThoughts 等混合数据） |
| **Marin 32B Base**（代号 mantis） | 2025-10 | 25-Oct | 10-29 Percy Liang 宣布训完，自称"最佳开源基座"（胜 OLMo 2 32B Base，24/42 项胜 Gemma 3 27B PT）；权重 HF 2025-10-25 起公开、11-03 定稿 |
| **Delphi scaling suite** | 2026-05 | 26-May | 3e18→1e23 FLOPs 开源缩放套件（TPU Research Cloud 训练），缩放律外推 300 倍预测 loss 误差 <0.2%；checkpoints 全开（HF collection 2026-05-05，博客 2026-05-11） |
| **Marin 535B-A23B hero run 开训** | 2026-08 | 26-Aug | 见下节 |

未收录的次要条目：marino-chat（15M 实验品，2025-10）、isoflop-\* 中间实验权重（Delphi 前置）、marin-8b-instruct-bf16（格式转换）。

---

## 三、Marin 535B-A23B：全公开的旗舰训练（26-08 → 26-11）

用户所指"公开训练过程"的项目即此。关键参数：

| 项目 | 参数 |
|------|------|
| 架构 | MoE，总参数 ~535B，激活 ~23B（2 共享专家 + top-8 路由专家） |
| 数据 | 18.75T tokens（80% 预训练 + 20% 中期训练，配方公开） |
| 算力 | 11 套 GB200 NVL72（792 卡），约 2.7e24 FLOPs（与 DeepSeek-V3 同量级） |
| 周期 | 约 100 天：2026-08-18 训练日志 Issue 开设（[#8435](https://github.com/marin-community/marin/issues/8435)），预计 **2026-11 下旬**完成，之后进入后训练 |
| 前置 | 训前已跑 4 级 scaling ladder（1.6B-A61M → 27.7B-A1.2B），提前公开对 535B 最终 loss 的预测 |

围观入口：GitHub issue #8435 · [W&B 实时看板](https://wandb.ai/marin-community/marin_moe/reports/535B-A23B-18T-Token-Hero-Run-Scaling-Ladder--VmlldzoxNzc2MDM5Ng) · 数据构成仪表盘。吴恩达转发称其为"捍卫 AI 开放性的珍贵示范"。

---

## 四、AA（Artificial Analysis）评分情况

**结论：AA 上没有 Marin 模型的评分。** 核查过程（2026-09-10）：

1. AA 模型页 `artificialanalysis.ai/models/marin-8b`、`/models/marin-8b-instruct` 均返回 404；
2. 本仓 AA 榜单快照（`scripts/aa-leaderboard.json`）vendor 列表中无 Marin；
3. AA Openness Index 公开榜（OLMo 3.1 / Apertus 88.89 并列榜首）无 Marin 条目；
4. 全网检索无任何 Marin 模型的 AA 评分页；Marin 官方仅将 AA-II 方法论作为内部评测目标（GitHub issue #5819、#6703"AA-II validation suite"）。

原因分析：AA 文本智能指数以 instruct/chat 模型为主（需可对话评测或 API 调用），Marin 至今只发布 **base 模型**（32B Instruct 未见发布），且无 API 服务。若后续发布 535B 后训练模型，AA 大概率会收录——届时该列可进入 AA 排名（`scripts/aa-vendor-ranking.js` 的 `VENDOR_TO_COLUMN` 需补映射，如 `'Marin': 'Marin-Stanford'`）。

---

## 相关笔记

- [AI2_Apertus.md](./AI2_Apertus.md) - 同为"全流程开源"机构的 Ai2 与 Apertus
- [Openness_Index.md](./Openness_Index.md) - AA Openness Index 详解
