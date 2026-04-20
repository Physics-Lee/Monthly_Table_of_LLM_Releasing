/**
 * check-missing-links.js
 * Check which models in MD have no hyperlinks
 */

const fs = require('fs');

const REPO = 'D:/Repositories/Monthly_Table_of_LLM_Releasing';
const MD_PATH = `${REPO}/llm_release_timeline_2022-11_to_2026-04.md`;
const LINKS_PATH = `${REPO}/links.json`;

const raw = fs.readFileSync(MD_PATH, 'utf8');
const links = JSON.parse(fs.readFileSync(LINKS_PATH, 'utf8'));

const lines = raw.split('\n');
const tableRows = lines.filter(l => l.startsWith('|') && !l.startsWith('|---'));

const headerLine = tableRows[0];
const headers = headerLine.split('|').map(c => c.trim()).filter(c => c);

const missing = [];
const dataRows = tableRows.slice(1);

dataRows.forEach((line, idx) => {
  const cells = line.split('|').map(c => c.trim());
  const dataCells = cells.slice(1, -1);
  const month = dataCells[0];
  
  dataCells.forEach((cell, colIdx) => {
    if (colIdx === 0) return; // skip Month
    if (!cell) return;
    
    const vendor = headers[colIdx];
    
    // Extract all models (split by +)
    const allModels = cell.split('+').map(s => s.trim()).filter(Boolean);
    
    allModels.forEach(modelStr => {
      // Remove markdown link syntax to get raw model name
      const cleanModel = modelStr.replace(/\[([^\]]+)\]\([^)]+\)/, '$1').trim();
      const isLinked = modelStr.includes('](');
      
      if (!isLinked && cleanModel) {
        // Check if we have a URL in links.json
        const hasUrl = !!links[cleanModel];
        const inferredUrl = inferURL(cleanModel);
        
        missing.push({
          row: month,
          vendor,
          model: cleanModel,
          cell: cell,
          hasUrlInLinks: hasUrl,
          inferredUrl: inferredUrl
        });
      }
    });
  });
});

function inferURL(modelName) {
  const infer = [
    [/^GPT-4$/, 'https://openai.com/index/gpt-4'],
    [/^Claude 1$/, 'https://www.anthropic.com/news/introducing-claude'],
    [/^Claude 2(\.\d)?$/, 'https://www.anthropic.com/news/claude-2-1'],
    [/^Spark 1\.0/, 'https://mp.weixin.qq.com/s/3esI9MJsHgHuMZHNOFuVuA'],
    [/^Spark 1\.5/, 'https://wap.bjd.com.cn/news/2023/05/06/10422555.shtml'],
    [/^Spark 2\.0/, 'https://app.dahecube.com/nweb/news/20230506/161691n915c3f8b152.htm'],
    [/^Spark 3\.0/, 'https://www.geekpark.net/news/331090'],
    [/^Spark 3\.5/, 'https://www.geekpark.net/news/331090'],
    [/^Spark 4\.0/, 'http://www.ce.cn/xwzx/gnsz/gdxw/202305/08/t20230508_38536688.shtml'],
    [/^abab5$/, 'https://www.scmp.com/tech/big-tech/article/3240828/'],
    [/^abab5\.5/, 'https://www.reuters.com/technology/chinese-startup-minimax-launches-abab55-2023-12-05/'],
    [/^Embed v3/, 'https://cohere.com/blog/introducing-embed-v3'],
    [/^Rerank v3/, 'https://cohere.com/blog/rerank-3'],
    [/^Grok-1$/, 'https://techcrunch.com/2023/11/04/xai-launches-grok-its-gpt-4-rival-built-by-xai/'],
    [/^DeepSeek-LLM/, 'https://github.com/deepseek-ai/DeepSeek-LLM'],
    [/^Qwen-14B/, 'https://huggingface.co/Qwen'],
    [/^Qwen-72B/, 'https://huggingface.co/Qwen'],
    [/^Qwen-Audio/, 'https://huggingface.co/Qwen/Qwen-Audio'],
    [/^ERNIE 3\.5/, 'https://research.baidu.com/Blog/index-view?id=185'],
    [/^ERNIE 4\.0$/, 'https://www.prnewswire.com/news-releases/baidu-launches-ernie-4-0-foundation-model-leading-a-new-wave-of-ai-native-applications-301958681.html'],
    [/^Pro$/, 'https://blog.google/company-news/technology/introducing-gemini-our-largest-and-most-capable-ai-model'],
    [/^Nano$/, 'https://blog.google/company-news/technology/introducing-gemini-our-largest-and-most-capable-ai-model'],
    [/^Sonnet$/, 'https://www.anthropic.com/news/claude-3-family'],
    [/^Haiku$/, 'https://www.anthropic.com/news/claude-3-haiku'],
    [/^Mistral Medium$/, 'https://mistral.ai/news/announcing-mistral-7b'],
    [/^Command R$/, 'https://cohere.com/research/command-r'],
    [/^Moonshot/, 'https://platform.moonshot.cn/blog/posts/kimi-latest'],
    [/^MiLM/, 'https://github.com/XiaoMi/MiLM-6B'],
  ];
  
  for (const [re, url] of infer) {
    if (re.test(modelName)) return url;
  }
  return null;
}

// Group by row for better readability
const grouped = {};
missing.forEach(m => {
  if (!grouped[m.row]) grouped[m.row] = [];
  grouped[m.row].push(m);
});

console.log(`\nFound ${missing.length} models without hyperlinks:\n`);

Object.entries(grouped).forEach(([row, items]) => {
  console.log(`\n${row}:`);
  items.forEach(m => {
    const urlStatus = m.hasUrlInLinks ? '✅ links.json' : (m.inferredUrl ? '🔍 inferable' : '❌ no URL');
    console.log(`  [${m.vendor}] ${m.model} - ${urlStatus}`);
    if (m.inferredUrl && !m.hasUrlInLinks) {
      console.log(`      -> ${m.inferredUrl}`);
    }
  });
});

console.log(`\n\nSummary: ${missing.length} plain-text models found`);
console.log(`With URL in links.json: ${missing.filter(m => m.hasUrlInLinks).length}`);
console.log(`Inferable URL: ${missing.filter(m => !m.hasUrlInLinks && m.inferredUrl).length}`);
console.log(`No URL found: ${missing.filter(m => !m.hasUrlInLinks && !m.inferredUrl).length}`);
