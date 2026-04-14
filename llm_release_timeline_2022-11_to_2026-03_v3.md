# LLM Release Timeline 2022-11 to 2026-03

This is a denser pass than the earlier file. I added more public model launches and major model-family updates across the existing vendors plus `Baidu` `GLM-Z.ai` `iFlytek` `MiniMax` `Kimi-Moonshot` `Doubao-ByteDance` `Ant-Group` `StepFun` and `Xiaomi`.

Conventions:
- Cells use ` + ` instead of commas so the CSV imports cleanly.
- Blank cells mean I did not verify a notable public release for that vendor in that month.
- Some China-vendor entries come from official milestone pages or official developer release notes rather than a single launch blog post.
- Entries marked with `[?]` are speculative/predicted — no confirmed official announcement at time of writing.

| Month | OpenAI | Anthropic | Google | Meta | Mistral | xAI | DeepSeek | Qwen-Alibaba | Cohere | Baidu | GLM-Z.ai | iFlytek | MiniMax | Kimi-Moonshot | Doubao-ByteDance | Ant-Group | StepFun | Xiaomi | open_source |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2022-11 | ChatGPT GPT-3.5 |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   | [LangChain](https://github.com/langchain-ai/langchain) |
| 2022-12 |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 2023-01 |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 2023-02 |   |   | Bard | [Llama 1](https://github.com/facebookresearch/llama) |   |   |   |   |   |   |   |   |   |   |   |   |   |   | [vLLM](https://github.com/vllm-project/vllm) |
| 2023-03 | GPT-4 | [Claude 1](https://www.anthropic.com/news/introducing-claude) |   |   |   |   |   |   |   | [ERNIE Bot](https://www.baidu.com/) | ChatGLM |   |   |   |   |   |   |   | [AutoGPT](https://github.com/Significant-Gravitas/AutoGPT)  + [llama.cpp](https://github.com/ggml-org/llama.cpp) |
| 2023-04 |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   | [Axolotl](https://github.com/axolotl-ai-cloud/axolotl) |
| 2023-05 |   |   | [PaLM 2](https://blog.google/technology/ai/google-palm-2-ai-large-language-model/) |   |   |   |   |   |   |   |   | Spark 1.0 |   |   |   |   |   |   |   |
| 2023-06 |   |   |   |   |   |   |   |   |   |   | [ChatGLM2](https://github.com/THUDM/ChatGLM2-6B) | Spark 1.5 |   |   |   |   |   |   | [Ollama](https://github.com/ollama/ollama)  + [LLaMA-Factory](https://github.com/hiyouga/LLaMA-Factory) |
| 2023-07 |   | Claude 2 |   | Llama 2 |   |   |   |   |   | [ERNIE 3.5](https://github.com/PaddlePaddle/PaddleNLP) |   |   |   |   |   | [Bailing](https://www.reuters.com/technology/ant-group-launches-ai-model-bailing-2023-07-18/) |   |   |   |
| 2023-08 |   | [Claude Instant 1.2](https://www.anthropic.com/news/releasing-claude-instant-1-2) |   |   |   |   |   | [Qwen-7B](https://huggingface.co/Qwen/Qwen-7B) + [Qwen-VL](https://huggingface.co/Qwen/Qwen-VL) + [Qwen-VL-Chat](https://github.com/QwenLM/Qwen-VL) |   |   |   | Spark 2.0 |   |   | Doubao |   |   | [MiLM-6B](https://github.com/XiaoMi/MiLM-6B) |   |
| 2023-09 | [GPT-4V](https://openai.com/index/gpt-4v-system-card/) |   |   |   | Mistral 7B |   |   | Qwen-14B |   |   |   |   |   |   |   |   |   |   |   |
| 2023-10 |   |   |   |   |   |   |   |   |   | ERNIE 4.0 | [ChatGLM3](https://github.com/THUDM/ChatGLM3) |   |   | [Kimi Chat](https://techcrunch.com/2023/10/16/moonshot-ai-launches-kimi-a-chatbot-that-can-answer-questions-in-chinese/) |   | CodeFuse |   |   | [CrewAI](https://github.com/crewAIInc/crewAI)  + [DSPy](https://github.com/stanfordnlp/dspy) |
| 2023-11 | GPT-4 Turbo |   |   |   |   | [Grok-1](https://techcrunch.com/2023/11/04/xai-launches-grok-its-gpt-4-rival-built-by-xai/) | [DeepSeek-LLM + DeepSeek-Coder](https://github.com/deepseek-ai/DeepSeek-LLM) | Qwen-72B + [Qwen-Audio](https://huggingface.co/Qwen/Qwen-Audio) | [Embed v3 + Rerank v3](https://cohere.com/blog/introducing-embed-v3) |   |   |   | [abab5](https://www.scmp.com/tech/big-tech/article/3240828/) |   |   |   |   |   |   |
| 2023-12 |   | [Claude 2.1](https://www.anthropic.com/news/claude-2-1) | Gemini 1.0 Ultra + Pro + Nano |   | Mixtral 8x7B + [Mistral Medium](https://mistral.ai/news/la-plateforme/) |   |   |   |   |   |   |   | [abab5.5](https://www.reuters.com/technology/chinese-startup-minimax-launches-abab55-2023-12-05/) |   |   | Bailing 2.0 |   |   |   |
| 2024-01 |   |   |   |   |   |   | [DeepSeek-MoE](https://github.com/deepseek-ai/DeepSeek-MoE) |   |   |   | GLM-4 | Spark 3.0 |   | moonshot-v1 |   |   |   |   | [AutoGen](https://github.com/microsoft/autogen) + [LangGraph](https://github.com/langchain-ai/langgraph)  + [SGLang](https://github.com/sgl-project/sglang) |
| 2024-02 |   |   | Gemma + Gemini 1.5 Pro |   | Mistral Large + [Mistral Small](https://mistral.ai/news/mistral-small-2402/) |   | [DeepSeek-Math](https://github.com/deepseek-ai/DeepSeek-Math) | Qwen1.5 | Aya |   |   |   |   |   |   |   |   |   |   |
| 2024-03 |   | Claude 3 Opus + Sonnet + Haiku |   |   |   | [Grok-1](https://techcrunch.com/2023/11/04/xai-launches-grok-its-gpt-4-rival-built-by-xai/) + Grok-1.5 | [DeepSeek-VL](https://github.com/deepseek-ai/DeepSeek-VL) |   | Command R |   |   | [Spark 3.5](https://www.iflytek.com/) |   |   |   |   |   |   | [OpenHands](https://github.com/OpenHands/OpenHands) |
| 2024-04 |   |   |   | Llama 3 | [Mixtral 8x22B](https://mistral.ai/news/mixtral-8x22b/) | [Grok-1.5V](https://x.ai/blog/grok-1.5v) |   | Qwen1.5-110B + CodeQwen1.5 | Command R+ |   |   |   | [ABAB 6.5](https://www.minimaxi.com/) |   |   |   |   |   |   |
| 2024-05 | GPT-4o |   | Gemini 1.5 Flash |   | [Codestral](https://mistral.ai/news/codestral/) |   | DeepSeek-V2 |   | [Aya 23](https://cohere.com/research/aya) |   | [CogVLM2](https://github.com/THUDM/CogVLM2) |   |   |   |   | [Ling](https://www.reuters.com/technology/ant-group-unveils-ling-large-language-model-2024-05-06/) |   |   | [Cherry Studio](https://github.com/CherryHQ/cherry-studio) |
| 2024-06 |   | Claude 3.5 Sonnet | [Gemma 2](https://blog.google/technology/developers/google-gemma-2/) |   |   |   |   | Qwen2 |   |   |   | Spark 4.0 |   |   |   |   | [Step-1V](https://www.stepfun.com/) |   |   |
| 2024-07 | GPT-4o mini |   |   | Llama 3.1 | Mistral Large 2 + Mistral Nemo |   | DeepSeek-Coder-V2 | [Qwen2-Audio](https://huggingface.co/Qwen/Qwen2-Audio) |   |   |   |   |   |   |   |   | [Step-2](https://www.stepfun.com/) |   |   |
| 2024-08 |   |   |   |   |   | Grok-2 beta |   |   |   | ERNIE 4.0 Turbo | GLM-4-Plus |   | [Hailuo AI](https://www.scmp.com/tech/big-tech/article/3264825/) | moonshot-v1-auto |   |   |   |   |   |
| 2024-09 | o1-preview + o1-mini |   |   | Llama 3.2 | [Pixtral 12B](https://mistral.ai/news/pixtral-12b/) |   |   | Qwen2.5 + Qwen2.5-Coder + Qwen2.5-Math + [Qwen2-VL](https://qwenlm.github.io/blog/qwen2-vl/) |   |   |   |   | [Video-01](https://hailuoai.video/) |   |   | Zhixiaobao |   |   |   |
| 2024-10 |   | Claude 3.5 Haiku + Claude 3.5 Sonnet v2 |   |   | [Ministral 8B](https://mistral.ai/news/ministraux/) |   |   |   | Aya Expanse |   | AutoGLM |   |   |   |   | [CodeFuse-CGM](https://github.com/codefuse-ai) |   |   |   |
| 2024-11 |   |   |   |   | Mistral Large 2.1 + Pixtral Large |   |   | Qwen2.5-Coder Family + [QwQ-32B](https://qwenlm.github.io/blog/qwq-32b-preview/) |   |   |   |   |   |   |   |   |   |   | [Unsloth](https://github.com/unslothai/unsloth) |
| 2024-12 | o1 + [Sora](https://openai.com/index/sora-is-here/) |   | Gemini 2.0 Flash | Llama 3.3 |   | Grok-2 + Grok-2 mini | DeepSeek-V3 + DeepSeek-V2.5-1210 |   | Command R7B |   | GLM-Zero-Preview |   |   |   |   |   |   |   |   |
| 2025-01 | o3-mini |   |   |   | Mistral Small 3 + [Codestral 25.01](https://mistral.ai/news/codestral-2501/) |   | DeepSeek-R1 | Qwen2.5-Max + [Qwen2.5-VL](https://qwenlm.github.io/blog/qwen2.5-vl/) |   |   |   |   | MiniMax-Text-01 + MiniMax-VL-01 | [Kimi K1.5](https://www.testingcatalog.com/kimi-k1-5-by-moonshotai-achieves-sota-benchmarks-in-reasoning/) | Doubao 1.5 |   |   |   |   |
| 2025-02 | GPT-4.5 | Claude 3.7 Sonnet + [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) | [Gemini 2.0 Pro](https://blog.google/technology/google-deepmind/gemini-model-updates-february-2025/) |   |   | Grok 3 | [Janus-Pro](https://github.com/deepseek-ai/Janus) |   |   |   |   |   |   | kimi-latest |   |   | [Step-Video-T2V + Step-Audio](https://www.stepfun.com/) |   |   |
| 2025-03 | [o1 Pro](https://openai.com/index/o1-pro/) |   | Gemini 2.5 Pro + [Gemma 3](https://blog.google/technology/developers/gemma-3/) |   | Mistral Small 3.1 | [Grok-3 mini](https://techcrunch.com/2025/03/17/xai-launches-grok-3-and-grok-3-mini/) | DeepSeek-V3-0324 | [Qwen2.5-Omni](https://qwenlm.github.io/blog/qwen2.5-omni/) | Aya Vision + Command A | ERNIE 4.5 + X1 | AutoGLM Rumination |   |   |   |   | Ling-Plus + Ling-Lite |   |   |   |
| 2025-04 | GPT-4.1 + GPT-4.1 mini + GPT-4.1 nano + o3 + o4-mini |   | [Gemini 2.5 Flash](https://blog.google/technology/google-deepmind/gemini-2-5-flash/) | Llama 4 Scout + Llama 4 Maverick |   |   |   | Qwen3 |   | ERNIE 4.5 Turbo + X1 Turbo |   | Spark X1 | [Speech-02](https://www.minimaxi.com/) |   | Doubao 1.5 Thinking |   | [Step-R1-V-Mini](https://www.stepfun.com/) |   | [OpenCode](https://github.com/anomalyco/opencode) |
| 2025-05 | o3-pro + [Codex](https://openai.com/blog/introducing-codex) | Claude 4 Sonnet + Claude 4 Opus |   |   | Mistral Medium 3 + [Devstral](https://mistral.ai/news/devstral/) |   | DeepSeek-R1-0528 + [DeepSeek-Prover-V2](https://github.com/deepseek-ai/DeepSeek-Prover-V2) |   |   |   |   |   |   | kimi-thinking-preview |   | [Ling-lite-1.5](https://huggingface.co/inclusionAI/Ling-lite-1.5) + [Ming-Lite-Omni](https://huggingface.co/inclusionAI/Ming-Lite-Omni) |   | [MiMo-7B](https://arxiv.org/abs/2505.07608) |   |
| 2025-06 |   |   | Gemini 2.5 Flash-Lite |   | Magistral Small 1.0 + Magistral Medium 1.0 + [Mistral Small 3.2](https://mistral.ai/news/mistral-small-3-2/) |   |   |   |   |   |   |   | MiniMax-M1 |   | Doubao 1.6 + [Seedance 1.0](https://seed.bytedance.com/en/blog/tech-report-of-seedance-1-0-is-now-publicly-available) | [Ring-lite](https://huggingface.co/inclusionAI/Ring-lite) |   |   |   |
| 2025-07 |   |   | [Gemma 3n](https://huggingface.co/google/gemma-3n-E2B-it) |   | [Devstral Medium](https://mistral.ai/news/devstral-medium/) + [Voxtral](https://mistral.ai/news/voxtral/) | [Grok 4](https://x.ai/blog/grok-4) |   | Qwen3-Coder + [Qwen-MT](https://qwenlm.github.io/blog/qwen-mt/) | [Command A Vision](https://cohere.com/blog/command-a-vision) | ERNIE 4.5 Open | GLM-4.5 |   |   | Kimi K2 |   | [Ming-Lite-Omni-1.5](https://huggingface.co/inclusionAI/Ming-Lite-Omni) | [Step 3](https://www.stepfun.com/) |   | [Hermes Agent](https://github.com/NousResearch/hermes-agent) |
| 2025-08 | [GPT-5](https://openai.com/blog/introducing-gpt-5) | [Claude Opus 4.1](https://www.anthropic.com/news/claude-opus-4-1) |   |   |   |   | DeepSeek-V3.1 |   |   |   |   |   |   | [Kimi K2 Turbo Preview](https://kimi-k2.org/de/blog/08-kimi-k2-turbo-preview-en) |   |   |   |   |   |
| 2025-09 |   | [Claude Sonnet 4.5](https://www.anthropic.com/news/claude-sonnet-4-5) |   |   |   |   | DeepSeek-V3.1-Terminus |   |   | ERNIE X1.1 |   |   |   | [Kimi K2 0905](https://platform.kimi.ai/docs/guide/kimi-k2-quickstart) |   |   |   |   |   |
| 2025-10 |   | [Claude Haiku 4.5](https://www.anthropic.com/news/claude-haiku-4-5) |   |   |   |   |   |   |   |   |   |   |   |   |   | [Ling-1T](https://huggingface.co/inclusionAI/Ling-1T) + [Ring-1T](https://huggingface.co/inclusionAI/Ring-1T) + [Ming-flash-omni-Preview](https://huggingface.co/inclusionAI/Ming-flash-omni-2.0) |   |   |   |
| 2025-11 | [GPT-5.1](https://openai.com/blog/introducing-gpt-5-1) | [Claude Opus 4.5](https://www.anthropic.com/news/claude-opus-4-5) | [Gemini 3](https://blog.google/products/gemini/gemini-3/) |   |   | [Grok 4.1](https://x.ai/news/grok-4-1) |   |   |   | [ERNIE 5.0](https://www.prnewswire.com/news-releases/baidu-unveils-ernie-5-0-and-a-series-of-ai-applications-at-baidu-world-2025--ramps-up-global-push-302614531.html) |   |   |   | [Kimi K2 Thinking](https://kimi-k2.org/blog/15-kimi-k2-thinking-en) | [Doubao Seed Code](https://skywork.ai/blog/llm/doubao-seed-code-official-release-2025/) |   |   | [MiMo-VL Miloco-7B](https://huggingface.co/xiaomi-open-source/Xiaomi-MiMo-VL-Miloco-7B) + [MiMo-Embodied-7B](https://huggingface.co/XiaomiMiMo/MiMo-Embodied-7B) | [OpenClaw](https://github.com/openclaw/openclaw) |
| 2025-12 | [GPT-5.2](https://openai.com/blog/introducing-gpt-5-2) |   |   |   | [Mistral Large 3](https://docs.mistral.ai/models/mistral-large-3-25-12/) + [Ministral 3](https://aws.amazon.com/about-aws/whats-new/2025/12/mistral-large-3-ministral-3-family-available-amazon-bedrock/) |   | [DeepSeek-V3.2](https://api-docs.deepseek.com/news/news251201) |   |   |   |   |   |   |   |   |   |   | [MiMo-V2-Flash](https://github.com/XiaomiMiMo/MiMo-V2-Flash) | [Oh-My-OpenAgent](https://github.com/code-yeongyu/oh-my-openagent) |
| 2026-01 |   |   |   |   |   |   |   |   |   |   |   |   |   | [Kimi 2.5](https://kimi-k2.org/en/blog/19-kimi-k25-upgrade-en) |   | AReaL-SEA |   |   |   |
| 2026-02 | [GPT-5.3-Codex](https://openai.com/index/introducing-gpt-5-3-codex/) | [Claude Sonnet 4.6](https://www.anthropic.com/news/claude-sonnet-4-6) + [Claude Opus 4.6](https://techcrunch.com/2026/02/05/anthropic-releases-opus-4-6-with-new-agent-teams/) + [Claude Code Agent Teams](https://docs.anthropic.com/en/docs/claude-code/agent-teams) | [Gemini 3.1 Pro](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-pro/) |   |   | [Grok 4.2 Beta](https://gigazine.net/gsc_news/en/20260218-grok-4-2-public-beta) |   | [Qwen3.5](https://qwen.ai/blog?id=qwen3.5) |   |   | [GLM-5](https://www.reuters.com/technology/chinas-ai-startup-zhipu-releases-new-flagship-model-glm-5-2026-02-11/) |   | [MiniMax-M2.5](https://www.minimax.io/news/minimax-m25) |   | [Doubao 2.0](https://www.reuters.com/world/asia-pacific/chinas-bytedance-releases-doubao-20-ai-chatbot-2026-02-14/) | [Ring-2.5-1T](https://huggingface.co/inclusionAI/Ring-2.5-1T) + [Ling-2.5-1T](https://huggingface.co/inclusionAI/Ling-2.5-1T) + [Ming-flash-omni-2.0](https://huggingface.co/inclusionAI/Ming-flash-omni-2.0) + LLaDA2.1 | [Step 3.5 Flash](https://www.stepfun.com/) |   |   |
| 2026-03 | [GPT-5.4](https://openai.com/index/introducing-gpt-5-4/) + [Codex multi-agent](https://developers.openai.com/codex/multi-agent/) |   | [Gemini 3.1 Flash-Lite](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-lite/) + [Gemini 3.1 Flash Live](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-live/) |   | [Mistral Small 4](https://mistral.ai/news/mistral-small-4) |   |   |   |   |   |   |   | [MiniMax-M2.7](https://www.minimax.io/news/minimax-m27-en) |   |   | [AReaL-tau2](https://huggingface.co/inclusionAI) |   | [MiMo-V2-Pro + MiMo-V2-Omni + MiMo-V2-TTS](https://mimo.xiaomi.com) |   |
| 2026-04 |   | [Claude Mythos Preview](https://red.anthropic.com/2026/mythos-preview/) | [Gemma 4](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/) | [Muse Spark](https://ai.meta.com/blog/introducing-muse-spark-msl/) |   |   |   | [Qwen3.6-Plus](https://qwen.ai/blog?id=qwen3.6) |   |   | [GLM-5.1](https://z.ai/blog/glm-5.1) |   |   |   |   |   |   |   |   |


## Source Backbone

See the earlier markdown file for the full source list: [llm_release_timeline_2022-11_to_2026-03_v2.md](D:\Nut_Cloud\note\llm_release_timeline_files\llm_release_timeline_2022-11_to_2026-03_v2.md)

Additional GLM sources used for this update:
- https://docs.bigmodel.cn/cn/update/new-releases
- https://docs.bigmodel.cn/cn/guide/models/text/glm-5
- https://docs.bigmodel.cn/cn/coding-plan/using5-1

Additional sources for v3 additions:
- Claude 1 (2023-03): https://www.anthropic.com/news/introducing-claude
- Claude Instant 1.2 (2023-08): https://www.anthropic.com/news/releasing-claude-instant-1-2
- Claude 2.1 (2023-12): https://www.anthropic.com/news/claude-2-1
- GPT-4V (2023-09): https://openai.com/index/gpt-4v-system-card/
- Sora (2024-12): https://openai.com/index/sora-is-here/
- o1 Pro (2025-03): https://openai.com/index/o1-pro/
- PaLM 2 (2023-05): https://blog.google/technology/ai/google-palm-2-ai-large-language-model/
- Gemma 2 (2024-06): https://blog.google/technology/developers/google-gemma-2/
- Gemma 3 (2025-03): https://blog.google/technology/developers/gemma-3/
- Llama 1 (2023-02): https://github.com/facebookresearch/llama
- Mixtral 8x22B (2024-04): https://mistral.ai/news/mixtral-8x22b/
- Codestral (2024-05): https://mistral.ai/news/codestral/
- Pixtral 12B (2024-09): https://mistral.ai/news/pixtral-12b/
- Grok-1 open weights (2024-03): https://github.com/xai-org/grok-1
- Grok-1.5V (2024-04): https://x.ai/blog/grok-1.5v
- Qwen-VL-Chat (2023-08): https://github.com/QwenLM/Qwen-VL
- Qwen2-VL (2024-09): https://qwenlm.github.io/blog/qwen2-vl/
- QwQ-32B (2024-11): https://qwenlm.github.io/blog/qwq-32b-preview/
- Qwen2.5-VL (2025-01): https://qwenlm.github.io/blog/qwen2.5-vl/
- ERNIE 3.5 (2023-07): https://github.com/PaddlePaddle/PaddleNLP
- ChatGLM3 (2023-10): https://github.com/THUDM/ChatGLM3
- CogVLM2 (2024-05): https://github.com/THUDM/CogVLM2
- Doubao 2.0 (2026-02): Reuters confirmation

Additional sources for Phase 2 additions:
- ERNIE Bot (2023-03): https://www.baidu.com/
- ChatGLM2 (2023-06): https://github.com/THUDM/ChatGLM2-6B
- Qwen-7B (2023-08): https://huggingface.co/Qwen/Qwen-7B
- Qwen-VL (2023-08): https://huggingface.co/Qwen/Qwen-VL
- Doubao initial (2023-08): https://techcrunch.com/2023/08/04/bytedance-launches-doubao-its-first-generative-ai-model/
- Kimi Chat (2023-10): https://techcrunch.com/2023/10/16/moonshot-ai-launches-kimi-a-chatbot-that-can-answer-questions-in-chinese/
- Grok-1 (2023-11): https://techcrunch.com/2023/11/04/xai-launches-grok-its-gpt-4-rival-built-by-xai/
- DeepSeek-LLM + DeepSeek-Coder (2023-11): https://github.com/deepseek-ai/DeepSeek-LLM
- Qwen-Audio (2023-11): https://huggingface.co/Qwen/Qwen-Audio
- Embed v3 + Rerank v3 (2023-11): https://cohere.com/blog/introducing-embed-v3
- abab5 (2023-11): https://www.scmp.com/tech/big-tech/article/3240828/
- abab5.5 (2023-12): https://www.reuters.com/technology/chinese-startup-minimax-launches-abab55-2023-12-05/
- DeepSeek-MoE (2024-01): https://github.com/deepseek-ai/DeepSeek-MoE
- DeepSeek-Math (2024-02): https://github.com/deepseek-ai/DeepSeek-Math
- DeepSeek-VL (2024-03): https://github.com/deepseek-ai/DeepSeek-VL
- Spark 3.5 (2024-03): https://www.iflytek.com/
- Aya 23 (2024-05): https://cohere.com/research/aya
- Qwen2-Audio (2024-07): https://huggingface.co/Qwen/Qwen2-Audio
- Hailuo AI (2024-08): https://www.scmp.com/tech/big-tech/article/3264825/
- Grok-2 + Grok-2 mini GA (2024-12): https://www.theverge.com/2024/12/12/24321305/xai-grok-2-general-availability
- Grok-3 mini (2025-03): https://techcrunch.com/2025/03/17/xai-launches-grok-3-and-grok-3-mini/
- Qwen2.5-Omni (2025-03): https://qwenlm.github.io/blog/qwen2.5-omni/

Additional sources for Ant-Group entries:
- Bailing (2023-07): https://www.reuters.com/technology/ant-group-launches-ai-model-bailing-2023-07-18/
- CodeFuse (2023-10): Ant Group press release / https://github.com/codefuse-ai
- Bailing 2.0 (2023-12): Ant Group official announcements
- Ling (2024-05): https://www.reuters.com/technology/ant-group-unveils-ling-large-language-model-2024-05-06/
- Zhixiaobao (2024-09): Wikipedia Ant Group page / INCLUSION Conference 2024
- CodeFuse-CGM (2024-10): https://github.com/codefuse-ai
- Ling-Plus + Ling-Lite (2025-03): Wikipedia Ant Group page

Additional sources for StepFun entries:
- Step-1V (2024-06): https://www.stepfun.com/
- Step-2 (2024-07): https://www.stepfun.com/
- Step-Video-T2V + Step-Audio (2025-02): https://www.stepfun.com/
- Step-R1-V-Mini (2025-04): https://www.stepfun.com/
- Step 3 (2025-07): https://www.stepfun.com/
- Step 3.5 Flash (2026-02): https://www.stepfun.com/

Additional sources for inclusionAI (Ant-Group) Phase 4 additions:
- Ling-lite-1.5 (2025-05): https://huggingface.co/inclusionAI/Ling-lite-1.5 + arxiv 2503.05139
- Ming-Lite-Omni (2025-05): https://huggingface.co/inclusionAI/Ming-Lite-Omni + arxiv 2506.09344
- Ring-lite (2025-06): https://huggingface.co/inclusionAI/Ring-lite + arxiv 2506.14731
- Ming-Lite-Omni-1.5 (2025-07): https://huggingface.co/inclusionAI/Ming-Lite-Omni
- Ling-1T (2025-10): https://huggingface.co/inclusionAI/Ling-1T + arxiv 2510.22115
- Ring-1T (2025-10): https://huggingface.co/inclusionAI/Ring-1T + arxiv 2510.18855
- Ming-flash-omni-Preview (2025-10): https://huggingface.co/inclusionAI/Ming-flash-omni-2.0
- Ring-2.5-1T (2026-02): https://huggingface.co/inclusionAI/Ring-2.5-1T
- Ling-2.5-1T (2026-02): https://huggingface.co/inclusionAI/Ling-2.5-1T
- Ming-flash-omni-2.0 (2026-02): https://huggingface.co/inclusionAI/Ming-flash-omni-2.0

Additional sources for Phase 5 gap-audit additions:
- Mistral Medium (2023-12): https://mistral.ai/news/la-plateforme/
- Mistral Small (2024-02): https://mistral.ai/news/mistral-small-2402/
- ABAB 6.5 (2024-04): https://www.minimaxi.com/
- Video-01 (2024-09): https://hailuoai.video/
- Ministral 8B (2024-10): https://mistral.ai/news/ministraux/
- Codestral 25.01 (2025-01): https://mistral.ai/news/codestral-2501/
- Kimi K1.5 (2025-01): https://www.testingcatalog.com/kimi-k1-5-by-moonshotai-achieves-sota-benchmarks-in-reasoning/
- Gemini 2.0 Pro (2025-02): https://blog.google/technology/google-deepmind/gemini-model-updates-february-2025/
- Janus-Pro (2025-02): https://github.com/deepseek-ai/Janus
- Gemini 2.5 Flash (2025-04): https://blog.google/technology/google-deepmind/gemini-2-5-flash/
- Speech-02 (2025-04): https://www.minimaxi.com/
- Devstral (2025-05): https://mistral.ai/news/devstral/
- DeepSeek-Prover-V2 (2025-05): https://github.com/deepseek-ai/DeepSeek-Prover-V2
- Mistral Small 3.2 (2025-06): https://mistral.ai/news/mistral-small-3-2/
- Devstral Medium (2025-07): https://mistral.ai/news/devstral-medium/
- Voxtral (2025-07): https://mistral.ai/news/voxtral/
- Grok 4 (2025-07): https://x.ai/blog/grok-4
- Qwen-MT (2025-07): https://qwenlm.github.io/blog/qwen-mt/
- Command A Vision (2025-07): https://cohere.com/blog/command-a-vision

Additional sources for inclusionAI research models (Phase 5):
- AReaL-SEA (2026-01): arxiv 2601.22607
- LLaDA2.1 (2026-02): arxiv 2602.08676
- AReaL-tau2 (2026-03): https://huggingface.co/inclusionAI

Additional sources for Phase 7 additions (Xiaomi + Gemma + Qwen):
- MiLM-6B (2023-08): https://github.com/XiaoMi/MiLM-6B
- MiMo-7B (2025-05): https://arxiv.org/abs/2505.07608 + https://github.com/XiaomiMiMo/MiMo
- MiMo-VL Miloco-7B (2025-11): https://huggingface.co/xiaomi-open-source/Xiaomi-MiMo-VL-Miloco-7B
- MiMo-Embodied-7B (2025-11): https://huggingface.co/XiaomiMiMo/MiMo-Embodied-7B
- MiMo-V2-Flash (2025-12): https://github.com/XiaomiMiMo/MiMo-V2-Flash
- MiMo-V2-Pro + MiMo-V2-Omni + MiMo-V2-TTS (2026-03): https://mimo.xiaomi.com + https://pandaily.com/xiaomi-unveils-three-in-house-foundation-models-confirms-mi-mo-v2-pro-identity
- Gemma 3n (2025-07): https://huggingface.co/google/gemma-3n-E2B-it
- Gemma 4 (2026-04): https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Qwen3.5 (2026-02): https://qwen.ai/blog?id=qwen3.5 + https://klingaio.com/blogs/qwen-3_5
- Qwen3.6-Plus (2026-04): https://qwen.ai/blog?id=qwen3.6 + https://www.alibabacloud.com/blog/qwen3-6-plus-towards-real-world-agents_603005

Additional sources for xAI Phase 8 additions:
- Grok 4.1 (2025-11): https://x.ai/news/grok-4-1 + https://docs.x.ai/developers/release-notes
- Grok 4.2 Beta (2026-02): https://gigazine.net/gsc_news/en/20260218-grok-4-2-public-beta + https://docs.x.ai/developers/release-notes


Additional sources for Phase 9 confirmations:
- GPT-5 (2025-08): https://openai.com/blog/introducing-gpt-5
- Claude Opus 4.1 (2025-08): https://www.anthropic.com/news/claude-opus-4-1
- Claude Sonnet 4.5 (2025-09): https://www.anthropic.com/news/claude-sonnet-4-5
- Claude Haiku 4.5 (2025-10): https://www.anthropic.com/news/claude-haiku-4-5
- GPT-5.1 (2025-11): https://openai.com/blog/introducing-gpt-5-1
- Claude Opus 4.5 (2025-11): https://www.anthropic.com/news/claude-opus-4-5
- GPT-5.2 (2025-12): https://openai.com/blog/introducing-gpt-5-2
- Kimi 2.5 (2026-01): https://kimi-k2.org/en/blog/19-kimi-k25-upgrade-en
- GPT-5.3-Codex (2026-02): https://openai.com/index/introducing-gpt-5-3-codex/
- Claude Sonnet 4.6 (2026-02): https://www.anthropic.com/news/claude-sonnet-4-6
- Claude Opus 4.6 (2026-02): https://techcrunch.com/2026/02/05/anthropic-releases-opus-4-6-with-new-agent-teams/
- Gemini 3.1 Pro (2026-02): https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-pro/
- GLM-5 (2026-02): https://www.reuters.com/technology/chinas-ai-startup-zhipu-releases-new-flagship-model-glm-5-2026-02-11/
- MiniMax-M2.5 (2026-02): https://www.minimax.io/news/minimax-m25
- Doubao 2.0 (2026-02): https://www.reuters.com/world/asia-pacific/chinas-bytedance-releases-doubao-20-ai-chatbot-2026-02-14/
- GPT-5.4 (2026-03): https://openai.com/index/introducing-gpt-5-4/
- Mistral Small 4 (2026-03): https://mistral.ai/news/mistral-small-4
- MiniMax-M2.7 (2026-03): https://www.minimax.io/news/minimax-m27-en

Additional sources for Phase 10 moves:
- Seedance 1.0 (2025-06): https://seed.bytedance.com/en/blog/tech-report-of-seedance-1-0-is-now-publicly-available
- Kimi K2 0905 (2025-09): https://platform.kimi.ai/docs/guide/kimi-k2-quickstart
- Gemini 3 (2025-11): https://blog.google/products/gemini/gemini-3/
- Kimi K2 Thinking (2025-11): https://kimi-k2.org/blog/15-kimi-k2-thinking-en
- Gemini 3.1 Flash-Lite (2026-03): https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-lite/
- Gemini 3.1 Flash Live (2026-03): https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-flash-live/
- GLM-5.1 (2026-04): https://z.ai/blog/glm-5.1

Additional sources for Phase 11 coding-agent additions:
- Claude Code (2025-02): https://docs.anthropic.com/en/docs/claude-code/overview
- Codex (2025-05): https://openai.com/blog/introducing-codex
- Claude Code Agent Teams (2026-02): https://docs.anthropic.com/en/docs/claude-code/agent-teams
- Codex multi-agent (2026-03): https://developers.openai.com/codex/multi-agent/

Additional sources for Phase 12 open-source column:
- Claude Mythos Preview (2026-04): https://red.anthropic.com/2026/mythos-preview/
- Muse Spark (2026-04): https://ai.meta.com/blog/introducing-muse-spark-msl/
- LangChain (2022-10, anchored at 2022-11 row): https://github.com/langchain-ai/langchain
- AutoGPT (2023-03): https://github.com/Significant-Gravitas/AutoGPT
- AutoGen (2023-08): https://github.com/microsoft/autogen
- LangGraph (2023-08): https://github.com/langchain-ai/langgraph
- CrewAI (2023-10): https://github.com/crewAIInc/crewAI
- OpenHands (2024-03): https://github.com/OpenHands/OpenHands
- OpenCode (2025-04): https://github.com/anomalyco/opencode
- Hermes Agent (2025-07): https://github.com/NousResearch/hermes-agent
- OpenClaw (2025-11): https://github.com/openclaw/openclaw
- Oh-My-OpenAgent / formerly Oh-My-OpenCode (2025-12): https://github.com/code-yeongyu/oh-my-openagent

Additional sources for Phase 13 zero-question cleanup:
- Kimi K2 Turbo Preview (2025-08): https://kimi-k2.org/de/blog/08-kimi-k2-turbo-preview-en
- DeepSeek-V3.1 (2025-08): https://cloud.google.com/vertex-ai/generative-ai/docs/maas/deepseek/deepseek-v31
- DeepSeek-V3.1-Terminus (2025-09): https://api-docs.deepseek.com/news/news250922
- Doubao Seed Code (2025-11): https://skywork.ai/blog/llm/doubao-seed-code-official-release-2025/
- ERNIE 5.0 (2025-11): https://www.prnewswire.com/news-releases/baidu-unveils-ernie-5-0-and-a-series-of-ai-applications-at-baidu-world-2025--ramps-up-global-push-302614531.html
- DeepSeek-V3.2 (2025-12): https://api-docs.deepseek.com/news/news251201
- Mistral Large 3 (2025-12): https://docs.mistral.ai/models/mistral-large-3-25-12/
- Ministral 3 (2025-12): https://aws.amazon.com/about-aws/whats-new/2025/12/mistral-large-3-ministral-3-family-available-amazon-bedrock/
