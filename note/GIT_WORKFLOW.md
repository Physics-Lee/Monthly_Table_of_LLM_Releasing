# Git Workflow Note

## 常用命令

```bash
# 1. 查看状态
git status

# 2. 查看变更内容
git diff

# 3. 添加所有修改到暂存区
git add -A

# 4. 提交（带描述信息）
git commit -m "type: short description

- detailed change 1
- detailed change 2"

# 5. 推送到远程仓库
git push
```

## 本次会话的提交记录

| 提交 | 说明 |
|---|---|
| `6ab71ef` | feat: 添加更新日志区域（显示最近3次提交） |
| `212161d` | update: 厂商中文名（DeepSeek→深度求索, 快手→快手可灵, 面壁→南北阁） |
| `d92a5d2` | feat: 添加厂商列表（支持中文显示） |
| `a5872c3` | remove: 移除厂商列表；add: 友情链接 |
| `b6a0ce0` | fix: 补全所有厂商名称（21个） |
| `94382c6` | fix: 更新模型超链接为具体发布页面 |

## Commit Message 规范

```
type: short description

- change detail 1
- change detail 2
```

**类型说明：**
- `feat`: 新功能
- `fix`: 修复问题
- `update`: 更新内容
- `remove`: 移除功能
- `chore`: 构建/工具相关

## 注意事项

1. **先 add 再 commit** — 修改的文件必须先加入暂存区才能提交
2. **commit message 要写清楚** — 方便以后查看历史
3. **push 前确认** — 确保提交的内容正确后再推送
4. **GitHub Actions 自动触发** — 推送到 master 分支会自动触发构建和部署
