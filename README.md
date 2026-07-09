# AI Resume Optimizer

AI Resume Optimizer / AI 简历优化助手，是一个面向大学生秋招、实习投递、转岗求职者的 AI 简历优化工具。用户可以上传或粘贴简历，输入目标岗位 JD，系统会分析简历与岗位的匹配度，提取岗位关键词，给出结构化修改建议，并生成一版更适合投递该岗位的优化简历。

项目已经覆盖“输入简历 -> AI 分析 -> 结果诊断 -> 优化改写 -> 生成精美简历 -> 在线编辑 -> 导出投递文件”的完整闭环，适合作为 AI 应用、Next.js 全栈项目或求职作品集项目展示。

## 核心能力

- 简历与岗位 JD 的语义匹配分析，输出 0-100 匹配度评分。
- JD 关键词拆解，覆盖技术关键词、经验要求、软技能和加分项。
- 简历优势、问题诊断、缺失关键词和分模块优化建议。
- 原始表达与优化表达对比，展示 AI 改写逻辑。
- 根据目标岗位生成定制化优化版简历文本。
- 支持 PDF / Word `.docx` 简历上传解析，也支持手动粘贴文本。
- Mock / 真实模型双模式，便于本地演示和真实调用切换。
- DeepSeek / OpenAI-compatible Chat Completions API 接入。
- AI 返回 JSON 结构校验与友好错误提示。
- Supabase 云端历史记录，本地历史记录兜底，并支持本地历史迁移到 Supabase。
- 优化结果可一键生成精美简历，支持在线编辑、模板切换、头像上传裁剪、HTML 导出和 PDF 导出。

## 功能模块

### 首页

- 项目价值介绍。
- 产品亮点展示。
- “开始优化简历”和“查看历史记录”入口。

### 简历优化页

- 简历文本输入。
- PDF / `.docx` 文件上传并自动解析文本。
- 上传文件类型校验、空文件校验和 8MB 大小限制。
- 岗位 JD 输入。
- 示例内容一键填充。
- Mock / 真实模型模式切换。
- 步骤式分析状态展示：
  - 解析简历
  - 分析岗位 JD
  - 匹配关键词
  - 生成优化建议
  - 生成优化版简历

### 结果页

- 匹配度评分和整体评价。
- 简历优势、问题诊断、缺失关键词。
- JD 技术关键词、经验关键词、软技能和加分项提取。
- JD 匹配等级、已匹配关键词和差距说明。
- 教育背景、项目经历、技能栈、实践经历、个人总结优化建议。
- 原始简历表达 / 优化后表达对比。
- 优化版简历文本展示。
- 一键复制优化版简历。
- 一键进入精美简历生成页。

### 历史记录页

- 查看已保存的简历分析记录。
- 支持查看原简历、岗位 JD、完整分析结果和优化版简历。
- Supabase 已配置时保存到云端数据库。
- Supabase 未配置或暂不可用时自动使用浏览器本地历史。
- 本地历史最多保留 20 条。
- 支持删除历史记录。
- 支持将本地历史记录迁移到 Supabase。
- 支持从历史记录继续生成精美简历。

### 精美简历生成页

- 将 AI 优化后的简历文本转换为统一 `resume.json`。
- 内置 3 套 A4 简历模板：
  - Template1：左侧深色信息栏模板。
  - Template2：蓝色分区式中文简历模板。
  - Template3：更强调项目与能力结构的简历模板。
- 支持预览模式 / 编辑模式切换。
- 支持在线编辑：
  - 基本信息
  - 头像
  - 教育背景
  - 专业技能
  - 项目经历
  - 实习 / 工作经历
  - 校园经历
  - 荣誉奖项
  - 证书
  - 优势亮点
  - 志愿服务
  - 自我评价
  - 自定义板块
- 支持新增、删除、上移、下移数组内容。
- 支持隐藏和恢复简历板块。
- 支持头像上传、拖拽裁剪、缩放和自动人脸定位。
- 支持 A4 预览和超出一页提示。
- 支持导出独立 HTML 文件。
- 支持直接生成并下载 PDF 文件。
- 编辑内容会自动保存到当前浏览器，下次进入继续保留。

## 技术栈

前端：

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

后端：

- Next.js App Router
- Route Handlers

AI：

- DeepSeek API
- OpenAI-compatible Chat Completions API
- Prompt Engineering
- JSON 结构化输出
- AI 响应结构校验

数据与文件：

- Supabase
- PostgreSQL
- `pdf-parse`
- `mammoth`
- `html2canvas`
- `jspdf`

工程化：

- ESLint
- TypeScript
- npm scripts
- Vercel 部署配置

## 项目目录

```text
AI-Resume-Optimizer
├── app
│   ├── api
│   │   ├── analyze/route.ts          # 简历分析 API
│   │   ├── extract-resume/route.ts   # PDF / Word 文本解析 API
│   │   └── history/route.ts          # 历史记录查询、删除、迁移 API
│   ├── history/page.tsx              # 历史记录页
│   ├── optimizer/page.tsx            # 简历与 JD 输入页
│   ├── result/page.tsx               # 分析结果页
│   ├── resume-generator
│   │   ├── page.tsx                  # 精美简历生成和编辑页
│   │   └── resume-generator.css      # 简历生成页样式
│   ├── templates
│   │   ├── template1/page.tsx        # Template1 预览页
│   │   ├── template2/page.tsx        # Template2 预览页
│   │   └── template3/page.tsx        # Template3 预览页
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib
│   ├── ai
│   │   ├── analyzeResume.ts          # AI 分析主逻辑
│   │   ├── errors.ts                 # 错误类型与友好错误转换
│   │   ├── mockAnalysis.ts           # Mock 分析结果
│   │   └── validateAnalysis.ts       # AI 返回结果结构校验
│   ├── history
│   │   ├── localHistory.ts           # 浏览器本地历史
│   │   ├── resumeHistory.ts          # Supabase 历史记录读写
│   │   └── types.ts
│   ├── resume/extractResumeText.ts   # PDF / Word 文本解析
│   ├── supabase/server.ts            # 服务端 Supabase Client
│   └── types.ts
├── src
│   ├── components
│   │   ├── AvatarUploader.tsx        # 头像上传与裁剪
│   │   └── resume-templates          # A4 简历模板与预览组件
│   ├── data/sampleResume.ts
│   ├── lib
│   │   ├── resume-export             # HTML / PDF 导出
│   │   ├── resume-json               # 优化文本转 resume.json
│   │   └── resume-storage            # 简历草稿本地保存
│   ├── template_parser/index.ts      # 未来模板视觉解析预留模块
│   └── types/resume.ts
├── supabase/schema.sql               # Supabase 表结构
├── PRODUCT.md
├── package.json
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

常用命令：

```bash
npm run dev      # 启动开发服务
npm run lint     # 代码检查
npm run build    # 生产构建
```

## 环境变量

项目默认支持 Mock 模式，不配置模型 Key 也可以跑通主要页面流程。

### Mock 演示模式

```bash
AI_MODE=mock
```

### 真实模型模式

DeepSeek 示例：

```bash
DEEPSEEK_API_KEY=你的 DeepSeek API Key
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-v4-flash
AI_MODE=real
```

通用 OpenAI-compatible 配置：

```bash
AI_API_KEY=你的 API Key
AI_BASE_URL=https://你的模型服务地址
AI_MODEL=你的模型名称
AI_MODE=real
```

OpenAI 示例：

```bash
AI_API_KEY=你的 OpenAI API Key
AI_BASE_URL=https://api.openai.com
AI_MODEL=gpt-4o-mini
AI_MODE=real
```

优先级说明：

- 页面请求中的模式优先级最高。
- 其次读取 `AI_MODE`。
- 最后兼容旧配置 `USE_MOCK_AI`。

`.env.local` 已被 `.gitignore` 忽略，请不要把 API Key 提交到仓库。

## 简历文件上传

优化页支持上传简历文件，解析成功后会自动填入“简历文本”输入框。

当前支持：

- PDF
- Word `.docx`

限制：

- 文件大小不超过 8MB。
- 暂不支持旧版 Word `.doc`。
- 暂不支持纯图片扫描版 PDF 的 OCR 识别。

如果文件解析结果不理想，可以直接复制简历正文并粘贴到输入框。

## Supabase 历史记录

历史记录保存内容：

- 原简历
- 目标岗位 JD
- 完整分析结果
- 优化版简历
- 匹配度评分
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

同样的 SQL 保存在：

```text
supabase/schema.sql
```

### 2. 配置环境变量

```bash
SUPABASE_URL=你的 Supabase Project URL
SUPABASE_SECRET_KEY=你的 Supabase secret key
```

如果你的 Supabase 项目仍使用旧版 API key，也可以配置：

```bash
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase service_role key
```

`SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` 只能在服务端使用，不要暴露到前端。

### 3. 本地历史兜底

没有配置 Supabase，或 Supabase 暂时连接失败时，系统会自动使用当前浏览器的 `localStorage` 保存历史记录：

- 本地历史最多保存 20 条。
- 历史页会提示当前使用本地历史。
- 配置 Supabase 后，可以在历史页把本地历史迁移到云端。

## AI 返回 JSON 格式

后端期望模型返回合法 JSON，并会通过 `lib/ai/validateAnalysis.ts` 做结构校验。核心结构如下：

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

如果模型返回内容为空、不是合法 JSON，或字段缺失，接口会返回可读的错误提示，避免页面崩溃。

## 简历生成与导出

从结果页点击“生成精美简历”后，系统会：

1. 读取 `optimized_resume`。
2. 调用 `convertOptimizedResumeToResumeData()`。
3. 生成统一 `resume.json`。
4. 写入当前会话草稿。
5. 进入 `/resume-generator` 并渲染模板。

支持导出：

- HTML：导出独立 HTML 文件，自动移除预览辅助提示。
- PDF：使用 `html2canvas` + `jspdf` 将 A4 预览生成 PDF，支持多页切分。

## 常见问题

### 页面无法访问

确认开发服务已启动：

```bash
npm run dev
```

然后访问：

```text
http://127.0.0.1:3000
```

### 提示 API Key 无效

检查 `.env.local` 中的 Key 和模式：

```bash
DEEPSEEK_API_KEY=你的真实 Key
AI_MODE=real
```

修改环境变量后需要重启开发服务。

### 提示账户余额不足

请到模型服务控制台检查余额。开发调试时可以临时切换到：

```bash
AI_MODE=mock
```

### AI 返回格式异常

可能原因：

- 模型没有严格返回 JSON。
- 简历或 JD 太长，导致输出被截断。
- 模型不支持 `response_format: { type: "json_object" }`。

可以尝试缩短输入、重新分析，或更换支持 JSON 输出的模型。

### PDF / Word 解析不到文本

可能原因：

- PDF 是扫描图片，没有可复制文本。
- Word 文件是旧版 `.doc`。
- 文件内容过少或格式异常。

可以尝试重新导出 `.docx`、使用可复制文本的 PDF，或直接粘贴简历正文。

## 可继续扩展的方向

- 扫描版 PDF OCR 识别。
- 更多内置简历模板。
- 模板市场或用户上传模板。
- 单条经历定向改写。
- 根据简历和 JD 生成自我介绍、面试题和投递建议。
- 登录系统、用户配额和多端同步。
- 多岗位版本管理。
- 面向 C 端求职者的轻量 SaaS 工具。

## 简历项目描述参考

```text
AI 简历优化助手 | Next.js / TypeScript / Tailwind CSS / DeepSeek API / Supabase
- 面向大学生秋招和实习投递场景，设计并实现 AI 简历优化工具，支持简历上传解析、岗位 JD 输入、匹配度评分、缺失关键词诊断和优化版简历生成。
- 封装 OpenAI-compatible Chat Completions 调用，通过 Prompt Engineering 约束模型返回结构化 JSON，并增加结果校验、错误分层和 Mock / 真实模型双模式，提升系统稳定性与演示效率。
- 实现 Supabase 云端历史记录与 localStorage 本地兜底，支持历史记录查看、删除、本地历史迁移和从历史记录继续生成简历。
- 构建精美简历生成模块，将优化文本转换为 resume.json，支持 3 套 A4 模板、在线编辑、头像裁剪、板块管理、HTML 导出和 PDF 导出，形成从 AI 分析到投递文件生成的完整闭环。
```
