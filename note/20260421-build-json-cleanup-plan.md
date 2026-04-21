# build-json.js 清理计划

> 记录时间：2026-04-21  
> 触发原因：当前流程要求每个 LLM 都有 MD 链接，`inferURL()` 硬编码推断几乎不再使用

---

## 现状分析

当前 `build-json.js` 约 555 行，核心逻辑：

```
CSV → parseCSV() → data.json
MD  → parseMD()  → 提取 [模型名](URL) → links.json
                    ↓
              如果 MD 中无链接 → inferURL() 硬编码推断
                    ↓
              CSV数据 + links → README.md
```

**问题**：流程已要求每个模型必须在 MD 中指定 `[模型名](URL)`，`inferURL()` 的硬编码推断几乎不会触发，成为死代码。

---

## 清理目标

1. **删除** `inferURL()` 函数（~280 行硬编码规则）
2. **简化** `buildLinksJSON()`：只合并 MD 链接，不做推断
3. **删除** `parseMD()` 中未使用的 `tableRows`
4. **保留** 严格 CSV 验证（第39-42行的 `throw Error`）
5. **预期结果**：从 ~555 行 → ~270 行，逻辑更清晰

---

## 具体改动清单

### 改动 1：删除 `inferURL()` 函数

**位置**：第149-426行

**删除内容**：
- 整个 `inferURL(modelName)` 函数
- 约 270 行硬编码正则匹配规则

**影响**：
- 如果 MD 中缺少某个模型的链接，该模型在 README 中将显示为纯文本（无链接）
- 但 `check-missing-links.js` 会在构建后捕获这种情况
- 符合"每个 LLM 必须有链接"的流程要求

### 改动 2：简化 `buildLinksJSON()`

**位置**：第126-147行

**当前代码**：
```javascript
function buildLinksJSON(mdLinks, rows) {
  const links = { ...mdLinks };

  // 从 rows 里的模型名自动补充 links（如果 MD 里没有 URL）
  rows.forEach(row => {
    Object.entries(row).forEach(([vendor, cell]) => {
      if (!cell || vendor === 'Month') return;
      const names = cell.split('+').map(s => s.trim()).filter(Boolean);
      names.forEach(name => {
        if (!links[name]) {
          const inferred = inferURL(name);  // ← 删除
          if (inferred) links[name] = inferred;  // ← 删除
        }
      });
    });
  });

  return links;
}
```

**改为**：
```javascript
function buildLinksJSON(mdLinks) {
  // 只使用 MD 中提取的链接，不做任何推断
  return { ...mdLinks };
}
```

**调用处同步修改**（第529行）：
```javascript
// 当前
const linksJSON = buildLinksJSON(mdLinks, rows);

// 改为
const linksJSON = buildLinksJSON(mdLinks);
```

### 改动 3：删除 `parseMD()` 中的 `tableRows`

**位置**：第101-105行

**当前代码**：
```javascript
// 提取表格行（| 开头）
const tableRows = lines.filter(l => l.startsWith('|') && !l.startsWith('|---') && l.includes('|'));

console.log(`✓ MD 解析完成: ${tableRows.length} 表格行, ${Object.keys(links).length} 个链接`);
return { links, tableRows };
```

**改为**：
```javascript
console.log(`✓ MD 解析完成: ${Object.keys(links).length} 个链接`);
return { links };
```

**调用处同步修改**（第523行）：
```javascript
// 当前
const { links: mdLinks } = parseMD(MD_PATH);

// 无需修改，解构语法兼容
```

### 改动 4：更新函数注释

**第124-125行**：
```javascript
// 当前
// 4. 生成 links.json（从 MD 链接 + 内嵌 hardcoded 补充）

// 改为
// 4. 生成 links.json（仅使用 MD 中提取的链接）
```

### 改动 5：验证构建输出

确保构建成功输出正常：
```
✓ CSV 解析完成: 43 行, 36 列
✓ MD 解析完成: 315 个链接
✓ 已写入: data.json
✓ 已写入: links.json
✓ 已写入: README.md
```

注意：`parseMD()` 的输出从"43 表格行, 315 个链接"变为"315 个链接"。

---

## 清理后的文件结构

```javascript
// 1. 解析 CSV → rows[]
function parseCSV(csvPath) { ... }
function splitCSVLine(line) { ... }

// 2. 解析 MD → links{}
function parseMD(mdPath) { ... }

// 3. 生成 data.json
function buildDataJSON(headers, rows) { ... }

// 4. 生成 links.json（简化）
function buildLinksJSON(mdLinks) { ... }

// 5. 生成 README.md
function generateReadme(vendors, rows, links, onlineUrl, githubUrl) { ... }

// 主流程
function main() { ... }
```

**预期行数**：~270 行（从 555 行减少约 50%）

---

## 风险与回滚

| 风险 | 缓解措施 |
|---|---|
| 删除 `inferURL()` 后，某些旧模型可能突然失去链接 | 运行 `check-missing-links.js` 检查，如有缺失在 MD 中补充 |
| 构建输出格式变化（少了"XX 表格行"） | 不影响功能，只是日志输出 |
| 其他脚本依赖 `inferURL()` | 检查确认：只有 `build-json.js` 内部调用，无外部依赖 |

**回滚方案**：
- 清理前创建分支：`git checkout -b cleanup-build-json`
- 如发现问题，随时 `git checkout main` 回滚

---

## 验证步骤

清理后必须执行：

```bash
# 1. 构建测试
node scripts/build-json.js

# 2. 检查缺失链接（应输出 0 missing）
node scripts/check-missing-links.js

# 3. 检查 README.md 是否正常生成
git diff README.md

# 4. 检查 data.json 和 links.json
ls -la data.json links.json
```

---

## 后续优化建议（可选）

1. **将 `check-missing-links.js` 整合进 `build-json.js`**：构建时自动检查，如有缺失直接报错
2. **添加链接覆盖率统计**：构建输出显示"XX / YY 模型有链接"
3. **删除 `scripts/fix-md-links.js` 和 `scripts/update-md-links.js`**：如果所有链接都在 MD 中手动维护，这两个脚本可能也不需要了

---

*本计划待确认后执行。*
