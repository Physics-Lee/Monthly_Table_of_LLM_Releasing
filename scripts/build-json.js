/**
 * build-json.js
 *
 * 从 CSV + MD 文件自动生成：
 *   - data.json   (Web App 用的结构化数据)
 *   - links.json  (模型名 → URL 映射)
 *   - README.md   (超链接表格)
 *
 * 用法: node scripts/build-json.js [csvPath] [mdPath] [outputDir]
 * 默认: csv=llm_release_timeline_2022-11_to_2026-04.csv
 *       md=llm_release_timeline_2022-11_to_2026-04.md
 *       outputDir=./
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 命令行参数
// ---------------------------------------------------------------------------
const [, , csvArg, mdArg, outArg] = process.argv;
const CSV_PATH = csvArg || 'llm_release_timeline_2022-11_to_2026-04.csv';
const MD_PATH  = mdArg  || 'llm_release_timeline_2022-11_to_2026-04.md';
const OUT_DIR  = outArg || '.';

// ---------------------------------------------------------------------------
// 1. 解析 CSV → rows[]
// ---------------------------------------------------------------------------
function parseCSV(csvPath) {
  const raw = fs.readFileSync(csvPath, 'utf8').trim();
  const lines = raw.split('\n').filter(l => l.trim());
  if (lines.length < 2) throw new Error(`CSV 至少需要 header + 1 行数据: ${csvPath}`);

  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    if (values.length !== headers.length) {
      console.warn(`  ⚠ 行 ${i + 1} 字段数不匹配 (${values.length} vs ${headers.length})，跳过`);
      continue;
    }
    const row = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] || '').trim(); });
    rows.push(row);
  }

  console.log(`✓ CSV 解析完成: ${rows.length} 行, ${headers.length} 列`);
  return { headers, rows };
}

/**
 * 智能拆分 CSV 行（处理引号包裹的字段内含逗号的情况）
 * 例: "a,b,c",d  → ['a,b,c', 'd']
 */
function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'; i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ---------------------------------------------------------------------------
// 2. 解析 MD → { modelNames[], links{} }
// ---------------------------------------------------------------------------
function parseMD(mdPath) {
  const raw = fs.readFileSync(mdPath, 'utf8').trim();
  const lines = raw.split('\n');

  const links = {};  // modelName → url

  // 匹配 [ModelName](url) 格式
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRe.exec(raw)) !== null) {
    const modelName = match[1].trim();
    const url = match[2].trim();
    if (modelName && url && !links[modelName]) {
      links[modelName] = url;
    }
  }

  // 提取表格行（| 开头）
  const tableRows = lines.filter(l => l.startsWith('|') && !l.startsWith('|---') && l.includes('|'));

  console.log(`✓ MD 解析完成: ${tableRows.length} 表格行, ${Object.keys(links).length} 个链接`);
  return { links, tableRows };
}

// ---------------------------------------------------------------------------
// 3. 生成 data.json
// ---------------------------------------------------------------------------
function buildDataJSON(headers, rows) {
  const vendors = headers.filter(h => h !== 'Month');
  return {
    vendors,
    rows: rows.map(row => {
      const out = { Month: row.Month };
      vendors.forEach(v => { out[v] = row[v] || ''; });
      return out;
    })
  };
}

// ---------------------------------------------------------------------------
// 4. 生成 links.json（从 MD 链接 + 内嵌 hardcoded 补充）
// ---------------------------------------------------------------------------
function buildLinksJSON(mdLinks, rows) {
  const links = { ...mdLinks };

  // 从 rows 里的模型名自动补充 links（如果 MD 里没有 URL）
  rows.forEach(row => {
    Object.entries(row).forEach(([vendor, cell]) => {
      if (!cell || vendor === 'Month') return;
      // cell 格式: "ModelA + ModelB + ModelC" 或 "ModelA + ModelB"
      const names = cell.split('+').map(s => s.trim()).filter(Boolean);
      names.forEach(name => {
        // 去掉已经有的
        if (!links[name]) {
          // 尝试从已知模式推断 URL（不覆盖已有）
          const inferred = inferURL(name);
          if (inferred) links[name] = inferred;
        }
      });
    });
  });

  return links;
}

/** 根据模型名 Hardcoded 推断 URL（补漏用） */
function inferURL(modelName) {
  const infer = [
    [/^GPT-4$/, 'https://openai.com/index/gpt-4'],
    [/^GPT-3\.5$/, 'https://openai.com/index/gpt-3-5'],
    [/^Claude Instant /, 'https://www.anthropic.com/news/releasing-claude-instant-1-2'],
    [/^Claude 1$/, 'https://www.anthropic.com/news/introducing-claude'],
    [/^Claude 2(\.\d)?$/, 'https://www.anthropic.com/news/claude-2-1'],
    [/^Llama 1$/, 'https://github.com/facebookresearch/llama'],
    [/^Llama 2$/, 'https://ai.meta.com/blog/meta-llama-2/'],
    [/^Llama 3$/, 'https://ai.meta.com/blog/meta-llama-3/'],
    [/^Llama 3\.1/, 'https://ai.meta.com/blog/meta-llama-3-1/'],
    [/^Llama 3\.2/, 'https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/'],
    [/^Llama 3\.3/, 'https://llama.meta.com/llama3_3/license/'],
    [/^Llama 4/, 'https://ai.meta.com/blog/llama-4-multimodal-intelligence/'],
    [/^Bailing/, 'https://www.reuters.com/technology/ant-group-launches-ai-model-bailing-2023-07-18/'],
    [/^Bailing 2/, 'https://www.businesswire.com/news/home/20230908406520/en/'],
    [/^Ling$/, 'https://www.reuters.com/technology/ant-group-unveils-ling-large-language-model-2024-05-06/'],
    [/^Ling-/, 'https://huggingface.co/inclusionAI'],
    [/^Step-/, 'https://hub.baai.ac.cn/view/38402'],
    [/^Mistral 7B/, 'https://mistral.ai/news/la-plateforme/'],
    [/^Mixtral/, 'https://mistral.ai/news/la-plateforme/'],
    [/^Gemini 1\./, 'https://blog.google/technology/ai/'],
    [/^Bard/, 'https://blog.google/technology/ai/'],
    [/^ERNIE Bot/, 'https://www.prnewswire.com/news-releases/baidu-unveils-ernie-bot-the-latest-generative-ai-mastering-chinese-language-and-multi-modal-generation-301774240.html'],
    [/^ERNIE 3\./, 'https://gigazine.net/gsc_news/en/20230628-baidu-ernie-3-5/'],
    [/^ERNIE 4\.0$/, 'https://www.prnewswire.com/news-releases/baidu-launches-ernie-4-0-foundation-model-leading-a-new-wave-of-ai-native-applications-301958681.html'],
    [/^ERNIE 4\.0 Turbo/, 'https://www.reuters.com/technology/chinas-baidu-unveils-latest-version-its-ernie-ai-model-2023-10-17/'],
    [/^ERNIE 4\.5$/, 'https://ernie.baidu.com/blog/zh/posts/ernie4.5/'],
    [/^ERNIE 4\.5 Turbo/, 'https://home.baidu.com/home/index/news_detail/id/18020'],
    [/^ERNIE 4\.5 Open/, 'https://ernie.baidu.com/blog/zh/posts/ernie4.5/'],
    [/^ERNIE 5\./, 'https://www.prnewswire.com/news-releases/baidu-unveils-ernie-5-0-and-a-series-of-ai-applications-at-baidu-world-2025--ramps-up-global-push-302614531.html'],
    [/^ERNIE X1\.1/, 'https://ernie.baidu.com/blog/zh/posts/ernie4.5/'],
    [/^ERNIE X/, 'https://www.prnewswire.com/news-releases/baidu-unveils-ernie-4-5-and-reasoning-model-ernie-x1--makes-ernie-bot-free-ahead-of-schedule-302402490.html'],
    [/^ChatGLM/, 'https://github.com/THUDM/ChatGLM'],
    [/^GLM-4$/, 'https://github.com/THUDM/GLM-4'],
    [/^GLM-4-Plus/, 'https://www.aibase.com/news/11400'],
    [/^GLM-Zero-Preview/, 'https://www.ctol.digital/news/zhipu-ai-glm-zero-preview-vs-openai-o1-ai-race/'],
    [/^GLM-4\.5/, 'https://docs.z.ai/guides/llm/glm-4.5'],
    [/^GLM-5$/, 'https://www.reuters.com/technology/chinas-ai-startup-zhipu-releases-new-flagship-model-glm-5-2026-02-11/'],
    [/^GLM-5\.1/, 'https://z.ai/blog/glm-5.1'],
    [/^GLM-/, 'https://z.ai/'],
    [/^Spark 1\.0/, 'https://mp.weixin.qq.com/s/3esI9MJsHgHuMZHNOFuVuA'],
    [/^Spark 1\.5/, 'https://wap.bjd.com.cn/news/2023/05/06/10422555.shtml'],
    [/^Spark 2\.0/, 'https://app.dahecube.com/nweb/news/20230506/161691n915c3f8b152.htm'],
    [/^Spark 3\.0/, 'https://www.geekpark.net/news/331090'],
    [/^Spark 3\.5/, 'https://www.geekpark.net/news/331090'],
    [/^Spark 4\.0/, 'http://www.ce.cn/xwzx/gnsz/gdxw/202305/08/t20230508_38536688.shtml'],
    [/^Spark X1/, 'https://baike.baidu.com/item/讯飞星火深度推理模型X1/65293924'],
    [/^Spark X/, 'https://baike.baidu.com/item/讯飞星火深度推理模型X1/65293924'],
    [/^Doubao/, 'https://baike.baidu.com/en/item/Doubao%20Large%20Model/1469492'],
    [/^Moonshot/, 'https://platform.moonshot.cn/blog/posts/kimi-latest'],
    [/^Kimi/, 'https://platform.moonshot.cn/blog/posts/kimi-latest'],
    [/^MiniMax-Text-01/, 'https://github.com/MiniMax-AI/MiniMax-01'],
    [/^MiniMax-VL-01/, 'https://github.com/MiniMax-AI/MiniMax-01'],
    [/^MiniMax-M1/, 'https://github.com/MiniMax-AI/MiniMax-01'],
    [/^MiniMax-M2/, 'https://www.minimax.io/news/minimax-m27-en'],
    [/^Speech-02/, 'https://www.minimax.io/news/minimax-speech-02'],
    [/^ABAB 6\.5/, 'https://www.minimax.io/news/abab65-series'],
    [/^MiniMax/, 'https://www.minimax.io/news/minimax-speech-02'],
    [/^ABAB /, 'https://www.minimax.io/news/abab65-series'],
    [/^MiLM-/, 'https://github.com/XiaoMi/MiLM-6B'],
    [/^MiMo/, 'https://github.com/XiaomiMiMo'],
    [/^Zhixiaobao/, 'https://www.businesswire.com/news/home/20240904932587/en/Ant-Group-Launches-AI-Powered-Mobile-App-Zhixiaobao-at-2024-INCLUSIONConference-on-the-Bund'],
    [/^AReaL/, 'https://huggingface.co/inclusionAI'],
    [/^LLaDA/, 'https://github.com'],
    [/^CodeFuse/, 'https://github.com/codefuse-ai'],
    [/^moonshot-v1/, 'https://kimi.moonshot.cn/'],
    [/^Hailuo/, 'https://hailuoai.video/'],
    [/^AutoGLM/, 'https://github.com'],
    [/^Video-01/, 'https://hailuoai.video/'],
    [/^kimi-latest/, 'https://kimi.moonshot.cn/'],
    [/^kimi-thinking/, 'https://kimi.moonshot.cn/'],
    [/^Kimi K2/, 'https://kimi-k2.org/'],
    [/^Claude Sonnet 4\.[0-5]/, 'https://www.anthropic.com/news/claude-sonnet-4-5'],
    [/^Claude Opus 4\.[0-5]/, 'https://www.anthropic.com/news/claude-opus-4-5'],
    [/^Claude Haiku 4\.[0-5]/, 'https://www.anthropic.com/news/claude-haiku-4-5'],
    [/^Claude 3/, 'https://www.anthropic.com/news/claude-3'],
    [/^Claude 2/, 'https://www.anthropic.com/news/claude-2-1'],
    [/^Muse Spark/, 'https://ai.meta.com/blog/introducing-muse-spark-msl/'],
    [/^Qwen-?\d/, 'https://huggingface.co/Qwen'],
    [/^Qwen\d/, 'https://huggingface.co/Qwen'],
    [/^Qwen3\./, 'https://qwen.ai/blog?id=qwen3'],
    [/^DeepSeek-LLM$/, 'https://github.com/deepseek-ai/DeepSeek-LLM'],
    [/^DeepSeek-V2$/, 'https://github.com/deepseek-ai/DeepSeek-V2/releases'],
    [/^DeepSeek-V2\.5-1210/, 'https://huggingface.co/deepseek-ai/DeepSeek-V2.5-1210'],
    [/^DeepSeek-V3$/, 'https://github.com/deepseek-ai/DeepSeek-V3'],
    [/^DeepSeek-V3-0324/, 'https://github.blog/changelog/2025-04-08-deepseek-v3-0324-is-now-generally-available-in-github-models/'],
    [/^DeepSeek-V3\.1$/, 'https://huggingface.co/deepseek-ai/DeepSeek-V3.1'],
    [/^DeepSeek-V3\.1-Terminus/, 'https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Terminus'],
    [/^DeepSeek-V/, 'https://github.com/deepseek-ai/DeepSeek-LLM'],
    [/^DeepSeek-Coder/, 'https://github.com/deepseek-ai/DeepSeek-Coder'],
    [/^Embed v3/, 'https://cohere.com/blog/introducing-embed-v3'],
    [/^Rerank v3/, 'https://cohere.com/blog/rerank-3'],
    [/^DeepSeek-R/, 'https://github.com/deepseek-ai/DeepSeek-R1'],
    [/^DeepSeek-MoE/, 'https://github.com/deepseek-ai/DeepSeek-MoE'],
    [/^DeepSeek-Math/, 'https://github.com/deepseek-ai/DeepSeek-Math'],
    [/^DeepSeek-VL/, 'https://github.com/deepseek-ai/DeepSeek-VL'],
    [/^Janus-Pro/, 'https://github.com/deepseek-ai/Janus'],
    [/^Grok-1\.5$/, 'https://x.ai/blog/grok-1.5'],
    [/^Grok-2 beta/, 'https://x.ai/news/grok-2'],
    [/^Grok-2$/, 'https://x.ai/news/grok-2'],
    [/^Grok-2 mini/, 'https://techcrunch.com/2024/08/13/xais-grok-can-now-generate-images-on-x/'],
    [/^Grok 3$/, 'https://x.ai/news/grok-3'],
    [/^Grok-3 mini/, 'https://techcrunch.com/2025/02/17/elon-musks-xai-releases-its-latest-flagship-ai-grok-3/'],
    [/^Grok 4$/, 'https://x.ai/blog/grok-4'],
    [/^Grok-4/, 'https://x.ai/news/grok-4-1'],
    [/^Aya /, 'https://cohere.com/research/aya'],
    [/^Command R/, 'https://cohere.com/research/command-r'],
    [/^Command A/, 'https://cohere.com/blog/command-a'],
    [/^Pixtral/, 'https://mistral.ai/news/pixtral-12b/'],
    [/^Ministral/, 'https://mistral.ai/news/ministraux/'],
    [/^Magistral/, 'https://mistral.ai/news/magistral/'],
    [/^Devstral/, 'https://mistral.ai/news/devstral/'],
    [/^Codestral/, 'https://mistral.ai/news/codestral/'],
    [/^Voxtral/, 'https://mistral.ai/news/voxtral/'],
    [/^Mistral Small \d/, 'https://mistral.ai/news/mistral-small-2402/'],
    [/^Mistral Large \d/, 'https://mistral.ai/news/la-plateforme/'],
    [/^Mistral Medium/, 'https://mistral.ai/news/la-plateforme/'],
    [/^o1-mini/, 'https://openai.com/index/o1'],
    [/^o1-preview/, 'https://openai.com/index/o1'],
    [/^o1 Pro/, 'https://openai.com/index/o1-pro/'],
    [/^o3-mini/, 'https://openai.com/index/o3-mini'],
    [/^o3$/, 'https://openai.com/index/o3'],
    [/^o4-mini/, 'https://openai.com/index/o4'],
    [/^GPT-5/, 'https://openai.com/blog/introducing-gpt-5'],
    [/^GPT-4\.5/, 'https://openai.com/blog/gpt-4-5'],
    [/^GPT-4o/, 'https://openai.com/index/gpt-4o'],
    [/^GPT-4 Turbo/, 'https://openai.com/index/gpt-4-turbo'],
    [/^GPT-4V/, 'https://openai.com/index/gpt-4v-system-card/'],
    [/^Sora/, 'https://openai.com/index/sora-is-here/'],
    [/^Gemma \d/, 'https://blog.google/technology/developers-tools/gemma-4/'],
    [/^Gemma 3n/, 'https://huggingface.co/google/gemma-3n-E2B-it'],
    [/^Gemini 2\.0 Flash/, 'https://blog.google/technology/google-deepmind/gemini-model-updates-february-2025/'],
    [/^Gemini 3\./, 'https://blog.google/products/gemini/gemini-3/'],
    [/^Gemini 1\./, 'https://blog.google/technology/ai/'],
    [/^Llama$/, 'https://github.com/facebookresearch/llama'],
    [/^Seedance/, 'https://seed.bytedance.com/'],
    [/^Ling-Plus/, 'https://huggingface.co/inclusionAI'],
    [/^Ling-Lite/, 'https://huggingface.co/inclusionAI'],
    [/^Ling-lite/, 'https://huggingface.co/inclusionAI'],
    [/^Ring-\d/, 'https://huggingface.co/inclusionAI'],
    [/^Ming-/, 'https://huggingface.co/inclusionAI'],
    [/^Step \d/, 'https://www.stepfun.com/'],
    [/^Step-R/, 'https://www.stepfun.com/'],
    [/^OpenHands/, 'https://github.com/OpenHands/OpenHands'],
    [/^AutoGen/, 'https://github.com/microsoft/autogen'],
    [/^LangChain/, 'https://github.com/langchain-ai/langchain'],
    [/^LangGraph/, 'https://github.com/langchain-ai/langgraph'],
    [/^CrewAI/, 'https://github.com/crewAIInc/crewAI'],
    [/^DSPy/, 'https://github.com/stanfordnlp/dspy'],
    [/^AutoGPT/, 'https://github.com/Significant-Gravitas/AutoGPT'],
    [/^llama\.cpp/, 'https://github.com/ggml-org/llama.cpp'],
    [/^vLLM/, 'https://github.com/vllm-project/vllm'],
    [/^Ollama/, 'https://github.com/ollama/ollama'],
    [/^LLaMA-Factory/, 'https://github.com/hiyouga/LLaMA-Factory'],
    [/^Axolotl/, 'https://github.com/axolotl-ai-cloud/axolotl'],
    [/^SGLang/, 'https://github.com/sgl-project/sglang'],
    [/^Cherry Studio/, 'https://github.com/CherryHQ/cherry-studio'],
    [/^Unsloth/, 'https://github.com/unslothai/unsloth'],
    [/^OpenCode/, 'https://github.com/anomalyco/opencode'],
    [/^Hermes Agent/, 'https://github.com/NousResearch/hermes-agent'],
    [/^OpenClaw/, 'https://github.com/openclaw/openclaw'],
    [/^Oh-My-OpenAgent/, 'https://github.com/code-yeongyu/oh-my-openagent'],
    [/^Jan$/, 'https://github.com/janhq/jan'],
    [/^MarkItDown/, 'https://github.com/microsoft/markitdown'],
    [/^andrej-karpathy-skills/, 'https://github.com/forrestchang/andrej-karpathy-skills'],
    // Kuaishou Kling
    [/^Kling /, 'https://klingai.kuaishou.com/'],
    [/^Kling$/, 'https://klingai.kuaishou.com/'],
    // Boss Nanbeige
    [/^Nanbeige/, 'https://huggingface.co/Nanbeige'],
    // Microsoft
    [/^Phi-1$/, 'https://www.microsoft.com/en-us/research/publication/textbooks-are-all-you-need/'],
    [/^Phi-1\.5$/, 'https://www.microsoft.com/en-us/research/publication/textbooks-are-all-you-need-ii-phi-1-5-technical-report/'],
    [/^Phi-2$/, 'https://www.microsoft.com/en-us/research/blog/phi-2-the-surprising-power-of-small-language-models/'],
    [/^Phi-3/, 'https://azure.microsoft.com/en-us/blog/introducing-phi-3-redefining-whats-possible-with-slms/'],
    [/^Phi-4$/, 'https://www.microsoft.com/en-us/research/publication/phi-4-reasoning-vision-15b-technical-report/'],
    [/^Orca 2/, 'https://www.microsoft.com/en-us/research/blog/orca-2-teaching-small-language-models-how-to-reason/'],
    [/^Orca$/, 'https://www.microsoft.com/en-us/research/publication/orca-progressive-learning-from-complex-explanation-traces-of-gpt-4/'],
    // Apple
    [/^MLX$/, 'https://github.com/ml-explore/mlx'],
    [/^OpenELM$/, 'https://machinelearning.apple.com/research/openelm'],
    [/^Ferret$/, 'https://github.com/apple/ml-ferret'],
    [/^Apple Intelligence$/, 'https://www.apple.com/newsroom/2024/10/apple-intelligence-is-available-today-on-iphone-ipad-and-mac/'],
    [/^Ferret-UI$/, 'https://github.com/apple/ml-ferret'],
    [/^FastVLM$/, 'https://arxiv.org/abs/2412.13303'],
    [/^Apple Intelligence iOS 18\.4$/, 'https://www.apple.com/newsroom/2025/03/apple-intelligence-features-expand-to-new-languages-and-regions-today/'],
    // NVIDIA
    [/^Nemotron-4 15B$/, 'https://arxiv.org/abs/2402.16819'],
    [/^Nemotron-4 340B$/, 'https://arxiv.org/abs/2406.11704'],
    [/^Llama-3\.1-Nemotron/, 'https://developer.nvidia.com/blog/leverage-our-latest-open-models-for-synthetic-data-generation-with-nvidia-nemotron-4-340b/'],
    [/^Nemotron 3/, 'https://blogs.nvidia.com/blog/nemotron-model-families'],
    // Stability AI
    [/^StableLM/, 'https://github.com/Stability-AI/StableLM'],
    [/^Stable Diffusion 3$/, 'https://stability.ai/news/stable-diffusion-3'],
    [/^Stable Code/, 'https://stability.ai/news/stable-code-2024-llm-code-completion-release'],
    // Amazon
    [/^Titan/, 'https://aws.amazon.com/bedrock/titan/'],
    // SenseTime
    [/^SenseNova/, 'https://www.sensetime.com/'],
    [/^SenseChat$/, 'https://www.sensetime.com/'],
    // AI21
    [/^Jurassic-2/, 'https://www.ai21.com/blog/introducing-jurassic-2-and-task-specific-apis/'],
    [/^Jurassic-1/, 'https://www.ai21.com/blog/announcing-ai21-studio-and-jurassic-1/'],
    [/^Jamba/, 'https://www.ai21.com/blog/announcing-jamba/'],
  ];

  for (const [re, url] of infer) {
    if (re.test(modelName)) return url;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 5. 生成 README.md（复用原有 generate-readme.js 的表格渲染逻辑）
// ---------------------------------------------------------------------------
function generateReadme(vendors, rows, links, onlineUrl, githubUrl) {
  function findUrl(model) {
    if (links[model]) return links[model];
    const clean = model.replace(/`/g, '').trim();
    if (links[clean]) return links[clean];
    for (const [key, url] of Object.entries(links)) {
      if (key.toLowerCase() === model.toLowerCase()) return url;
      if (key.toLowerCase() === clean.toLowerCase()) return url;
    }
    return null;
  }

  function formatCell(text) {
    if (!text) return '';
    return text.split('+').map(s => s.trim()).filter(Boolean).map(name => {
      const url = findUrl(name);
      return url ? `[${name}](${url})` : name;
    }).join(' + ');
  }

  const headers = ['Month', ...vendors];
  let md = `# LLM Release Timeline

> 持续追踪全球大模型发布动态 | ${rows[0]?.Month || ''} ~ ${rows[rows.length - 1]?.Month || ''}

## 在线访问

直接访问：[${onlineUrl}](${onlineUrl})

GitHub 仓库：[${githubUrl}](${githubUrl})

## 覆盖厂商

${vendors.join('、')}

## 发布时间线

| ${headers.join(' | ')} |
|${headers.map(() => '---').join('|')}|
`;

  rows.forEach(row => {
    const cells = headers.map(h => formatCell(row[h] || ''));
    md += `| ${cells.join(' | ')} |\n`;
  });

  md += `
## 说明

- 空白单元格表示该厂商当月无已验证的公开发布
- 部分中国厂商数据来自官方里程碑页面或开发者发布说明
- 数据仅供参考，以各厂商官方公告为准

## Coding Plan Price & API Price

- Coding Plan Price: https://z4crk6mg95.coze.site/
- API Price: https://openrouter.ai/models?order=pricing-high-to-low

## 更新日志

- ${new Date().toISOString().slice(0, 10)}：自动重建数据

---
> 由社区维护，欢迎提交 Issue 和 Pull Request
`;

  return md;
}

// ---------------------------------------------------------------------------
// 主流程
// ---------------------------------------------------------------------------
function main() {
  console.log('\n📦 LLM Timeline 数据构建\n');
  console.log(`  CSV:  ${CSV_PATH}`);
  console.log(`  MD:   ${MD_PATH}`);
  console.log(`  OUT:  ${OUT_DIR}\n`);

  // 检查文件存在
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV 文件不存在: ${CSV_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(MD_PATH)) {
    console.error(`❌ MD 文件不存在: ${MD_PATH}`);
    process.exit(1);
  }

  // 1. 解析 CSV
  const { headers, rows } = parseCSV(CSV_PATH);

  // 2. 解析 MD（提取链接）
  const { links: mdLinks } = parseMD(MD_PATH);

  // 3. 生成 data.json
  const dataJSON = buildDataJSON(headers, rows);

  // 4. 生成 links.json
  const linksJSON = buildLinksJSON(mdLinks, rows);

  // 5. 生成 README.md
  const ONLINE_URL = process.env.ONLINE_URL || 'https://api.dreamfree.space/c/s/llm-timeline';
  const GITHUB_URL = process.env.GITHUB_URL || 'https://github.com/Physics-Lee/Monthly_Table_of_LLM_Releasing';
  const readme = generateReadme(dataJSON.vendors, dataJSON.rows, linksJSON, ONLINE_URL, GITHUB_URL);

  // 6. 写入文件
  const write = (filePath, content) => {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ 已写入: ${filePath}`);
  };

  write(path.join(OUT_DIR, 'data.json'),   JSON.stringify(dataJSON, null, 2));
  write(path.join(OUT_DIR, 'links.json'),   JSON.stringify(linksJSON, null, 2));
  write(path.join(OUT_DIR, 'README.md'),    readme);

  // 7. 统计
  const dataRows = dataJSON.rows.length;
  const linkCount = Object.keys(linksJSON).length;
  console.log(`\n✅ 完成！`);
  console.log(`   data.json:  ${dataRows} 行 × ${dataJSON.vendors.length} 列`);
  console.log(`   links.json: ${linkCount} 条映射`);
  console.log(`   README.md:  已生成\n`);
}

main();
