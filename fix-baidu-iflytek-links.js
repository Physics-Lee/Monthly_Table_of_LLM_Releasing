const fs = require('fs');
let md = fs.readFileSync('llm_release_timeline_2022-11_to_2026-04.md', 'utf8');

const replacements = [
  // Baidu
  { old: '[ERNIE Bot](https://www.baidu.com/)', new: '[ERNIE Bot](https://yiyan.baidu.com/)' },
  { old: '[ERNIE 3.5](https://github.com/PaddlePaddle/PaddleNLP)', new: '[ERNIE 3.5](https://research.baidu.com/Blog/index-view?id=185)' },
  { old: '[ERNIE 4.0](https://www.baidu.com/)', new: '[ERNIE 4.0](https://yiyan.baidu.com/)' },
  { old: '[ERNIE 4.0 Turbo](https://www.baidu.com/)', new: '[ERNIE 4.0 Turbo](https://yiyan.baidu.com/)' },
  { old: '[ERNIE 4.5](https://www.baidu.com/)', new: '[ERNIE 4.5](https://yiyan.baidu.com/)' },
  { old: '[ERNIE 4.5 Turbo](https://www.baidu.com/)', new: '[ERNIE 4.5 Turbo](https://yiyan.baidu.com/)' },
  { old: '[ERNIE 4.5 Open](https://www.baidu.com/)', new: '[ERNIE 4.5 Open](https://yiyan.baidu.com/)' },
  { old: '[ERNIE X1.1](https://www.baidu.com/)', new: '[ERNIE X1.1](https://yiyan.baidu.com/)' },
  // iFlytek  
  { old: '[Spark 1.0](https://www.iflytek.com/)', new: '[Spark 1.0](https://xinghuo.xfyun.cn/)' },
  { old: '[Spark 1.5](https://www.iflytek.com/)', new: '[Spark 1.5](https://xinghuo.xfyun.cn/)' },
  { old: '[Spark 2.0](https://www.iflytek.com/)', new: '[Spark 2.0](https://xinghuo.xfyun.cn/)' },
  { old: '[Spark 3.0](https://www.iflytek.com/)', new: '[Spark 3.0](https://xinghuo.xfyun.cn/)' },
  { old: '[Spark 3.5](https://www.iflytek.com/)', new: '[Spark 3.5](https://xinghuo.xfyun.cn/)' },
  { old: '[Spark 4.0](https://www.iflytek.com/)', new: '[Spark 4.0](https://xinghuo.xfyun.cn/)' },
  { old: '[Spark X1](https://www.iflytek.com/)', new: '[Spark X1](https://xinghuo.xfyun.cn/)' },
];

let total = 0;
replacements.forEach(r => {
  const count = (md.match(new RegExp(r.old.replace(/[.*+?^${}()|[\]\]/g, '\\$&'), 'g')) || []).length;
  if (count > 0) {
    md = md.split(r.old).join(r.new);
    total += count;
    console.log('✓', r.old, '->', r.new, '(' + count + 'x)');
  }
});

fs.writeFileSync('llm_release_timeline_2022-11_to_2026-04.md', md, 'utf8');
console.log('\n总计替换:', total, '处');
