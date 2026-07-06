import { NextResponse } from "next/server";
import { deleteResumeHistory, listResumeHistory } from "@/lib/history/resumeHistory";

export async function GET() {
  try {
    const result = await listResumeHistory();
    return NextResponse.json(result);
  } catch (error) {
    const message = normalizeHistoryError(error);

    return NextResponse.json({
      configured: false,
      cloudUnavailable: true,
      records: [],
      message: `云端历史记录暂时不可用：${message}`
    });
  }
}

function normalizeHistoryError(error: unknown) {
  const message = error instanceof Error ? error.message : "历史记录读取失败。";

  if (message.toLowerCase().includes("fetch failed")) {
    return "Supabase 连接失败，请检查 SUPABASE_URL 是否正确，或确认 Supabase 项目是否处于可访问状态。";
  }

  return message;
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "缺少历史记录 ID。" }, { status: 400 });
    }

    const result = await deleteResumeHistory(id);

    if (!result.deleted) {
      return NextResponse.json({ message: result.reason || "历史记录删除失败。" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "历史记录删除失败。"
      },
      { status: 500 }
    );
  }
}
