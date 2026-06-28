import { NextResponse } from "next/server";
import { analyzeResume } from "@/lib/ai/analyzeResume";
import { toAnalyzeError } from "@/lib/ai/errors";
import { saveResumeHistory } from "@/lib/history/resumeHistory";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await analyzeResume({
      resumeText: body.resumeText || "",
      jobDescription: body.jobDescription || "",
      aiMode: body.aiMode
    });
    const history = await saveResumeHistory({
      resumeText: body.resumeText || "",
      jobDescription: body.jobDescription || "",
      analysisResult: result
    });

    return NextResponse.json({
      ...result,
      history
    });
  } catch (error) {
    const analyzeError = toAnalyzeError(error);

    return NextResponse.json(
      {
        code: analyzeError.code,
        message: analyzeError.message,
        suggestion: analyzeError.suggestion
      },
      { status: analyzeError.status }
    );
  }
}
