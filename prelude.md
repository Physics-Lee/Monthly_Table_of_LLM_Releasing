# LLM Release Timeline

> 仿《史记》体例：三代不可纪年，作世表；春秋战国纪年，作年表；秦楚之际事繁变众，特作月表。
> 本表同理——Transformer 之前（1948–2016）以**世代**记；ChatGPT 之前（2017–2022）以**年**记；此后（2022-11 起）以**月**记。

## 世表 · Pre-Transformer Era（1948–2016）

> 记世代、不记年份。表中仅列语言建模主线；语音、视觉等背景条目以〔旁支〕标注，不入主线。

| 世代 | 时期 | 主线事件 |
|---|---|---|
| 统计世代 | 1948–2003 | [香农以 n-gram 估计英语熵](https://en.wikipedia.org/wiki/A_Mathematical_Theory_of_Communication)（1948）；n-gram 成语言模型标准件，语音识别与统计机器翻译为两大应用（[IBM Model 1–5](https://en.wikipedia.org/wiki/IBM_alignment_models)，1980–90s） |
| 神经萌芽 | 2003–2010 | [NNLM 神经概率语言模型](https://www.jmlr.org/papers/v3/bengio03a.html)（Bengio 等，2003）：词向量 + 神经网络语言建模的开端 |
| RNN/LSTM 世代 | 2010–2016 | [RNNLM](http://www.fit.vutbr.cz/~imikolov/rnnlm/)（Mikolov，2010）开始替代 n-gram；[word2vec](https://arxiv.org/abs/1301.3781)（Google，2013）；[seq2seq](https://arxiv.org/abs/1409.3215)（Google，2014）；[GNMT 神经机器翻译](https://arxiv.org/abs/1609.08144)（Google，2016）；[fastText](https://fasttext.cc/)（Meta，2016） |

〔旁支〕视觉与算力奠基同期：[AlexNet](https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html)（2012）引爆深度学习；[ResNet](https://arxiv.org/abs/1512.03385)（2015）残差连接为 Transformer 所承；GPU/CUDA 大规模训练普及。〔旁支〕语音识别同期先行神经化：[CTC](https://www.cs.toronto.edu/~graves/icml_2006.pdf)（Graves，2006）、[深度 LSTM 声学模型](https://arxiv.org/abs/1303.5778)（Graves，2013）、[Deep Speech](https://arxiv.org/abs/1412.5567)（百度，2014）——声学端已换深度网络，语言端解码仍用 5-gram，两代技术同堂。

## 年表 · Pre-ChatGPT Era（2017–2022）

| Year | OpenAI | Meta | GLM-Z.ai | Google | NVIDIA | Baidu | Microsoft | Huawei | Stability | Open-Source | LLM-Applications |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2017 |  |  |  | [Transformer（65M / 213M）](https://arxiv.org/abs/1706.03762) |  |  |  |  |  |  |  |
| 2018 | [GPT-1](https://openai.com/index/language-unsupervised/) |  |  | [BERT（110M / 340M）](https://arxiv.org/abs/1810.04805) |  |  |  |  |  |  |  |
| 2019 | [GPT-2（124M / 355M / 774M / 1.5B）](https://openai.com/index/better-language-models/) | [RoBERTa（125M / 355M）](https://arxiv.org/abs/1907.11692) |  | [T5（60M / 220M / 770M / 3B / 11B）](https://arxiv.org/abs/1910.10683) |  | [ERNIE 2.0（base / large）](https://arxiv.org/abs/1907.12412) |  |  |  |  |  |
| 2020 | [GPT-3（125M / 350M / 760M / 1.3B / 2.7B / 6.7B / 13B / 175B）](https://openai.com/index/openai-api/) |  |  |  |  |  | [Turing-NLG](https://www.microsoft.com/en-us/research/blog/turing-nlg-a-17-billion-parameter-language-model-by-microsoft/) |  |  |  |  |
| 2021 | [Codex（cushman / davinci）](https://openai.com/index/openai-codex/) |  |  | [LaMDA（2B / 137B）](https://blog.google/technology/ai/lamda/) + [Gopher（44M / 117M / 417M / 1.4B / 7.1B / 280B）](https://arxiv.org/abs/2112.11446) | [MT-NLG 530B](https://developer.nvidia.com/blog/language-models-using-megatron-and-deep-speed/) | [ERNIE 3.0](https://arxiv.org/abs/2107.02137) | [Copilot Preview](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/) | [盘古 α（2.6B / 13B / 200B）](https://arxiv.org/abs/2104.12369) |  | [GPT-J](https://arxiv.org/abs/2106.09685) |  |
| 2022 | [InstructGPT（1.3B / 6B / 175B）](https://openai.com/index/instruction-following/) + [DALL·E 2](https://openai.com/index/dall-e-2/) + [Whisper（tiny / base / small / medium / large）](https://openai.com/index/whisper/) | [OPT（125M / 350M / 1.3B / 2.7B / 6.7B / 13B / 30B / 66B / 175B）](https://arxiv.org/abs/2205.01068) | [GLM-130B](https://arxiv.org/abs/2210.02414) | [Chinchilla](https://arxiv.org/abs/2203.15556) + [Flamingo（3B / 9B / 80B，DeepMind 视觉-语言）](https://arxiv.org/abs/2204.14198) + [PaLM（8B / 62B / 540B）](https://arxiv.org/abs/2204.02311) |  |  |  |  | [Stable Diffusion](https://stability.ai/news/stable-diffusion-announcement) | [BLOOM（560M / 1.1B / 1.7B / 3B / 7.1B / 176B）](https://bigscience.huggingface.co/blog/bloom) | [Midjourney](https://www.midjourney.com/) |

注：年表仅收录月表中已有对应列、且在 ChatGPT 前存在公开发布的厂商；公司成立事件（如 Anthropic 2021 年成立）不计入。多尺寸系列在名称后括注各档（GPT-3 的 davinci 引擎即 175B 档；Codex 参数未官宣，仅分 cushman / davinci 两档）。

## 月表 · ChatGPT Era（2022-11 起）
