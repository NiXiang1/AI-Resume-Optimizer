import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

const supportedTypes = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

export type ExtractedResumeText = {
  text: string;
  fileName: string;
  fileType: "pdf" | "docx";
};

export async function extractResumeTextFromFile(file: File): Promise<ExtractedResumeText> {
  const fileName = file.name || "resume";
  const fileType = getFileType(file);

  if (!fileType) {
    throw new Error("暂时只支持 PDF 和 Word .docx 文件。");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const text = fileType === "pdf" ? await extractPdfText(buffer) : await extractDocxText(buffer);
  const normalizedText = normalizeExtractedText(text);

  if (!normalizedText) {
    throw new Error("没有从文件中解析到可用文本。请确认简历不是纯图片扫描件，或改用粘贴文本。");
  }

  return {
    text: normalizedText,
    fileName,
    fileType
  };
}

function getFileType(file: File): ExtractedResumeText["fileType"] | null {
  const fileName = file.name.toLowerCase();

  if (file.type === supportedTypes.pdf || fileName.endsWith(".pdf")) {
    return "pdf";
  }

  if (file.type === supportedTypes.docx || fileName.endsWith(".docx")) {
    return "docx";
  }

  return null;
}

async function extractPdfText(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText({
      pageJoiner: "\n\n",
      itemJoiner: " "
    });

    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function normalizeExtractedText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
