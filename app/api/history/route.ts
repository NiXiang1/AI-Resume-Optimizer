import { NextResponse } from "next/server";
import { deleteResumeHistory, listResumeHistory } from "@/lib/history/resumeHistory";

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
