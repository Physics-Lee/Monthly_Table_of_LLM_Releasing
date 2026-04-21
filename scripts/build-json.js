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
      console.error(`❌ 第 ${i + 1} 行字段数不匹配: 期望 ${headers.length} 列, 实际 ${values.length} 列`);
      console.error(`   内容: ${lines[i].substring(0, 120)}${lines[i].length > 120 ? '...' : ''}`);
      throw new Error(`CSV 格式错误: 第 ${i + 1} 行字段数不匹配，请检查逗号数量或引号配对`);
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
// 2. 解析 MD → links{}
// ---------------------------------------------------------------------------
function parseMD(mdPath) {
  const raw = fs.readFileSync(mdPath, 'utf8').trim();

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

  console.log(`✓ MD 解析完成: ${Object.keys(links).length} 个链接`);
  return { links };
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
// 4. 生成 links.json（仅使用 MD 中提取的链接）
// ---------------------------------------------------------------------------
function buildLinksJSON(mdLinks) {
  return { ...mdLinks };
}

// ---------------------------------------------------------------------------
// 5. 生成 README.md
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
  const linksJSON = buildLinksJSON(mdLinks);

  // 5. 生成 README.md
  const ONLINE_URL = process.env.ONLINE_URL || 'https://physics-lee.github.io/Monthly_Table_of_LLM_Releasing/';
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
