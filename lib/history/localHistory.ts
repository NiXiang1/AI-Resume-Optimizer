import type { ResumeHistoryRecord } from "@/lib/history/types";
import type { ResumeAnalysis } from "@/lib/types";

const localHistoryKey = "resume-analysis-local-history";
const maxLocalHistory = 20;

export function createLocalHistoryRecord({
  resumeText,
  jobDescription,
  analysisResult
}: {
  resumeText: string;
  jobDescription: string;
  analysisResult: ResumeAnalysis;
}): ResumeHistoryRecord {
  return {
    id: `local-${crypto.randomUUID()}`,
    resume_text: resumeText,
    job_description: jobDescription,
    analysis_result: analysisResult,
    optimized_resume: analysisResult.optimized_resume,
    score: analysisResult.score,
    created_at: new Date().toISOString(),
    storage: "local"
  };
}

export function saveLocalHistory(record: ResumeHistoryRecord) {
  const records = getLocalHistory();
  const nextRecords = [record, ...records.filter((item) => item.id !== record.id)].slice(0, maxLocalHistory);
  localStorage.setItem(localHistoryKey, JSON.stringify(nextRecords));
}

export function getLocalHistory(): ResumeHistoryRecord[] {
  try {
    const raw = localStorage.getItem(localHistoryKey);
    return raw ? (JSON.parse(raw) as ResumeHistoryRecord[]) : [];
  } catch {
    return [];
  }
}

export function clearLocalHistory() {
  localStorage.removeItem(localHistoryKey);
}

export function deleteLocalHistory(id: string) {
  const records = getLocalHistory().filter((record) => record.id !== id);
  localStorage.setItem(localHistoryKey, JSON.stringify(records));
}
