const fs = require('fs');
let md = fs.readFileSync('llm_release_timeline_2022-11_to_2026-04.md', 'utf8');

const modelReplacements = [
  // Baidu
  ['[ERNIE Bot](https://yiyan.baidu.com/)', '[ERNIE Bot](https://www.prnewswire.com/news-releases/baidu-unveils-ernie-bot-the-latest-generative-ai-mastering-chinese-language-and-multi-modal-generation-301774240.html)'],
  ['[ERNIE 4.0](https://yiyan.baidu.com/)', '[ERNIE 4.0](https://www.prnewswire.com/news-releases/baidu-launches-ernie-4-0-foundation-model-leading-a-new-wave-of-ai-native-applications-301958681.html)'],
  ['[ERNIE 4.0 Turbo](https://yiyan.baidu.com/)', '[ERNIE 4.0 Turbo](https://www.reuters.com/technology/chinas-baidu-unveils-latest-version-its-ernie-ai-model-2023-10-17/)'],
  ['[ERNIE 4.5](https://yiyan.baidu.com/)', '[ERNIE 4.5](https://ernie.baidu.com/blog/zh/posts/ernie4.5/)'],
  ['[ERNIE 4.5 Turbo](https://yiyan.baidu.com/)', '[ERNIE 4.5 Turbo](https://home.baidu.com/home/index/news_detail/id/18020)'],
  ['[ERNIE 4.5 Open](https://yiyan.baidu.com/)', '[ERNIE 4.5 Open](https://ernie.baidu.com/blog/zh/posts/ernie4.5/)'],
  ['[ERNIE X1.1](https://yiyan.baidu.com/)', '[ERNIE X1.1](https://ernie.baidu.com/blog/zh/posts/ernie4.5/)'],
  ['[ERNIE 5.0](https://yiyan.baidu.com/)', '[ERNIE 5.0](https://www.prnewswire.com/news-releases/baidu-unveils-ernie-5-0-and-a-series-of-ai-applications-at-baidu-world-2025--ramps-up-global-push-302614531.html)'],
  ['[X1 Turbo](https://yiyan.baidu.com/)', '[X1 Turbo](https://home.baidu.com/home/index/news_detail/id/18020)'],
  
  // iFlytek
  ['[Spark 1.0](https://xinghuo.xfyun.cn/)', '[Spark 1.0](https://mp.weixin.qq.com/s/3esI9MJsHgHuMZHNOFuVuA)'],
  ['[Spark 1.5](https://xinghuo.xfyun.cn/)', '[Spark 1.5](https://wap.bjd.com.cn/news/2023/05/06/10422555.shtml)'],
  ['[Spark 2.0](https://xinghuo.xfyun.cn/)', '[Spark 2.0](https://app.dahecube.com/nweb/news/20230506/161691n915c3f8b152.htm)'],
  ['[Spark 3.0](https://xinghuo.xfyun.cn/)', '[Spark 3.0](https://www.geekpark.net/news/331090)'],
  ['[Spark 3.5](https://xinghuo.xfyun.cn/)', '[Spark 3.5](https://www.geekpark.net/news/331090)'],
  ['[Spark 4.0](https://xinghuo.xfyun.cn/)', '[Spark 4.0](http://www.ce.cn/xwzx/gnsz/gdxw/202305/08/t20230508_38536688.shtml)'],
  ['[Spark X1](https://xinghuo.xfyun.cn/)', '[Spark X1](https://baike.baidu.com/item/讯飞星火深度推理模型X1/65293924)'],
  
  // Meta Llama
  ['[Llama 2](https://ai.meta.com/llama)', '[Llama 2](https://ai.meta.com/blog/meta-llama-2/)'],
  ['[Llama 3](https://ai.meta.com/llama)', '[Llama 3](https://ai.meta.com/blog/meta-llama-3/)'],
  ['[Llama 3.1](https://ai.meta.com/llama)', '[Llama 3.1](https://ai.meta.com/blog/meta-llama-3-1/)'],
  ['[Llama 3.2](https://ai.meta.com/llama)', '[Llama 3.2](https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/)'],
  ['[Llama 3.3](https://ai.meta.com/llama)', '[Llama 3.3](https://llama.meta.com/llama3_3/license/)'],
  ['[Llama 4 Scout](https://ai.meta.com/llama)', '[Llama 4 Scout](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)'],
  ['[Llama 4 Maverick](https://ai.meta.com/llama)', '[Llama 4 Maverick](https://ai.meta.com/blog/llama-4-multimodal-intelligence/)'],
  
  // xAI Grok
  ['[Grok-1.5](https://x.ai/)', '[Grok-1.5](https://x.ai/blog/grok-1.5)'],
  ['[Grok-2 beta](https://x.ai/)', '[Grok-2 beta](https://x.ai/news/grok-2)'],
  ['[Grok-2](https://x.ai/)', '[Grok-2](https://x.ai/news/grok-2)'],
  ['[Grok-2 mini](https://x.ai/)', '[Grok-2 mini](https://techcrunch.com/2024/08/13/xais-grok-can-now-generate-images-on-x/)'],
  ['[Grok 3](https://x.ai/)', '[Grok 3](https://x.ai/news/grok-3)'],
  
  // GLM
  ['[GLM-4](https://z.ai/)', '[GLM-4](https://github.com/THUDM/GLM-4)'],
  ['[GLM-4-Plus](https://z.ai/)', '[GLM-4-Plus](https://www.aibase.com/news/11400)'],
  ['[GLM-Zero-Preview](https://z.ai/)', '[GLM-Zero-Preview](https://www.ctol.digital/news/zhipu-ai-glm-zero-preview-vs-openai-o1-ai-race/)'],
  ['[GLM-4.5](https://z.ai/)', '[GLM-4.5](https://docs.z.ai/guides/llm/glm-4.5)'],
  
  // MiniMax
  ['[ABAB 6.5](https://www.minimaxi.com/)', '[ABAB 6.5](https://www.minimax.io/news/abab65-series)'],
  ['[Speech-02](https://www.minimaxi.com/)', '[Speech-02](https://www.minimax.io/news/minimax-speech-02)'],
  ['[MiniMax-Text-01](https://www.minimaxi.com/)', '[MiniMax-Text-01](https://github.com/MiniMax-AI/MiniMax-01)'],
  ['[MiniMax-VL-01](https://www.minimaxi.com/)', '[MiniMax-VL-01](https://github.com/MiniMax-AI/MiniMax-01)'],
  ['[MiniMax-M1](https://www.minimaxi.com/)', '[MiniMax-M1](https://github.com/MiniMax-AI/MiniMax-01)'],
  
  // DeepSeek
  ['[DeepSeek-V2](https://github.com/deepseek-ai/DeepSeek-LLM)', '[DeepSeek-V2](https://github.com/deepseek-ai/DeepSeek-V2/releases)'],
  ['[DeepSeek-V3](https://github.com/deepseek-ai/DeepSeek-LLM)', '[DeepSeek-V3](https://github.com/deepseek-ai/DeepSeek-V3)'],
  ['[DeepSeek-V3-0324](https://github.com/deepseek-ai/DeepSeek-LLM)', '[DeepSeek-V3-0324](https://github.blog/changelog/2025-04-08-deepseek-v3-0324-is-now-generally-available-in-github-models/)'],
  ['[DeepSeek-V2.5-1210](https://github.com/deepseek-ai/DeepSeek-LLM)', '[DeepSeek-V2.5-1210](https://huggingface.co/deepseek-ai/DeepSeek-V2.5-1210)'],
  ['[DeepSeek-V3.1](https://github.com/deepseek-ai/DeepSeek-LLM)', '[DeepSeek-V3.1](https://huggingface.co/deepseek-ai/DeepSeek-V3.1)'],
  ['[DeepSeek-V3.1-Terminus](https://github.com/deepseek-ai/DeepSeek-LLM)', '[DeepSeek-V3.1-Terminus](https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Terminus)'],
  
  // StepFun
  ['[Step-1V](https://www.stepfun.com/)', '[Step-1V](https://hub.baai.ac.cn/view/38402)'],
  ['[Step-2](https://www.stepfun.com/)', '[Step-2](https://hub.baai.ac.cn/view/38402)'],
  ['[Step-Video-T2V + Step-Audio](https://www.stepfun.com/)', '[Step-Video-T2V + Step-Audio](https://hub.baai.ac.cn/view/38402)'],
  ['[Step-R1-V-Mini](https://www.stepfun.com/)', '[Step-R1-V-Mini](https://hub.baai.ac.cn/view/38402)'],
  ['[Step 3](https://www.stepfun.com/)', '[Step 3](https://hub.baai.ac.cn/view/38402)'],
  ['[Step 3.5 Flash](https://www.stepfun.com/)', '[Step 3.5 Flash](https://hub.baai.ac.cn/view/38402)'],
  
  // Doubao
  ['[Doubao](https://www.doubao.com/)', '[Doubao](https://baike.baidu.com/en/item/Doubao%20Large%20Model/1469492)'],
  ['[Doubao 1.5](https://www.doubao.com/)', '[Doubao 1.5](https://baike.baidu.com/en/item/Doubao%20Large%20Model/1469492)'],
  ['[Doubao 1.5 Thinking](https://www.doubao.com/)', '[Doubao 1.5 Thinking](https://baike.baidu.com/en/item/Doubao%20Large%20Model/1469492)'],
  ['[Doubao 1.6](https://www.doubao.com/)', '[Doubao 1.6](https://baike.baidu.com/en/item/Doubao%20Large%20Model/1469492)'],
  
  // Kimi
  ['[moonshot-v1](https://kimi.moonshot.cn/)', '[moonshot-v1](https://platform.moonshot.cn/blog/posts/kimi-latest)'],
  ['[moonshot-v1-auto](https://kimi.moonshot.cn/)', '[moonshot-v1-auto](https://platform.moonshot.cn/blog/posts/kimi-latest)'],
  ['[kimi-latest](https://kimi.moonshot.cn/)', '[kimi-latest](https://platform.moonshot.cn/blog/posts/kimi-latest)'],
  ['[kimi-thinking-preview](https://kimi.moonshot.cn/)', '[kimi-thinking-preview](https://platform.moonshot.cn/blog/posts/kimi-latest)'],
  ['[Kimi K2](https://kimi.moonshot.cn/)', '[Kimi K2](https://kimi-k2.org/)'],
  
  // Xiaomi
  ['[Zhixiaobao](https://www.xiaomi.com/)', '[Zhixiaobao](https://baike.baidu.com/item/智小宝)'],
  
  // Video-01
  ['[Video-01](https://hailuoai.video/)', '[Video-01](https://www.minimax.io/news/video-01)'],
];

let count = 0;
for (const [oldStr, newStr] of modelReplacements) {
  if (md.includes(oldStr)) {
    md = md.split(oldStr).join(newStr);
    count++;
  }
}

fs.writeFileSync('llm_release_timeline_2022-11_to_2026-04.md', md, 'utf8');
console.log(`Updated ${count} links in MD file`);
