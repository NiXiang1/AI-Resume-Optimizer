import { NextResponse } from "next/server";
import { listResumeHistory } from "@/lib/history/resumeHistory";

export async function GET() {
  try {
    const result = await listResumeHistory();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        records: [],
        message: error instanceof Error ? error.message : "历史记录读取失败。"
      },
      { status: 500 }
    );
  }
}
