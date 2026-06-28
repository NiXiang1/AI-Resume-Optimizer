import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ResumeHistoryRecord, SaveResumeHistoryInput } from "@/lib/history/types";

const historyTable = "resume_analysis_history";

export async function saveResumeHistory({
  resumeText,
  jobDescription,
  analysisResult
}: SaveResumeHistoryInput) {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      saved: false,
      reason: "Supabase 未配置"
    };
  }

  const { data, error } = await supabase
    .from(historyTable)
    .insert({
      resume_text: resumeText,
      job_description: jobDescription,
      analysis_result: analysisResult,
      optimized_resume: analysisResult.optimized_resume,
      score: analysisResult.score
    })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("Failed to save resume history:", error.message);
    return {
      saved: false,
      reason: error.message
    };
  }

  return {
    saved: true,
    id: data.id as string,
    createdAt: data.created_at as string
  };
}

export async function listResumeHistory() {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      configured: false,
      records: [] as ResumeHistoryRecord[]
    };
  }

  const { data, error } = await supabase
    .from(historyTable)
    .select("id, resume_text, job_description, analysis_result, optimized_resume, score, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(error.message);
  }

  return {
    configured: isSupabaseConfigured(),
    records: (data || []) as ResumeHistoryRecord[]
  };
}

export async function deleteResumeHistory(id: string) {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      deleted: false,
      reason: "Supabase 未配置"
    };
  }

  const { error } = await supabase.from(historyTable).delete().eq("id", id);

  if (error) {
    console.error("Failed to delete resume history:", error.message);
    return {
      deleted: false,
      reason: error.message
    };
  }

  return {
    deleted: true
  };
}
