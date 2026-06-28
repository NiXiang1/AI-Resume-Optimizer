export type AnalyzeErrorCode =
  | "VALIDATION_ERROR"
  | "MISSING_API_KEY"
  | "AUTH_ERROR"
  | "BALANCE_ERROR"
  | "RATE_LIMIT"
  | "NETWORK_ERROR"
  | "AI_RESPONSE_FORMAT_ERROR"
  | "AI_SERVICE_ERROR"
  | "UNKNOWN_ERROR";

export class AnalyzeError extends Error {
  code: AnalyzeErrorCode;
  suggestion: string;
  status: number;

  constructor({
    code,
    message,
    suggestion,
    status = 400
  }: {
    code: AnalyzeErrorCode;
    message: string;
    suggestion: string;
    status?: number;
  }) {
    super(message);
    this.name = "AnalyzeError";
    this.code = code;
    this.suggestion = suggestion;
    this.status = status;
  }
}

export function toAnalyzeError(error: unknown): AnalyzeError {
  if (error instanceof AnalyzeError) {
    return error;
  }

  if (error instanceof TypeError) {
    return new AnalyzeError({
      code: "NETWORK_ERROR",
      message: "网络连接失败，暂时无法访问 AI 服务。",
      suggestion: "请检查网络连接，确认 DeepSeek 服务地址可访问，然后稍后重试。",
      status: 502
    });
  }

  return new AnalyzeError({
    code: "UNKNOWN_ERROR",
    message: error instanceof Error ? error.message : "分析失败，请稍后重试。",
    suggestion: "请稍后重新提交。如果问题持续出现，可以先切回 mock 模式排查页面流程。",
    status: 500
  });
}
