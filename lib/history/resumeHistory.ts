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

export async function importResumeHistory(records: ResumeHistoryRecord[]) {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      imported: false,
      importedRecords: [] as ResumeHistoryRecord[],
      reason: "Supabase 未配置"
    };
  }

  const cleanRecords = records
    .filter((record) => record.resume_text && record.job_description && record.analysis_result)
    .map((record) => ({
      resume_text: record.resume_text,
      job_description: record.job_description,
      analysis_result: record.analysis_result,
      optimized_resume: record.optimized_resume || record.analysis_result.optimized_resume,
      score: record.score ?? record.analysis_result.score,
      created_at: record.created_at
    }));

  if (!cleanRecords.length) {
    return {
      imported: true,
      importedRecords: [] as ResumeHistoryRecord[],
      skipped: records.length
    };
  }

  const { data: existingRecords, error: existingError } = await supabase
    .from(historyTable)
    .select("resume_text, job_description, score, created_at")
    .limit(1000);

  if (existingError) {
    throw new Error(existingError.message);
  }

  const existingKeys = new Set((existingRecords || []).map((record) => getHistoryFingerprint(record)));
  const recordsToInsert = cleanRecords.filter((record) => !existingKeys.has(getHistoryFingerprint(record)));

  if (!recordsToInsert.length) {
    return {
      imported: true,
      importedRecords: [] as ResumeHistoryRecord[],
      skipped: cleanRecords.length
    };
  }

  const { data, error } = await supabase
    .from(historyTable)
    .insert(recordsToInsert)
    .select("id, resume_text, job_description, analysis_result, optimized_resume, score, created_at");

  if (error) {
    throw new Error(error.message);
  }

  return {
    imported: true,
    importedRecords: (data || []) as ResumeHistoryRecord[],
    skipped: cleanRecords.length - recordsToInsert.length
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

function getHistoryFingerprint(record: Pick<ResumeHistoryRecord, "resume_text" | "job_description" | "score" | "created_at">) {
  return [record.created_at, record.score, record.resume_text.slice(0, 120), record.job_description.slice(0, 120)].join("|");
}
