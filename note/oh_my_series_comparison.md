# oh-my-opencode vs oh-my-claudecode vs oh-my-codex 对比

> 三个"oh-my"系列多智能体编排框架的架构对比
> 撰写时间: 2026-04-20

---

## 一句话定位

| 项目 | 定位 | 目标平台 | 作者 | Stars |
|------|------|----------|------|-------|
| **oh-my-opencode** | 多智能体编排框架（始祖） | Opencode CLI | OhMyOpenCode 团队 | - |
| **oh-my-claudecode** | Claude Code 的多智能体增强层 | Claude Code CLI | Yeachan Heo | 30K+ |
| **oh-my-codex** | Codex CLI 的多智能体工作流层 | OpenAI Codex CLI | Yeachan Heo | 23K+ |

---

## 核心问题：有"西西弗斯"吗？

**答案：三个项目都有主编排智能体，但设计理念不同。**

### oh-my-opencode — 西西弗斯 (Sisyphus)

- **存在形式**：显式命名 —— `Sisyphus` 是主编排智能体的身份标识
- **角色定位**："强大的 AI 编排智能体"（Powerful AI Agent with orchestration capabilities）
- **核心哲学**："人类每天滚石头，我也是。" —— 强调持续迭代、不完美的永恒奋斗
- **架构特征**：
  - 西西弗斯是**唯一入口**，所有用户请求先由它接收
  - 内置**意图分析**（Intent Gate）—— 先理解用户真正想要什么，再决定路由
  - 拥有完整的**子智能体调度系统**：explore / oracle / librarian / metis / momus / plan agent
  - **必须委托**（MANDATORY delegation）—— 默认把工作派给子智能体，自己只负责编排
  - **Ralph Loop**（自引用开发循环）—— 西西弗斯可以启动自我迭代循环直到任务完成
  - **Momus Review** —— 工作完成后自动触发审查流程
  - **Todo 系统** —— 强制性的任务追踪机制

### oh-my-claudecode — 无显式命名，但存在编排核心

- **存在形式**：**没有显式命名的"主角"**，编排逻辑分散在插件体系中
- **角色定位**：Claude Code 的**插件/增强层**，而非独立智能体
- **核心哲学**："Don't learn Claude Code. Just use OMC." —— 零配置、开箱即用
- **架构特征**：
  - 以 **Team（团队）** 为编排表面（canonical orchestration surface）
  - 32 个**专用智能体**（specialized agents），但没有统一的"总指挥"
  - 通过 **Claude Code 原生插件机制** 运行（`/plugin install oh-my-claudecode`）
  - 智能体类型：实现者、审查者、领域专家、工具调用者等
  - **无自引用循环** —— 没有 Ralph Loop 或类似的自我迭代机制
  - **有 HUD（ Heads-Up Display）** —— 实时状态面板
  - 支持 **tmux** 多面板并行执行

### oh-my-codex — 同样无显式命名

- **存在形式**：**无显式命名编排者**，Codex CLI 的工作流增强层
- **角色定位**：Codex CLI 的**运行时扩展**（operational runtime）
- **核心哲学**："Your codex is not alone." —— 让 Codex 从单会话变成协调系统
- **架构特征**：
  - 33 个**角色提示**（Role Prompts）+ 36 个**工作流技能**（Skills）
  - 5 个 **MCP 服务器** 提供持久化上下文和跨会话学习
  - **Team Mode** —— 支持多 worker 并行，自动隔离 git worktree 防冲突
  - 执行强度模式：`--yolo`, `--high`, `--xhigh`, `--madmax`
  - 支持 **async Claude Code delegation** —— 可以异步调用 Claude Code 作为子 worker
  - 无统一的"总指挥"概念，更像**工具链**而非**智能体层级**

---

## 架构对比：分层视角

```
┌─────────────────────────────────────────────────────────────┐
│                    用户输入层                                │
└────────────┬──────────────────────┬─────────────────────────┘
             │                      │
    ┌────────▼────────┐    ┌───────▼────────┐    ┌───────────▼──────────┐
    │  oh-my-opencode │    │oh-my-claudecode│    │    oh-my-codex       │
    │                 │    │                │    │                      │
    │  ┌───────────┐  │    │  ┌──────────┐  │    │  ┌──────────────┐    │
    │  │ Sisyphus  │  │    │  │ Claude   │  │    │  │   Codex      │    │
    │  │ 主编排者  │◄─┼────┼──┤ Code CLI │  │    │  │   CLI        │    │
    │  └─────┬─────┘  │    │  └────┬─────┘  │    │  └──────┬───────┘    │
    │        │        │    │       │        │    │         │            │
    │  ┌─────▼─────┐  │    │  ┌────▼────┐   │    │  ┌──────▼──────┐     │
    │  │explore    │  │    │  │ 32 个   │   │    │  │ 33 Prompts  │     │
    │  │oracle     │  │    │  │专用Agent│   │    │  │ 36 Skills   │     │
    │  │librarian  │  │    │  │         │   │    │  │ 5 MCP Srv   │     │
    │  │metis      │  │    │  └─────────┘   │    │  └─────────────┘     │
    │  │momus      │  │    │                │    │                      │
    │  │plan agent │  │    │  HUD / tmux    │    │  Team Mode / HUD     │
    │  └───────────┘  │    │                │    │                      │
    │                 │    │                │    │                      │
    │  Ralph Loop     │    │  无自引用循环   │    │  无自引用循环         │
    │  Momus Review   │    │  插件体系       │    │  npm 包体系          │
    └─────────────────┘    └────────────────┘    └──────────────────────┘
```

---

## 关键差异点

### 1. 编排模型

| 维度 | oh-my-opencode | oh-my-claudecode | oh-my-codex |
|------|---------------|------------------|-------------|
| **中心节点** | 有（西西弗斯） | 无（去中心化） | 无（去中心化） |
| **调度方式** | 显式委托（必须） | Team 模式 | Team Mode |
| **决策层级** | 两层（西西弗斯→子智能体） | 扁平（Claude→Agents） | 扁平（Codex→Skills） |
| **自指能力** | 有（Ralph Loop） | 无 | 无 |

### 2. 子智能体/技能体系

| 维度 | oh-my-opencode | oh-my-claudecode | oh-my-codex |
|------|---------------|------------------|-------------|
| **数量** | 6 类核心子智能体 | 32 个专用智能体 | 33 Prompts + 36 Skills |
| **命名风格** | 神话人物（Oracle, Metis, Momus） | 功能描述（implementer, reviewer, domain-expert） | 功能描述 |
| **运行环境** | 背景任务（background task） | Claude Code 会话内 | Codex CLI 会话内 |
| **通信机制** | session_id 续传 | 插件消息总线 | CLI hook 系统 |

### 3. 审查/质量保证

| 维度 | oh-my-opencode | oh-my-claudecode | oh-my-codex |
|------|---------------|------------------|-------------|
| **审查机制** | Momus Review（强制） | 可选 review | 可选 verification |
| **触发时机** | 工作完成后自动触发 | 手动或配置触发 | 手动触发 |
| **审查维度** | 5 个并行子审查（Oracle×2 + QA + Context Mining） | 单一审查流程 | 单一验证流程 |

### 4. 部署方式

| 维度 | oh-my-opencode | oh-my-claudecode | oh-my-codex |
|------|---------------|------------------|-------------|
| **安装方式** | 系统级集成 | Claude Code 插件市场 | npm 全局安装 |
| **配置复杂度** | 高（需要理解完整架构） | 低（零配置） | 中（`omx setup`） |
| **平台依赖** | Opencode CLI | Claude Code CLI | Codex CLI + Node.js 20+ |

---

## 西西弗斯的独特性

### 什么是只有 oh-my-opencode 有的？

1. **显式身份** —— "我是西西弗斯"，用户知道自己在和谁对话
2. **意图门控（Intent Gate）** —— 每个请求先分析真实意图，再分类处理
3. **强制委托** —— 西西弗斯被明确禁止直接写代码，必须派给子智能体
4. **自引用循环（Ralph Loop）** —— 西西弗斯可以启动一个循环，让系统自我迭代直到完成
5. **神话命名体系** —— Oracle（预言）、Metis（智慧）、Momus（批评）—— 暗示了古希腊的审议民主
6. **Todo 强制追踪** —— 多步骤任务必须创建 todo，且只能有一个 in_progress

### 为什么 oh-my-claudecode / oh-my-codex 没有西西弗斯？

**设计哲学差异：**

- **oh-my-opencode** 是**框架级**设计 —— 它假设用户需要一个"总指挥"来管理复杂的 AI 工作流
- **oh-my-claudecode/codex** 是**增强级**设计 —— 它们假设底层 CLI（Claude Code / Codex）已经足够智能，只需要**插件/技能**来扩展能力

换句话说：
- 西西弗斯是**船长**，子智能体是**船员**
- oh-my-claudecode 的 32 个 agent 是**Claude Code 的工具箱**
- oh-my-codex 的 33 prompts 是**Codex CLI 的快捷键**

---

## 选择建议

| 场景 | 推荐选择 |
|------|----------|
| 需要**统一入口**管理复杂多步骤任务 | oh-my-opencode（西西弗斯模式） |
| 已经是 **Claude Code 重度用户**，想增强功能 | oh-my-claudecode |
| 已经是 **Codex CLI 重度用户**，想增强功能 | oh-my-codex |
| 需要**跨平台**（不绑定特定 CLI） | oh-my-opencode |
| 想要**零配置**快速上手 | oh-my-claudecode |
| 需要**自我迭代/自引用**能力 | oh-my-opencode（唯一支持 Ralph Loop） |
| 团队需要**并行多 worker**防冲突 | oh-my-codex（git worktree 隔离） |

---

## 技术细节补充

### oh-my-claudecode 的 32 个智能体（部分示例）

基于 README 和文档推断：
- **实现者**（implementer）：写代码
- **审查者**（reviewer）：代码审查
- **探索者**（explorer）：代码库探索
- **规划者**（planner）：任务拆解
- **验证者**（verifier）：测试验证
- **领域专家**（domain-expert）：特定技术栈咨询
- ...（共 32 个）

### oh-my-codex 的 5 个 MCP 服务器

1. **State Server** —— 持久化会话状态
2. **Memory Server** —— 跨会话记忆
3. **Code Intelligence Server** —— 代码分析
4. **Trace Server** —— 执行追踪
5. **Context Server** —— 上下文管理

### oh-my-opencode 的 6 类子智能体

1. **explore** —— 代码库探索（Contextual Grep）
2. **librarian** —— 外部参考检索（Reference Grep）
3. **oracle** —— 架构咨询（Read-only High-IQ Consultant）
4. **metis** —— 预规划分析（Pre-planning Consultant）
5. **momus** —— 计划审查（Plan Review）
6. **plan agent** —— 工作分解（Work Breakdown）

---

## 参考链接

- oh-my-claudecode: https://github.com/yeachan-heo/oh-my-claudecode
- oh-my-codex: https://github.com/yeachan-heo/oh-my-codex
- oh-my-opencode: 内置系统（当前运行环境）

---

> **声明**：本文基于公开文档和搜索结果的推断，oh-my-claudecode 和 oh-my-codex 的具体内部实现细节可能有所偏差，建议以官方文档为准。
