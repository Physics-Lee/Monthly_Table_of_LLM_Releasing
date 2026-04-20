
const fs = require('fs');
const md = fs.readFileSync('llm_release_timeline_2022-11_to_2026-04.md', 'utf8');
const lines = md.split('
');
const baiduModels = ['ERNIE Bot','ERNIE 3.5','ERNIE 4.0','ERNIE 4.0 Turbo','ERNIE 4.5','X1','ERNIE 4.5 Turbo','X1 Turbo','ERNIE 4.5 Open','ERNIE X1.1','ERNIE 5.0'];
const iflytekModels = ['Spark 1.0','Spark 1.5','Spark 2.0','Spark 3.0','Spark 3.5','Spark 4.0','Spark X1'];
console.log('=== MD links ===');
lines.forEach(line => {
  if (!line.startsWith('|')) return;
  [...baiduModels, ...iflytekModels].forEach(m => {
    if (line.includes(m)) {
      const i = line.indexOf('['+m+']');
      if (i >= 0) {
        const j = line.indexOf('(', i);
        const k = line.indexOf(')', j);
        if (j > 0 && k > j) console.log(m + ': ' + line.substring(j+1, k));
      }
    }
  });
});
