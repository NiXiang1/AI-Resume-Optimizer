# AI Resume Optimizer

AI Resume Optimizer / AI 简历优化助手，是一个面向大学生、秋招求职者和转岗人群的 AI 简历优化工具。用户可以粘贴简历文本和目标岗位 JD，系统会调用大模型分析简历与岗位的匹配度，输出结构化诊断结果，并生成一版更适合投递该岗位的优化简历文本。

这个项目适合作为 AI 应用方向的秋招项目，也可以继续扩展成一个轻量副业工具。

## 项目亮点

- 使用大模型完成简历与岗位 JD 的语义匹配分析
- 通过 Prompt Engineering 约束 AI 返回结构化 JSON
- 支持根据不同岗位生成定制化简历文本
- 封装兼容大模型 API，当前支持 DeepSeek，后续可替换为 OpenAI 或其他兼容服务
- 增加 AI 返回结果校验，避免模型字段缺失导致页面崩溃
- 增加友好错误提示，覆盖 Key 错误、余额不足、网络失败、限流和 JSON 格式异常等情况
- 完成从需求分析、接口封装、前端交互到结果展示的 AI 产品闭环

## 已实现功能

### 首页

- 项目介绍
- 产品亮点展示
- “开始优化简历”入口

### 简历优化页

- 简历文本输入
- PDF 简历上传并自动解析文本
- Word .docx 简历上传并自动解析文本
- 岗位 JD 输入
- 示例内容一键填充
- 步骤式分析状态：
  - 正在解析简历
  - 正在分析岗位 JD
  - 正在匹配关键词
  - 正在生成优化建议

### 结果页

- 匹配度评分
- 整体评价
- 简历优势
- 问题诊断
- 缺失关键词
- JD 岗位关键词提取
- JD 匹配分析
- 教育经历优化建议
- 项目经历优化建议
- 技能栈优化建议
- 实习/实践经历优化建议
- 个人总结优化建议
- 优化后的简历文本
- 原始简历 / 优化后表达对比
- 一键复制优化版简历
- 一键生成精美简历

### 精美简历生成页

- 将 AI 优化后的简历文本转换为统一 `resume.json`
- 内置“左侧深色信息栏模板”
- 自动把 `resume.json` 填充到模板
- 支持预览模式 / 编辑模式切换
- 支持在线编辑基本信息、教育背景、技能、项目经历、实习经历、校园经历、荣誉奖项、证书、志愿服务和自我评价
- 支持新增、删除、上移、下移数组内容
- 支持在线 A4 预览
- 支持导出可编辑 DOCX
- 支持通过浏览器打印导出 PDF
- 预留 `template_parser` 模块，后续可接入视觉模型解析用户上传的 PDF / Word / 图片模板

### AI 接口能力

- `/api/analyze` 后端分析接口
- `/api/extract-resume` 简历文件解析接口
- `/api/history` 历史记录查询接口
- `analyzeResume()` AI 调用封装
- Mock / 真实 API 双模式
- DeepSeek OpenAI-compatible API 接入
- AI 返回 JSON 结构校验
- 友好错误处理
- JD 技术关键词、经验关键词、软技能关键词和加分项提取
- 简历改写对比生成
- Supabase 历史记录保存与查询

## 技术栈

前端：

- Next.js
- React
- TypeScript
- Tailwind CSS

后端：

- Next.js API Route

AI：

- DeepSeek API
- OpenAI-compatible Chat Completions API
- Prompt Engineering
- JSON 结构化输出

工程化：

- ESLint
- TypeScript 类型检查
- npm scripts

数据存储：

- Supabase
- PostgreSQL

## 项目目录结构

```text
AI-Resume-Optimizer
├── app
│   ├── api
│   │   ├── analyze
│   │   │   └── route.ts          # 简历分析 API
│   │   ├── extract-resume
│   │   │   └── route.ts          # 简历文件解析 API
│   │   └── history
│   │       └── route.ts          # 历史记录查询 API
│   ├── history
│   │   └── page.tsx              # 历史记录页
│   ├── optimizer
│   │   └── page.tsx              # 简历/JD 输入页
│   ├── result
│   │   └── page.tsx              # 分析结果页
│   ├── resume-generator
│   │   ├── page.tsx              # 精美简历生成页
│   │   └── resume-generator.css  # 生成页样式
│   ├── templates
│   │   └── template1
│   │       └── page.tsx          # Template1 预览页
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 页面布局
│   └── page.tsx                  # 首页
├── lib
│   ├── ai
│   │   ├── analyzeResume.ts      # AI 分析主逻辑
│   │   ├── errors.ts             # 错误类型与友好错误转换
│   │   ├── mockAnalysis.ts       # Mock 分析结果
│   │   └── validateAnalysis.ts   # AI 返回结果结构校验
│   ├── history
│   │   ├── resumeHistory.ts      # Supabase 历史记录读写
│   │   └── types.ts              # 历史记录类型
│   ├── resume
│   │   └── extractResumeText.ts  # PDF / Word 文本解析
│   ├── supabase
│   │   └── server.ts             # 服务端 Supabase Client
│   └── types.ts                  # 全局类型定义
├── src
│   ├── components
│   │   └── resume-templates
│   │       ├── Template1.tsx     # 左侧深色信息栏简历模板
│   │       └── Template1.css     # A4 模板样式与打印样式
│   ├── data
│   │   └── sampleResume.ts       # 模板示例数据
│   ├── lib
│   │   └── resume-json
│   │       └── convertOptimizedResume.ts # 优化文本转 resume.json
│   └── template_parser
│       └── index.ts              # 未来模板视觉解析预留模块
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 本地运行

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

打开：

```text
http://127.0.0.1:3000
```

如果 `localhost:3000` 无法访问，可以尝试使用 `127.0.0.1:3000`。

## 上传简历文件

在简历优化页可以选择上传简历文件，系统会自动解析文本并填入“简历文本”输入框。

当前支持：

- PDF
- Word `.docx`

暂不支持：

- Word `.doc`
- 纯图片扫描版 PDF

如果文件解析结果不理想，可以直接把简历文本粘贴到输入框中。

## Mock / 真实模型双模式

简历优化页顶部提供“分析模式”切换：

- Mock 演示：返回内置示例分析结果，适合本地演示、页面调试和线上 Demo，不消耗模型额度。
- 真实模型：调用 `.env.local` 中配置的大模型 API，生成真实诊断结果。

后端也支持通过环境变量设置默认模式。页面请求传入的模式优先级最高，其次读取 `AI_MODE`，最后兼容旧的 `USE_MOCK_AI`。

### 使用 Mock 模式

如果只是想演示页面流程，不想消耗 API 额度，可以使用 mock 模式。

新建或修改 `.env.local`：

```bash
AI_MODE=mock
```

然后重启：

```bash
npm run dev
```

## 接入 DeepSeek API

新建 `.env.local`：

```bash
DEEPSEEK_API_KEY=你的 DeepSeek API Key
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-v4-flash
AI_MODE=real
```

启动项目：

```bash
npm run dev
```

提交简历和 JD 后，系统会请求 DeepSeek API 并生成真实分析结果。

注意：`.env.local` 已经被 `.gitignore` 忽略，不要把 API Key 提交到仓库。

## 接入 Supabase 历史记录

历史记录会保存：

- 原简历
- 目标岗位 JD
- 完整分析结果
- 优化版简历
- 创建时间

### 1. 创建数据表

在 Supabase SQL Editor 中执行：

```sql
create table if not exists public.resume_analysis_history (
  id uuid primary key default gen_random_uuid(),
  resume_text text not null,
  job_description text not null,
  analysis_result jsonb not null,
  optimized_resume text not null,
  score integer not null check (score >= 0 and score <= 100),
  created_at timestamptz not null default now()
);

create index if not exists resume_analysis_history_created_at_idx
  on public.resume_analysis_history (created_at desc);
```

同样的 SQL 也保存在：

```text
supabase/schema.sql
```

### 2. 配置环境变量

在 `.env.local` 中添加：

```bash
SUPABASE_URL=你的 Supabase Project URL
SUPABASE_SECRET_KEY=你的 Supabase secret key
```

如果你的 Supabase 项目仍然使用旧版 API key，也可以配置：

```bash
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase service_role key
```

注意：`SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` 只能在服务端使用，不要暴露到前端，也不要提交到仓库。

### 3. 使用历史记录

启动项目后打开：

```text
http://127.0.0.1:3000/history
```

完成一次新的简历分析后，系统会自动尝试保存历史记录。如果 Supabase 未配置，分析流程仍然可用，只是历史记录不会写入数据库。

未配置 Supabase 时，项目会自动使用浏览器本地历史记录：

- 新的分析结果会保存到当前浏览器的 `localStorage`
- 历史页会标注“当前使用本地历史记录”
- 本地历史最多保留 20 条
- 换浏览器或清理浏览器数据后，本地历史会丢失

配置 Supabase 后，新的分析结果会保存到云端数据库。

## 切换其他兼容模型

项目使用 OpenAI-compatible API 格式。想切换到其他兼容服务时，主要修改下面三个环境变量：

```bash
AI_API_KEY=你的 API Key
AI_BASE_URL=https://你的模型服务地址
AI_MODEL=你的模型名称
AI_MODE=real
```

例如 OpenAI：

```bash
AI_API_KEY=你的 OpenAI API Key
AI_BASE_URL=https://api.openai.com
AI_MODEL=gpt-4o-mini
AI_MODE=real
```

## AI 返回 JSON 格式

后端期望 AI 返回类似下面的结构：

```json
{
  "score": 82,
  "summary": "整体评价",
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["问题1", "问题2"],
  "missing_keywords": ["关键词1", "关键词2"],
  "jd_keywords": {
    "technical": ["技术关键词"],
    "experience": ["经验关键词"],
    "soft_skills": ["软技能关键词"],
    "bonus": ["加分项"]
  },
  "jd_match": {
    "level": "较匹配",
    "matched_keywords": ["关键词1"],
    "gap_description": "差距说明"
  },
  "suggestions": {
    "education": [],
    "projects": [],
    "skills": [],
    "experience": [],
    "summary": []
  },
  "rewrite_comparison": [
    {
      "section": "项目经历",
      "original": "原始简历表达",
      "optimized": "优化后的表达",
      "improvement": "改写价值说明"
    }
  ],
  "optimized_resume": "优化后的简历文本"
}
```

`lib/ai/validateAnalysis.ts` 会对结果进行校验。如果字段缺失或格式不对，接口会返回友好的错误提示。

## 精美简历生成

完成一次简历分析后，在结果页点击“生成精美简历”。

系统会执行：

1. 读取 `optimized_resume`
2. 调用 `convertOptimizedResumeToResumeData()`
3. 生成统一 `resume.json`
4. 进入 `/resume-generator`
5. 自动填充内置 Template1

在线编辑：

```text
点击“编辑简历” -> 修改表单 -> 右侧实时预览 -> 点击“保存修改”
```

导出 DOCX：

```text
点击“导出 DOCX” -> 下载可编辑 Word 文档
```

导出 PDF：

```text
点击“导出 PDF” -> 浏览器打印面板 -> 选择“保存为 PDF”
```

当前阶段只内置 1 个稳定模板。未来可以扩展：

- 更多内置模板
- 可视化编辑 resume.json
- 用户上传模板
- `template_parser` + 视觉模型解析 PDF / Word / 图片模板

## 常见问题

### 1. 页面提示无法访问 localhost

通常是开发服务没有启动。重新运行：

```bash
npm run dev
```

然后访问：

```text
http://127.0.0.1:3000
```

### 2. 提示 DeepSeek API Key 无效

检查 `.env.local`：

```bash
DEEPSEEK_API_KEY=你的真实 Key
AI_MODE=real
```

修改后需要重启 `npm run dev`。

### 3. 提示余额不足

到 DeepSeek 控制台检查账户余额。开发调试时可以暂时开启：

```bash
AI_MODE=mock
```

### 4. 提示 AI 返回格式异常

可能是模型没有严格返回 JSON，或输入内容过长导致输出不完整。可以尝试：

- 重新分析一次
- 缩短简历或 JD
- 检查模型是否支持 JSON 输出
- 调整 `buildPrompt()` 中的提示词

### 5. PDF / Word 解析不到文本

可能原因：

- PDF 是图片扫描件，没有可复制文本
- Word 文件是旧版 `.doc`，当前只支持 `.docx`
- 文件内容过少或格式异常

可以尝试导出为 `.docx` 或可复制文本的 PDF，或者直接粘贴简历文本。

## 可继续完善的方向

短期适合继续做：

- 更细粒度的项目经历改写
- 支持用户选择某一段经历单独改写
- 支持复制单条优化建议或单条改写结果
- 支持旧版 Word `.doc` 解析
- 支持图片扫描版 PDF 的 OCR 识别
- 支持导出 Markdown / PDF / Word
- 增加更多内置简历模板
- 支持在线编辑 `resume.json`

中期可以扩展：

- 登录系统
- 用户每日免费次数
- 简历优化历史版本
- 本地历史一键迁移到 Supabase
- 面试题生成
- 根据简历和 JD 生成自我介绍

长期可以发展为：

- AI 求职助手
- 多岗位简历定制
- 简历投递建议
- 面试准备 Agent
- 面向 C 端求职者的轻量 SaaS 工具

## 简历项目描述参考

可以在简历中这样描述：

```text
AI 简历优化助手 | Next.js / TypeScript / Tailwind CSS / DeepSeek API
- 面向大学生秋招场景设计并实现 AI 简历优化工具，支持用户输入简历文本与目标岗位 JD，自动生成匹配度评分、问题诊断、缺失关键词和优化建议。
- 封装 analyzeResume 方法对接 DeepSeek OpenAI-compatible API，通过 Prompt Engineering 约束大模型返回结构化 JSON，支持岗位关键词提取与简历改写对比展示。
- 增加 AI 返回结果结构校验和错误分层处理，覆盖 API Key 错误、余额不足、网络失败、限流和 JSON 格式异常等情况，提升系统稳定性和用户体验。
- 设计首页、输入页、结果页与精美简历生成页的完整产品流程，支持步骤式分析状态、优化版简历一键复制、A4 模板预览和浏览器导出 PDF，完成从需求分析到 AI 应用落地的闭环。
```

## 开发命令

```bash
npm run dev      # 启动开发服务
npm run build    # 生产构建
npm run lint     # 代码检查
```
