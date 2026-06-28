import type { ResumeAnalysis } from "@/lib/types";

export const mockAnalysis: ResumeAnalysis = {
  score: 82,
  summary:
    "整体来看，简历具备较好的 AI 应用项目基础，与目标岗位的技术方向有一定匹配度。当前主要问题是项目成果表达不够量化，部分 JD 关键词没有被自然体现，建议强化业务场景、技术选型和最终效果。",
  strengths: [
    "项目经历与 AI 应用开发相关，适合作为秋招项目展示。",
    "技术栈覆盖前端、后端和大模型 API 调用，具备完整产品落地意识。",
    "简历内容具备可优化空间，适合按不同岗位进行定制化投递。"
  ],
  weaknesses: [
    "项目描述偏功能罗列，缺少问题背景、技术难点和结果指标。",
    "与 JD 相关的关键词出现不足，例如 Prompt Engineering、结构化输出、语义匹配。",
    "技能栈没有和项目成果形成强关联，招聘方不容易判断真实掌握程度。"
  ],
  missing_keywords: [
    "Prompt Engineering",
    "语义匹配",
    "结构化 JSON 输出",
    "Next.js API Route",
    "大模型应用开发",
    "产品闭环"
  ],
  jd_keywords: {
    technical: ["Next.js", "TypeScript", "OpenAI-compatible API", "结构化 JSON 输出", "Prompt Engineering"],
    experience: ["大模型应用开发", "前后端协作", "API 封装", "完整项目经验"],
    soft_skills: ["产品意识", "需求理解", "快速学习", "沟通协作"],
    bonus: ["AI 应用落地经验", "求职场景理解", "可演示的产品闭环"]
  },
  jd_match: {
    level: "较匹配",
    matched_keywords: ["Next.js", "TypeScript", "AI 应用", "API 封装"],
    gap_description:
      "基础技术栈匹配度较好，但需要补充大模型调用、提示词设计、结果稳定性和用户体验方面的表达。"
  },
  suggestions: {
    education: [
      "如果课程与目标岗位相关，可补充机器学习、数据结构、Web 开发等课程。",
      "保留学校、专业、时间和成绩亮点，避免堆砌无关课程。"
    ],
    projects: [
      "用“背景-方案-结果”的结构重写项目经历，突出你解决了什么问题。",
      "补充技术细节，例如通过 Prompt 约束模型输出 JSON，前端根据结构化结果渲染诊断报告。",
      "尽量加入量化结果，例如分析耗时、页面流程、用户反馈或功能完成度。"
    ],
    skills: [
      "将技能分组为前端、后端、AI 能力和工程工具。",
      "把大模型相关技能写具体，例如 OpenAI API、Prompt Engineering、结构化输出解析。"
    ],
    experience: [
      "没有实习也可以写课程设计、开源实践、比赛或个人项目，但要强调真实产出。",
      "实践经历中优先展示和目标岗位最相关的任务。"
    ],
    summary: [
      "个人总结控制在 2-3 句，突出 AI 应用开发、产品意识和快速学习能力。",
      "避免泛泛而谈，把目标岗位 JD 中的核心能力自然融入表达。"
    ]
  },
  rewrite_comparison: [
    {
      section: "项目经历",
      original: "调用大模型接口分析简历内容，生成优化建议。",
      optimized:
        "封装 analyzeResume 方法，将简历和 JD 传入大模型，通过 Prompt 约束返回稳定 JSON 结构，便于前端按模块渲染分析报告。",
      improvement: "从功能描述升级为工程实现表达，突出 API 封装、Prompt 约束和结构化输出。"
    },
    {
      section: "技能栈",
      original: "React、Next.js、TypeScript、Tailwind CSS、Node.js、Git",
      optimized:
        "前端：Next.js、React、TypeScript、Tailwind CSS；AI 应用：OpenAI-compatible API、Prompt Engineering、结构化 JSON 输出。",
      improvement: "把技能按岗位关注点分组，让招聘方更快看到 AI 应用相关能力。"
    },
    {
      section: "个人总结",
      original: "计算机专业本科生，熟悉 React、TypeScript 和基础后端开发，关注 AI 应用方向。",
      optimized:
        "具备 AI 应用开发与 Web 产品落地经验，熟悉 Next.js、TypeScript 和 API Route 开发，能够围绕求职场景完成从需求分析到功能实现的闭环。",
      improvement: "补足业务场景和产品闭环，避免只停留在技术兴趣层面。"
    }
  ],
  optimized_resume: `个人总结
具备 AI 应用开发与 Web 产品落地经验，熟悉 Next.js、TypeScript 和 API Route 开发。能够通过 Prompt Engineering 约束大模型输出结构化结果，并围绕具体求职场景完成从需求分析、交互设计到功能实现的闭环。

项目经历
AI 简历优化助手 | Next.js / TypeScript / Tailwind CSS / OpenAI API
- 面向大学生秋招场景设计并实现 AI 简历优化工具，支持用户输入简历文本与目标岗位 JD，自动生成匹配度评分、问题诊断、缺失关键词和优化建议。
- 封装 analyzeResume 方法，将简历和 JD 传入大模型，通过 Prompt 约束返回稳定 JSON 结构，便于前端按模块渲染分析报告。
- 设计“首页-输入页-结果页”的完整产品流程，支持优化版简历一键复制，提升用户从分析到修改的操作效率。
- 根据岗位关键词对项目经历、技能栈和个人总结进行定制化改写，突出语义匹配、结构化输出和 AI 产品闭环能力。

技能栈
- 前端：Next.js、React、TypeScript、Tailwind CSS
- 后端：Next.js API Route、RESTful API
- AI 应用：OpenAI API、Prompt Engineering、结构化 JSON 输出、岗位 JD 分析
- 工程工具：Git、npm、模块化开发`
};
