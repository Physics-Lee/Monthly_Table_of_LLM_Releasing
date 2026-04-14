const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data.json');
const linksPath = path.join(__dirname, '../links.json');

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const links = JSON.parse(fs.readFileSync(linksPath, 'utf8'));

const ONLINE_URL = 'https://api.dreamfree.space/c/s/llm-timeline'; // TODO: 替换为实际的 Coze 链接
const GITHUB_URL = 'https://github.com/Physics-Lee/Monthly_Table_of_LLM_Releasing';

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

function formatModel(model) {
  const url = findUrl(model);
  if (url) {
    return `[${model}](${url})`;
  }
  return model;
}

function formatCell(text) {
  if (!text) return '';
  return text.split(' + ').map(s => s.trim()).filter(Boolean).map(formatModel).join(' + ');
}

function generateTable() {
  const headers = ['Month', ...data.vendors];
  let md = '| ' + headers.join(' | ') + ' |\n';
  md += '|' + headers.map(() => '---').join('|') + '|\n';

  data.rows.forEach(row => {
    const cells = headers.map(h => formatCell(row[h]));
    md += '| ' + cells.join(' | ') + ' |\n';
  });

  return md;
}

function generateReadme() {
  const md = `# LLM Release Timeline

> 持续追踪全球大模型发布动态 | 2022-11 ~ 2026-04

## 在线访问

直接访问：[${ONLINE_URL}](${ONLINE_URL})

GitHub 仓库：[${GITHUB_URL}](${GITHUB_URL})

## 覆盖厂商

${data.vendors.join('、')}

## 发布时间线

${generateTable()}

## 说明

- 空白单元格表示该厂商当月无已验证的公开发布
- 部分中国厂商数据来自官方里程碑页面或开发者发布说明
- 数据仅供参考，以各厂商官方公告为准

## 更新日志

- 2026-04-14：上线交互式时间线网站

---

> 由社区维护，欢迎提交 Issue 和 Pull Request
`;

  return md;
}

function main() {
  const readme = generateReadme();
  const outputPath = path.join(__dirname, '../README.md');
  fs.writeFileSync(outputPath, readme, 'utf8');
  console.log('README.md generated successfully');
}

main();
