import { NextResponse } from "next/server";
import { extractResumeTextFromFile } from "@/lib/resume/extractResumeText";

export const runtime = "nodejs";

const maxFileSize = 8 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          message: "没有收到简历文件。",
          suggestion: "请上传 PDF 或 Word .docx 格式的简历文件。"
        },
        { status: 400 }
      );
    }

    if (file.size > maxFileSize) {
      return NextResponse.json(
        {
          message: "文件过大，暂时无法解析。",
          suggestion: "请上传 8MB 以内的 PDF 或 Word .docx 文件，或直接粘贴简历文本。"
        },
        { status: 413 }
      );
    }

    const result = await extractResumeTextFromFile(file);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "文件解析失败。",
        suggestion: "可以换一个 PDF / Word .docx 文件，或直接把简历文本粘贴到输入框。"
      },
      { status: 400 }
    );
  }
}
