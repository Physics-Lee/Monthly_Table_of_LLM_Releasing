# LLM 发布表格更新流程

> 本文档记录维护 `Monthly_Table_of_LLM_Releasing` 项目时的标准更新流程
> 撰写时间: 2026-04-21

---

## 项目结构

```
Monthly_Table_of_LLM_Releasing/
├── llm_release_timeline_2022-11_to_2026-04.csv    # 主数据源（唯一真相源）
├── llm_release_timeline_2022-11_to_2026-04.md      # Markdown 版本（带链接）
├── scripts/
│   └── build-json.js                               # 构建脚本
├── data.json                                       # 自动生成的数据文件
├── links.json                                      # 自动生成的链接映射
├── README.md                                       # 自动生成的 README
├── index.html                                      # GitHub Pages 网页
├── app.js                                          # 网页逻辑
└── note/                                           # 笔记目录
```

**核心原则**: CSV 是唯一真相源，所有修改必须先在 CSV 中进行。

---

## 标准更新流程

### 1. 修改 CSV 文件

**文件**: `llm_release_timeline_2022-11_to_2026-04.csv`

**注意事项**:
- 保持 36 列结构（Month + 35 个厂商列）
- 多个模型用 `+` 分隔，例如: `GPT-4 + GPT-4V`
- **避免在模型名中使用 `+` 号**，如 `Command R+` 应改为 `Command R Plus`
- 空单元格直接留空（两个逗号之间什么都不写）
- 确保每行字段数一致（36 个）

**常见错误**:
- 字段数不对（多一个或少一个逗号）
- 模型放错列（如把 Mistral 模型放进 xAI 列）
- 日期错误（如把预览版日期当成正式版）

### 2. 运行构建脚本

```bash
node scripts/build-json.js
```

**脚本功能**:
- 解析 CSV 和 MD 文件
- 生成 `data.json`（结构化数据）
- 生成 `links.json`（链接映射）
- 生成 `README.md`（带链接的表格）

**错误处理**:
- 如果提示 "字段数不匹配"，检查 CSV 对应行的逗号数量
- 使用 `node -e "..."` 脚本检查并修复字段数

### 3. 验证链接

```bash
node -e "
const data = JSON.parse(require('fs').readFileSync('data.json'));
const links = JSON.parse(require('fs').readFileSync('links.json'));
const missing = [];
for (const row of data.rows) {
  for (const vendor of data.vendors) {
    const value = row[vendor];
    if (value) {
      const items = value.split('+').map(s => s.trim()).filter(s => s);
      for (const item of items) {
        if (!links[item]) missing.push({month: row.Month, vendor, item});
      }
    }
  }
}
console.log('Missing links:', missing.length);
missing.forEach(m => console.log('  ' + m.month + ' | ' + m.vendor + ' | ' + m.item));
"
```

**目标**: Missing links = 0

### 4. 添加新模型的链接（如需）

如果验证发现缺失链接，在 `scripts/build-json.js` 的 `inferURL()` 函数中添加模式匹配：

```javascript
[/^Model-Name/, 'https://official-url.com'],
```

**规则**:
- 具体模式放在前面，通用模式放在后面
- 按字母/厂商顺序排列，便于维护
- 链接必须指向具体页面，不要用厂商首页

### 5. Git 提交和推送

```bash
git add -A
git commit -m "feat: add XXX to YYYY column (ZZZZ-date)

- 模型名: 说明
- 官方链接: https://..."
git push origin master
```

**提交规范**:
- `feat`: 添加新模型/功能
- `fix`: 修复错误（日期、列位置、链接等）
- `docs`: 文档更新

### 6. 验证网页更新

- GitHub Actions 会自动部署到 GitHub Pages
- 访问 `https://physics-lee.github.io/Monthly_Table_of_LLM_Releasing/` 查看
- 检查新模型是否正确显示，链接是否可点击

---

## 常见错误类型

### 类型 1: 列位置错误

**症状**: 模型出现在错误的厂商列

**例子**:
- Mistral Large 2.1 出现在 xAI 列 → 应移到 Mistral 列
- Qwen2.5-Coder 出现在 Cohere 列 → 应移到 Qwen 列
- Grok 4.2 出现在 DeepSeek 列 → 应移到 xAI 列

**修复**: 直接在 CSV 中剪切粘贴到正确列

### 类型 2: 日期错误

**症状**: 模型发布日期不对

**例子**:
- Azure OpenAI Service 标为 2022-11 → 实际 GA 是 2023-01
- AWS Bedrock GA 标为 2023-04 → 实际 GA 是 2023-09
- Jurassic-2 标为 2024-02 → 实际发布是 2023-03

**修复**: 
1. 从错误日期行删除
2. 添加到正确日期行（如果不存在）
3. 如果该模型已存在正确位置，直接删除错误条目

### 类型 3: 链接错误

**症状**: 链接指向错误页面

**例子**:
- GPT-4o 链接到 gpt-4o-mini 页面
- Mistral Small 3 链接到旧版 2402 页面

**修复**: 修改 `build-json.js` 中的 `inferURL()` 模式

### 类型 4: 字段数不匹配

**症状**: 运行 build-json.js 报错 "字段数不匹配"

**原因**: 
- 多一个或少一个逗号
- 编辑时意外添加/删除了列

**修复**:
```bash
node -e "
const fs = require('fs');
const lines = fs.readFileSync('llm_release_timeline_2022-11_to_2026-04.csv', 'utf8').split('\n');
const header = lines[0].split(',');
for (let i = 0; i < lines.length; i++) {
  const parts = lines[i].split(',');
  if (parts.length !== header.length) {
    console.log('Row', i+1, 'fields:', parts.length, '-', parts[0]);
    // 修复: 截断或补齐
    if (parts.length > header.length) {
      lines[i] = parts.slice(0, header.length).join(',');
    } else {
      while (parts.length < header.length) parts.push('');
      lines[i] = parts.join(',');
    }
  }
}
fs.writeFileSync('llm_release_timeline_2022-11_to_2026-04.csv', lines.join('\n'));
"
```

---

## 批量修复流程

当收到多个错误报告时：

1. **列出所有问题**（用 todo 工具跟踪）
2. **逐一修复 CSV**（不要批量替换，容易出错）
3. **运行 build-json.js**
4. **验证链接**
5. **Git 提交**（单个大提交或分多个小提交）
6. **推送并验证网页**

---

## 验证清单

每次修改后检查：

- [ ] CSV 字段数一致（36 列）
- [ ] 模型在正确的厂商列
- [ ] 日期准确（区分 preview/GA/正式版）
- [ ] 所有模型都有超链接
- [ ] 链接指向正确的官方页面
- [ ] build-json.js 运行无错误
- [ ] Git 提交并推送成功
- [ ] 网页显示正常

---

## 工具脚本

### 检查字段数
```bash
node -e "
const fs = require('fs');
const lines = fs.readFileSync('llm_release_timeline_2022-11_to_2026-04.csv', 'utf8').split('\n');
const header = lines[0].split(',');
console.log('Header fields:', header.length);
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',');
  if (parts.length !== header.length) {
    console.log('Row', i+1, '(' + parts[0] + '):', parts.length, 'fields');
  }
}
"
```

### 检查缺失链接
```bash
node -e "
const data = JSON.parse(require('fs').readFileSync('data.json'));
const links = JSON.parse(require('fs').readFileSync('links.json'));
let missing = 0;
for (const row of data.rows) {
  for (const vendor of data.vendors) {
    const value = row[vendor];
    if (value) {
      const items = value.split('+').map(s => s.trim()).filter(s => s);
      for (const item of items) {
        if (!links[item]) {
          console.log('Missing:', row.Month, '|', vendor, '|', item);
          missing++;
        }
      }
    }
  }
}
console.log('Total missing:', missing);
"
```

---

## 历史教训

1. **不要只改 MD 不改 CSV** — MD 是生成的，CSV 才是真相源
2. **编辑后必须运行 build-json.js** — 否则 data.json 和 links.json 不会更新
3. **注意 `+` 分隔符** — 模型名中不能有 `+`，否则会被拆分成多个模型
4. **区分 preview 和 GA** — 预览版和正式版日期可能不同
5. **验证后再推送** — 本地运行 build 和链接检查，确认无误再 git push

---

*本文档应随项目更新而更新。*
