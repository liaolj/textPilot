# TextPilot

> **AI 驾驭你的文字** - AI 驱动的剪贴板文本处理工具

TextPilot 是一款受 Raycast 启发的 Windows 桌面应用,通过快捷键快速处理剪贴板文本,支持多种 AI 模型(OpenAI、Claude、Ollama 等),帮助您高效完成润色、翻译、扩写等文本处理任务。

## ✨ 核心特性

- 🚀 **Raycast 风格交互** - 快捷键唤起,键盘导航,极速操作
- 🤖 **多模型支持** - OpenAI / Claude / Ollama / 自定义 API
- 📋 **剪贴板集成** - 自动读取剪贴板,处理后一键复制
- 🎯 **模板系统** - 内置模板 + 自定义模板,支持变量替换
- ⚡ **快捷键绑定** - 全局唤起 + 动作快捷键,冲突检测
- 👤 **用户偏好** - 写作风格、专业领域、长期上下文
- 📊 **历史记录** - 全文搜索、收藏、按日期清理
- 🌍 **中英双语** - 完整的国际化支持
- 💾 **本地存储** - 数据本地加密存储,隐私安全

## 🏗️ 技术栈

- **框架**: Electron 28
- **前端**: React 18 + TypeScript 5
- **构建工具**: Vite 5
- **状态管理**: Zustand
- **国际化**: i18next + react-i18next
- **数据库**: better-sqlite3
- **加密**: Node.js crypto (AES-256-GCM)

## 📦 安装

### 开发环境

1. **克隆项目**

```bash
git clone <repository-url>
cd textPilot
```

2. **安装依赖**

```bash
npm install
```

3. **启动开发服务器**

```bash
npm run electron:dev
```

### 生产构建

```bash
npm run build
```

生成的安装包位于 `release` 目录。

## 🚀 快速开始

### 1. 配置 AI 模型

首次运行需要配置 AI 模型:

1. 点击托盘图标 → 设置
2. 进入"模型配置"
3. 添加您的模型(如 OpenAI GPT-4)
4. 输入 API Key
5. 设为默认模型

### 2. 使用内置模板

TextPilot 内置 3 个模板:

- **✨ 润色文本** - 使表达更流畅专业
- **🌐 翻译成英文** - 翻译成地道英文
- **📝 扩写** - 丰富细节和论述

#### 使用方式:

1. 复制需要处理的文本
2. 按 `Ctrl + Shift + V` 唤起 TextPilot
3. 搜索或选择动作
4. 按 `Enter` 执行
5. 预览并确认结果

### 3. 创建自定义模板

1. 设置 → 模板管理 → 新增模板
2. 填写名称、图标、提示词
3. 可选:绑定快捷键、指定模型
4. 保存

#### 模板变量:

- `{{clipboard}}` - 剪贴板内容
- `{{date}}` - 当前日期
- `{{time}}` - 当前时间
- `{{user.name}}` - 用户姓名
- `{{user.company}}` - 用户公司
- 更多自定义变量...

示例模板:

```
请帮我写一封邮件,主题如下:

{{clipboard}}

我的签名是:
{{user.name}}
{{user.position}} @ {{user.company}}
```

### 4. 绑定快捷键

#### 全局唤起快捷键:

设置 → 通用 → 全局快捷键(默认 `Ctrl + Shift + V`)

#### 动作快捷键:

设置 → 快捷键 → 为常用动作绑定快捷键

支持冲突检测,避免与系统或其他应用冲突。

### 5. 配置用户偏好

设置 → 用户偏好:

- **写作风格**: 正式 / 轻松 / 简洁 / 详细
- **专业领域**: 技术 / 商务 / 学术 / 创意 / 通用
- **语言偏好**: 中文 / 英文 / 自动检测
- **个人信息**: 姓名、公司、职位、邮箱等
- **长期上下文**: 持久背景信息,始终生效

所有偏好自动注入 AI System Prompt。

## 📖 使用指南

### 核心流程

```
快捷键唤起 → 读取剪贴板 → 选择动作 → AI处理 → 预览编辑 → 确认输出
```

### 键盘快捷键

| 按键 | 功能 |
|------|------|
| `Ctrl + Shift + V` | 唤起主窗口(可自定义) |
| `↑` / `↓` | 上下选择动作 |
| `Enter` | 执行选中动作 |
| `Esc` | 关闭窗口 |

### 托盘菜单

- 打开 TextPilot
- 快捷动作(已绑定快捷键的动作)
- 设置
- 历史记录
- 退出

### 历史记录

- 自动记录所有处理结果
- 全文搜索历史
- 收藏常用结果
- 按日期范围清理

## 🔧 配置说明

### 配置文件位置

Windows: `%APPDATA%/TextPilot/`

- `config.json` - 应用配置
- `models-config.json` - 模型配置(API Key 加密)
- `templates-config.json` - 模板配置
- `preferences-config.json` - 用户偏好
- `history.db` - 历史记录数据库

### 模型配置示例

#### OpenAI

```json
{
  "type": "openai",
  "name": "GPT-4",
  "apiKey": "sk-...",
  "modelName": "gpt-4",
  "baseUrl": "https://api.openai.com/v1"
}
```

#### Claude

```json
{
  "type": "claude",
  "name": "Claude 3 Sonnet",
  "apiKey": "sk-ant-...",
  "modelName": "claude-3-sonnet-20240229",
  "baseUrl": "https://api.anthropic.com/v1"
}
```

#### Ollama(本地)

```json
{
  "type": "ollama",
  "name": "Llama 2",
  "modelName": "llama2",
  "baseUrl": "http://localhost:11434"
}
```

#### 自定义 API

```json
{
  "type": "custom",
  "name": "My API",
  "apiKey": "...",
  "modelName": "model-name",
  "baseUrl": "https://your-api.com/v1"
}
```

## 🛠️ 开发指南

### 项目结构

```
textPilot/
├── electron/                # Electron 主进程
│   ├── main.ts              # 主进程入口
│   ├── preload.ts           # 预加载脚本
│   ├── services/            # 核心服务
│   └── utils/               # 工具函数
├── src/                     # 渲染进程 (React)
│   ├── components/          # React 组件
│   ├── stores/              # Zustand 状态
│   ├── types/               # TypeScript 类型
│   ├── i18n/                # 国际化
│   └── styles/              # 样式文件
├── resources/               # 资源文件
├── package.json             # 项目配置
└── vite.config.ts           # Vite 配置
```

### 开发命令

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 仅构建 Windows 安装包
npm run build:win
```

### 添加新的 AI 模型适配器

1. 在 `electron/services/ai/` 创建新适配器文件
2. 实现 `process(systemPrompt, userPrompt)` 方法
3. 在 `electron/services/ai/index.ts` 注册适配器
4. 在 `src/types/models.ts` 添加新的 ModelType

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📄 许可证

MIT License

## 🙏 致谢

- 灵感来源: [Raycast](https://www.raycast.com/)
- UI 设计参考: Raycast、Spotlight

---

**TextPilot** - 让 AI 成为您的文字驾驶员 🚀
