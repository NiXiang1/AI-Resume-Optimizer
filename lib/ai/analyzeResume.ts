import { mockAnalysis } from "@/lib/ai/mockAnalysis";
import { AnalyzeError } from "@/lib/ai/errors";
import { validateResumeAnalysis } from "@/lib/ai/validateAnalysis";
import type { AnalyzeResumeRequest, ResumeAnalysis } from "@/lib/types";

export async function analyzeResume({
  resumeText,
  jobDescription,
  aiMode
}: AnalyzeResumeRequest): Promise<ResumeAnalysis> {
  if (!resumeText.trim() || !jobDescription.trim()) {
    throw new AnalyzeError({
      code: "VALIDATION_ERROR",
      message: "请同时填写简历内容和目标岗位 JD。",
      suggestion: "简历和岗位 JD 都不能为空。建议至少包含项目经历、技能栈和岗位职责要求。"
    });
  }

  const resolvedAiMode = resolveAiMode(aiMode);

  if (resolvedAiMode === "mock") {
    return {
      ...mockAnalysis,
      summary: `${mockAnalysis.summary} 当前结果为 mock 数据，用于跑通 MVP 页面流程。`
    };
  }

  return analyzeResumeWithCompatibleApi({ resumeText, jobDescription });
}

function resolveAiMode(requestedMode?: AnalyzeResumeRequest["aiMode"]): "mock" | "real" {
  if (requestedMode === "mock" || requestedMode === "real") {
    return requestedMode;
  }

  const configuredMode = process.env.AI_MODE?.toLowerCase();

  if (configuredMode === "mock" || configuredMode === "real") {
    return configuredMode;
  }

  return process.env.USE_MOCK_AI === "false" ? "real" : "mock";
}

async function analyzeResumeWithCompatibleApi({
  resumeText,
  jobDescription
}: AnalyzeResumeRequest): Promise<ResumeAnalysis> {
  const apiKey = process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = process.env.AI_BASE_URL || "https://api.deepseek.com";
  const model = process.env.AI_MODEL || process.env.DEEPSEEK_MODEL || process.env.OPENAI_MODEL || "deepseek-v4-flash";

  if (!apiKey) {
    throw new AnalyzeError({
      code: "MISSING_API_KEY",
      message: "还没有配置 DeepSeek API Key。",
      suggestion: "请在 .env.local 中添加 DEEPSEEK_API_KEY，并确认 AI_MODE=real。"
    });
  }

  let response: Response;

  try {
    response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "你是资深求职简历优化顾问，擅长分析简历与岗位 JD 的匹配度。必须只返回合法 JSON，不要返回 Markdown。"
          },
          {
            role: "user",
            content: buildPrompt(resumeText, jobDescription)
          }
        ],
        temperature: 0.4
      })
    });
  } catch (error) {
    throw new AnalyzeError({
      code: "NETWORK_ERROR",
      message: "网络连接失败，暂时无法访问 AI 服务。",
      suggestion: "请检查网络连接、代理设置和 AI_BASE_URL 是否正确，然后稍后重试。",
      status: 502
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw mapAiServiceError(response.status, errorText);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new AnalyzeError({
      code: "AI_RESPONSE_FORMAT_ERROR",
      message: "AI 没有返回有效内容。",
      suggestion: "请重新分析一次；如果反复出现，建议缩短简历或 JD 内容后再试。",
      status: 502
    });
  }

  try {
    return validateResumeAnalysis(JSON.parse(content));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new AnalyzeError({
        code: "AI_RESPONSE_FORMAT_ERROR",
        message: "AI 返回的内容不是合法 JSON。",
        suggestion: "请重新分析一次；如果反复失败，可以降低输入长度或检查模型是否支持 JSON 输出。",
        status: 502
      });
    }

    throw error;
  }
}

function mapAiServiceError(status: number, errorText: string) {
  const lowerError = errorText.toLowerCase();

  if (status === 401 || status === 403) {
    return new AnalyzeError({
      code: "AUTH_ERROR",
      message: "DeepSeek API Key 无效或没有权限。",
      suggestion: "请检查 .env.local 里的 DEEPSEEK_API_KEY 是否正确，修改后重启 npm run dev。",
      status
    });
  }

  if (status === 402 || lowerError.includes("balance") || lowerError.includes("insufficient")) {
    return new AnalyzeError({
      code: "BALANCE_ERROR",
      message: "DeepSeek 账户余额不足，暂时无法完成分析。",
      suggestion: "请到 DeepSeek 控制台检查余额或充值，也可以先把 AI_MODE 改成 mock 继续调试页面。",
      status
    });
  }

  if (status === 429) {
    return new AnalyzeError({
      code: "RATE_LIMIT",
      message: "请求过于频繁，AI 服务暂时限流。",
      suggestion: "请稍等一会儿再重新分析，或减少连续提交次数。",
      status
    });
  }

  return new AnalyzeError({
    code: "AI_SERVICE_ERROR",
    message: "AI 服务返回异常，暂时无法完成分析。",
    suggestion: `服务状态码：${status}。请稍后重试，或检查模型名称和服务地址是否正确。`,
    status: 502
  });
}

function buildPrompt(resumeText: string, jobDescription: string) {
  return `请根据以下简历和目标岗位 JD，输出结构化 JSON 分析结果。

要求：
1. score 为 0-100 的整数。
2. strengths、weaknesses、missing_keywords 都是字符串数组。
3. jd_keywords 必须从岗位 JD 中提取，包含 technical、experience、soft_skills、bonus 四类关键词。
4. suggestions 必须包含 education、projects、skills、experience、summary 五个字段。
5. rewrite_comparison 返回 2-4 条最值得展示的改写对比，优先选择项目经历、技能栈、个人总结。original 必须来自原简历或尽量贴近原简历表达，optimized 是改写后的表达，improvement 说明改写价值。
6. optimized_resume 返回一版适合投递该岗位的中文简历文本。
7. 不要编造不存在的教育、公司、证书或奖项；可以优化表达，但不能虚构经历。

返回 JSON 格式：
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

简历：
${resumeText}

目标岗位 JD：
${jobDescription}`;
}
