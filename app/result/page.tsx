"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ResumeAnalysis } from "@/lib/types";
import { convertOptimizedResumeToResumeData } from "@/src/lib/resume-json/convertOptimizedResume";
import { getSavedResumeDraft, setSessionResumeDraft } from "@/src/lib/resume-storage/resumeDraft";

const emptyKeywords: ResumeAnalysis["jd_keywords"] = {
  technical: [],
  experience: [],
  soft_skills: [],
  bonus: []
};

export default function ResultPage() {
  const [result] = useState<ResumeAnalysis | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = sessionStorage.getItem("resume-analysis-result");
    return raw ? (JSON.parse(raw) as ResumeAnalysis) : null;
  });
  const [copied, setCopied] = useState(false);

  const suggestionGroups = useMemo(() => {
    if (!result) {
      return [];
    }

    return [
      ["教育经历优化建议", result.suggestions.education],
      ["项目经历优化建议", result.suggestions.projects],
      ["技能栈优化建议", result.suggestions.skills],
      ["实习/实践经历优化建议", result.suggestions.experience],
      ["个人总结优化建议", result.suggestions.summary]
    ] as const;
  }, [result]);

  async function copyOptimizedResume() {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result.optimized_resume);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function generateBeautifulResume() {
    if (!result) {
      return;
    }

    const draftId = getResultDraftId(result);
    const resumeJson = getSavedResumeDraft(draftId) || convertOptimizedResumeToResumeData(result.optimized_resume);
    setSessionResumeDraft(resumeJson, draftId);
    window.location.href = "/resume-generator";
  }

  if (!result) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold text-ink">还没有分析结果</h1>
        <p className="mt-4 text-muted">请先填写简历和岗位 JD，完成一次分析后再查看结果。</p>
        <Link
          href="/optimizer"
          className="mt-8 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-soft transition hover:bg-brand-700"
        >
          去开始分析
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/optimizer" className="text-sm font-semibold text-brand-700">
            重新分析
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-ink md:text-4xl">分析结果</h1>
          <p className="mt-3 max-w-3xl text-muted">{result.summary}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={generateBeautifulResume}
            className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
          >
            生成精美简历
          </button>
          <button
            type="button"
            onClick={copyOptimizedResume}
            className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-brand-500"
          >
            {copied ? "已复制" : "一键复制优化版简历"}
          </button>
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-5">
          <ScoreCard result={result} />
          <KeywordCard keywords={result.jd_keywords || emptyKeywords} />
          <ListCard title="优势" items={result.strengths} />
          <ListCard title="问题诊断" items={result.weaknesses} />
          <ListCard title="缺少的关键词" items={result.missing_keywords} chip />
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <h2 className="text-xl font-bold text-ink">优化建议</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {suggestionGroups.map(([title, items]) => (
                <div key={title} className="rounded-xl bg-slate-50 p-4">
                  <h3 className="font-semibold text-ink">{title}</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
                    {items.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <RewriteComparison items={result.rewrite_comparison || []} />

          <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-ink">优化后的简历文本</h2>
              <button
                type="button"
                onClick={copyOptimizedResume}
                className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-ink transition hover:border-brand-500"
              >
                {copied ? "已复制" : "复制"}
              </button>
            </div>
            <pre className="max-h-[42rem] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-950 p-5 text-sm leading-7 text-slate-50">
              {result.optimized_resume}
            </pre>
          </section>
        </div>
      </section>
    </main>
  );
}

function getResultDraftId(result: ResumeAnalysis) {
  const history = (result as ResumeAnalysis & { history?: { id?: string } }).history;
  return history?.id || "";
}

function KeywordCard({ keywords }: { keywords: ResumeAnalysis["jd_keywords"] }) {
  const groups = [
    ["技术关键词", keywords.technical],
    ["经验关键词", keywords.experience],
    ["软技能关键词", keywords.soft_skills],
    ["加分项", keywords.bonus]
  ] as const;

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div>
        <h2 className="text-xl font-bold text-ink">岗位关键词提取</h2>
        <p className="mt-2 text-sm leading-6 text-muted">从 JD 中拆出招聘方最关注的能力要求，用来判断简历是否需要补强。</p>
      </div>

      <div className="mt-4 space-y-4">
        {groups.map(([title, items]) => (
          <div key={title}>
            <h3 className="text-sm font-semibold text-ink">{title}</h3>
            {items.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {items.map((item) => (
                  <span key={item} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">暂无明确关键词</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function RewriteComparison({ items }: { items: ResumeAnalysis["rewrite_comparison"] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">简历改写对比</h2>
          <p className="mt-2 text-sm leading-6 text-muted">对比原始表达和优化表达，展示 AI 如何把经历改得更贴近岗位。</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-ink">原文 vs 优化后</span>
      </div>

      <div className="mt-5 space-y-4">
        {items.map((item, index) => (
          <article key={`${item.section}-${index}`} className="rounded-xl border border-line bg-slate-50 p-4">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h3 className="font-semibold text-ink">{item.section}</h3>
              <span className="text-sm font-semibold text-brand-700">{item.improvement}</span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ComparisonBlock title="原始表达" content={item.original} tone="muted" />
              <ComparisonBlock title="优化后表达" content={item.optimized} tone="brand" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ComparisonBlock({
  title,
  content,
  tone
}: {
  title: string;
  content: string;
  tone: "muted" | "brand";
}) {
  return (
    <div className={`rounded-xl border bg-white p-4 ${tone === "brand" ? "border-brand-100" : "border-line"}`}>
      <div className={`text-sm font-semibold ${tone === "brand" ? "text-brand-700" : "text-muted"}`}>{title}</div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{content}</p>
    </div>
  );
}

function ScoreCard({ result }: { result: ResumeAnalysis }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">匹配度评分</h2>
          <p className="mt-2 text-sm text-muted">{result.jd_match.level}</p>
        </div>
        <div className="text-5xl font-bold text-brand-600">{result.score}</div>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-600" style={{ width: `${result.score}%` }} />
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">{result.jd_match.gap_description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {result.jd_match.matched_keywords.map((keyword) => (
          <span key={keyword} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
            {keyword}
          </span>
        ))}
      </div>
    </section>
  );
}

function ListCard({
  title,
  items,
  chip = false
}: {
  title: string;
  items: string[];
  chip?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      {chip ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-ink">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
          {items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
