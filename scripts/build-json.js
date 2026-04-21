/**
 * Build derived repository files from the source CSV and source Markdown table.
 *
 * Data flow:
 *   CSV -> data.json
 *   MD  -> links.json
 *   data.json + links.json -> README.md
 */

const fs = require('node:fs');
const path = require('node:path');
const { joinModels, normalizeModelEntries, normalizeModels } = require('./model-utils');

const [, , csvArg, mdArg, outArg] = process.argv;
const CSV_PATH = csvArg || 'llm_release_timeline_2022-11_to_2026-04.csv';
const MD_PATH = mdArg || 'llm_release_timeline_2022-11_to_2026-04.md';
const OUT_DIR = outArg || '.';

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += ch;
  }

  result.push(current);
  return result;
}

function parseCSV(csvPath) {
  const raw = fs.readFileSync(csvPath, 'utf8').trim();
  const lines = raw.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    throw new Error(`CSV needs at least a header and one data row: ${csvPath}`);
  }

  const headers = splitCSVLine(lines[0]).map(header => header.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);

    if (values.length !== headers.length) {
      console.error(`❌ 第 ${i + 1} 行字段数不匹配: 期望 ${headers.length} 列, 实际 ${values.length} 列`);
      console.error(`   内容: ${lines[i].substring(0, 160)}${lines[i].length > 160 ? '...' : ''}`);
      throw new Error(`CSV 格式错误: 第 ${i + 1} 行字段数不匹配，请检查逗号数量或引号配对`);
    }

    const row = {};
    headers.forEach((header, index) => {
      row[header] = (values[index] || '').trim();
    });
    rows.push(row);
  }

  console.log(`✓ CSV 解析完成: ${rows.length} 行, ${headers.length} 列`);
  return { headers, rows };
}

function parseMD(mdPath) {
  const raw = fs.readFileSync(mdPath, 'utf8').trim();
  const lines = raw.split('\n');
  const links = {};

  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRe.exec(raw)) !== null) {
    const modelName = match[1].trim();
    const url = match[2].trim();

    if (modelName && url && !links[modelName]) {
      links[modelName] = url;
    }
  }

  const tableRows = lines.filter(line => line.startsWith('|') && !line.startsWith('|---') && line.includes('|'));
  console.log(`✓ MD 解析完成: ${tableRows.length} 表格行, ${Object.keys(links).length} 个链接`);

  return { links, tableRows };
}

function buildDataJSON(headers, rows, links = {}) {
  const vendors = headers.filter(header => header !== 'Month');

  return {
    vendors,
    rows: rows.map(row => {
      const nextRow = { Month: row.Month };
      vendors.forEach(vendor => {
        nextRow[vendor] = normalizeModelEntries(row[vendor], links);
      });
      return nextRow;
    })
  };
}

function buildLinksJSON(mdLinks) {
  return { ...mdLinks };
}

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

  function formatCell(value) {
    const linkedModels = normalizeModelEntries(value, links).map(entry => {
      const url = entry.url || findUrl(entry.name);
      return url ? `[${entry.name}](${url})` : entry.name;
    });

    return joinModels(linkedModels);
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
    const cells = headers.map(header => {
      if (header === 'Month') return row.Month || '';
      return formatCell(row[header]);
    });
    md += `| ${cells.join(' | ')} |\n`;
  });

  md += `
## 说明

- 空白单元格表示该厂商当月暂无已验证的公开发布
- 部分中国厂商数据来自官方里程碑页面或公开报道
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

function main() {
  console.log('\n📦 LLM Timeline 数据构建\n');
  console.log(`  CSV:  ${CSV_PATH}`);
  console.log(`  MD:   ${MD_PATH}`);
  console.log(`  OUT:  ${OUT_DIR}\n`);

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`❌ CSV 文件不存在: ${CSV_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(MD_PATH)) {
    console.error(`❌ MD 文件不存在: ${MD_PATH}`);
    process.exit(1);
  }

  const { headers, rows } = parseCSV(CSV_PATH);
  const { links: mdLinks } = parseMD(MD_PATH);
  const dataJSON = buildDataJSON(headers, rows, mdLinks);
  const linksJSON = buildLinksJSON(mdLinks);
  const readme = generateReadme(
    dataJSON.vendors,
    dataJSON.rows,
    linksJSON,
    process.env.ONLINE_URL || 'https://physics-lee.github.io/Monthly_Table_of_LLM_Releasing/',
    process.env.GITHUB_URL || 'https://github.com/Physics-Lee/Monthly_Table_of_LLM_Releasing'
  );

  const write = (filePath, content) => {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ 已写入: ${filePath}`);
  };

  write(path.join(OUT_DIR, 'data.json'), JSON.stringify(dataJSON, null, 2) + '\n');
  write(path.join(OUT_DIR, 'links.json'), JSON.stringify(linksJSON, null, 2) + '\n');
  write(path.join(OUT_DIR, 'README.md'), readme);

  console.log('\n✅ 完成！');
  console.log(`   data.json:  ${dataJSON.rows.length} 行 × ${dataJSON.vendors.length} 列`);
  console.log(`   links.json: ${Object.keys(linksJSON).length} 条映射`);
  console.log('   README.md:  已生成\n');
}

if (require.main === module) {
  main();
}

module.exports = {
  buildDataJSON,
  buildLinksJSON,
  generateReadme,
  main,
  parseCSV,
  parseMD,
  splitCSVLine
};
