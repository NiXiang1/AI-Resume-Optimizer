import type { Metadata } from "next";
import "./globals.css";
import "@/src/components/resume-templates/Template1.css";
import "@/src/components/resume-templates/Template2.css";
import "@/src/components/resume-templates/Template3.css";
import "@/src/components/resume-templates/A4PreviewFrame.css";
import "./resume-generator/resume-generator.css";

export const metadata: Metadata = {
  title: "AI Resume Optimizer",
  description: "AI 简历优化助手，分析简历与岗位 JD 的匹配度并生成优化建议。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
