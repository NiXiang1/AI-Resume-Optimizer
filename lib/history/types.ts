import type { ResumeAnalysis } from "@/lib/types";

export type ResumeHistoryRecord = {
  id: string;
  resume_text: string;
  job_description: string;
  analysis_result: ResumeAnalysis;
  optimized_resume: string;
  score: number;
  created_at: string;
  storage?: "supabase" | "local";
};

export type SaveResumeHistoryInput = {
  resumeText: string;
  jobDescription: string;
  analysisResult: ResumeAnalysis;
};
