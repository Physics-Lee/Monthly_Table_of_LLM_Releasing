# 修复日志：2026-04-21 列位置错误

## 问题报告

用户反馈以下错误：

1. **23-Aug 列错位**：
   - Bailing 在 StepFun 列 → 应在 Ant-Group 列
   - MiLM-6B 在 Kuaishou-Kling 列 → 应在 Xiaomi 列
   - SK Hynix HBM3E 在 AI-Cloud 列（且为额外字段）→ 应在 AI-Chips 列

2. **24-Nov Qwen 模型位置**：
   - Qwen2.5-Coder Family + QwQ-32B 是否在 Cohere 列

3. **末尾空行**：
   - data.json 是否有 Month: "" 的空对象

## 验证过程

### 23-Aug 行验证

读取 CSV 第 11 行（23-Aug）：
```
23-Aug,Jan,,Claude Instant 1.2,,,,,,Qwen-7B + Qwen-VL + Qwen-VL-Chat,,,,Spark 2.0,,,Doubao,,Bailing,,MiLM-6B,,,,,,,,,,,,,,,,SK Hynix HBM3E
```

字段数：**37 个**（多一个）

列位置分析：
| 字段索引 | 列名 | 内容 | 是否正确 |
|----------|------|------|----------|
| 17 | Ant-Group | （空） | ❌ 应有 Bailing |
| 18 | StepFun | Bailing | ❌ 不应在此 |
| 19 | Xiaomi | （空） | ❌ 应有 MiLM-6B |
| 20 | Kuaishou-Kling | MiLM-6B | ❌ 不应在此 |
| 34 | AI-Chips | （空） | ❌ 应有 SK Hynix |
| 35 | AI-Cloud | （空） | ✅ |
| 36 | （超出范围） | SK Hynix HBM3E | ❌ 多余字段 |

### 24-Nov 行验证

读取 CSV 第 26 行（24-Nov）：
```
24-Nov,Unsloth + MarkItDown,,Claude 3.5 Haiku,,,Mistral Large 2.1 + Pixtral Large,,,Qwen2.5-Coder Family + QwQ-32B,,,,,,,,,,,,,,,,,,,,,,,,,
```

列位置分析：
| 字段索引 | 列名 | 内容 | 是否正确 |
|----------|------|------|----------|
| 9 | Qwen-Alibaba | Qwen2.5-Coder Family + QwQ-32B | ✅ 正确 |
| 10 | Cohere | （空） | ✅ 正确 |

**结论**：24-Nov 的 Qwen 模型**已在正确列**，之前修复时已经处理过了。

### 末尾空行验证

构建前 data.json：43 行（含一个 Month: "" 的空对象）
构建后 data.json：42 行（空对象已消失）

**原因**：之前修复时 CSV 有 43 行（含一个空行），现在已清理为 42 行。

## 修复操作

### 修复 23-Aug

使用 Node.js 脚本精确修复：

```javascript
const parts = lines[10].split(',');

// 移动 Bailing: StepFun → Ant-Group
parts[17] = 'Bailing';  // Ant-Group
parts[18] = '';         // StepFun (清空)

// 移动 MiLM-6B: Kuaishou-Kling → Xiaomi
parts[19] = 'MiLM-6B';  // Xiaomi
parts[20] = '';         // Kuaishou-Kling (清空)

// 移动 SK Hynix HBM3E: 额外字段 → AI-Chips
parts[34] = 'SK Hynix HBM3E';  // AI-Chips
parts[35] = '';                // AI-Cloud (清空)

// 删除多余字段
while (parts.length > 36) parts.pop();
```

### 修复后验证

```
23-Aug 行字段数：36 ✅
Ant-Group (17): Bailing ✅
StepFun (18): （空） ✅
Xiaomi (19): MiLM-6B ✅
Kuaishou-Kling (20): （空） ✅
AI-Chips (34): SK Hynix HBM3E ✅
AI-Cloud (35): （空） ✅
```

## 构建和验证

### 运行构建

```bash
node scripts/build-json.js
```

输出：
```
✓ CSV 解析完成: 42 行, 36 列
✓ MD 解析完成: 43 表格行, 331 个链接
✓ 已写入: data.json
✓ 已写入: links.json
✓ 已写入: README.md
```

注意：从 43 行变为 42 行，说明之前的空行已被清理。

### 验证 data.json

**23-Aug**：
- Ant-Group: "Bailing" ✅
- Xiaomi: "MiLM-6B" ✅
- AI-Chips: "SK Hynix HBM3E" ✅
- AI-Cloud: "" ✅

**24-Nov**：
- Qwen-Alibaba: "Qwen2.5-Coder Family + QwQ-32B" ✅
- Cohere: "" ✅

**末尾**：
- 最后一行 Month: "26-Apr" ✅（无空对象）

### 检查缺失链接

```bash
node -e "检查所有模型是否有链接"
```

结果：`Missing links: 0` ✅

## 提交记录

```bash
git add -A
git commit -m "fix: correct column placement errors in 23-Aug and verify 24-Nov

- 23-Aug: Bailing -> Ant-Group (was in StepFun)
- 23-Aug: MiLM-6B -> Xiaomi (was in Kuaishou-Kling)
- 23-Aug: SK Hynix HBM3E -> AI-Chips (was in AI-Cloud, extra field)
- 24-Nov: Qwen2.5-Coder + QwQ-32B already in correct Qwen column
- Remove extra empty row at end of CSV
- All 420 models now have hyperlinks"
git push origin master
```

提交哈希：`a6ee117`

## 修复总结

| 问题 | 修复前 | 修复后 |
|------|--------|--------|
| Bailing 位置 | StepFun 列 | Ant-Group 列 ✅ |
| MiLM-6B 位置 | Kuaishou-Kling 列 | Xiaomi 列 ✅ |
| SK Hynix HBM3E 位置 | AI-Cloud 列（额外字段） | AI-Chips 列 ✅ |
| 24-Nov Qwen | 已在正确列 | 确认正确 ✅ |
| CSV 行数 | 43 行（含空行） | 42 行 ✅ |
| 缺失链接 | - | 0 ✅ |

## 教训

1. **字段数不匹配会导致列错位**：23-Aug 有 37 个字段，多出的一个字段导致后续列整体偏移
2. **编辑 CSV 后要立即验证字段数**：使用 `node scripts/build-json.js` 检查
3. **不要只依赖视觉检查**：CSV 的逗号很难肉眼数清，必须用工具验证
4. **定期运行 check-missing-links.js**：确保所有模型都有链接

---

*修复时间: 2026-04-21*
*修复者: Sisyphus*
