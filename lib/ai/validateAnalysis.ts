import type { ResumeAnalysis } from "@/lib/types";
import { AnalyzeError } from "@/lib/ai/errors";

const requiredSuggestionKeys = ["education", "projects", "skills", "experience", "summary"] as const;

export function validateResumeAnalysis(value: unknown): ResumeAnalysis {
  if (!isRecord(value)) {
    throwFormatError("AI 返回的结果不是 JSON 对象。");
  }

  const missingFields: string[] = [];

  if (!isValidScore(value.score)) missingFields.push("score");
  if (!isNonEmptyString(value.summary)) missingFields.push("summary");
  if (!isStringArray(value.strengths)) missingFields.push("strengths");
  if (!isStringArray(value.weaknesses)) missingFields.push("weaknesses");
  if (!isStringArray(value.missing_keywords)) missingFields.push("missing_keywords");
  if (!isNonEmptyString(value.optimized_resume)) missingFields.push("optimized_resume");

  if (!isRecord(value.jd_keywords)) {
    missingFields.push("jd_keywords");
  } else {
    if (!isStringArray(value.jd_keywords.technical)) missingFields.push("jd_keywords.technical");
    if (!isStringArray(value.jd_keywords.experience)) missingFields.push("jd_keywords.experience");
    if (!isStringArray(value.jd_keywords.soft_skills)) missingFields.push("jd_keywords.soft_skills");
    if (!isStringArray(value.jd_keywords.bonus)) missingFields.push("jd_keywords.bonus");
  }

  if (!isRecord(value.jd_match)) {
    missingFields.push("jd_match");
  } else {
    if (!isNonEmptyString(value.jd_match.level)) missingFields.push("jd_match.level");
    if (!isStringArray(value.jd_match.matched_keywords)) missingFields.push("jd_match.matched_keywords");
    if (!isNonEmptyString(value.jd_match.gap_description)) missingFields.push("jd_match.gap_description");
  }

  if (!isRecord(value.suggestions)) {
    missingFields.push("suggestions");
  } else {
    for (const key of requiredSuggestionKeys) {
      if (!isStringArray(value.suggestions[key])) {
        missingFields.push(`suggestions.${key}`);
      }
    }
  }

  if (!Array.isArray(value.rewrite_comparison)) {
    missingFields.push("rewrite_comparison");
  } else {
    value.rewrite_comparison.forEach((item, index) => {
      if (!isRecord(item)) {
        missingFields.push(`rewrite_comparison.${index}`);
        return;
      }

      if (!isNonEmptyString(item.section)) missingFields.push(`rewrite_comparison.${index}.section`);
      if (!isNonEmptyString(item.original)) missingFields.push(`rewrite_comparison.${index}.original`);
      if (!isNonEmptyString(item.optimized)) missingFields.push(`rewrite_comparison.${index}.optimized`);
      if (!isNonEmptyString(item.improvement)) missingFields.push(`rewrite_comparison.${index}.improvement`);
    });
  }

  if (missingFields.length > 0) {
    throwFormatError(`AI 返回结果缺少或错误的字段：${missingFields.join("、")}。`);
  }

  return value as ResumeAnalysis;
}

function throwFormatError(detail: string): never {
  throw new AnalyzeError({
    code: "AI_RESPONSE_FORMAT_ERROR",
    message: "AI 返回结果格式不完整，暂时无法生成报告。",
    suggestion: `${detail} 请重新分析一次；如果仍然失败，可以降低输入长度或调整 Prompt。`,
    status: 502
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidScore(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100;
}

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
