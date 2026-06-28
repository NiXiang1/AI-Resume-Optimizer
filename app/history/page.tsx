"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearLocalHistory, deleteLocalHistory, getLocalHistory } from "@/lib/history/localHistory";
import type { ResumeHistoryRecord } from "@/lib/history/types";

type HistoryResponse = {
  configured: boolean;
  records: ResumeHistoryRecord[];
  message?: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/history");
        const data = (await response.json()) as HistoryResponse;

        if (!response.ok) {
          throw new Error(data.message || "历史记录读取失败。");
        }

        const localRecords = getLocalHistory();
        const records = data.configured ? data.records : localRecords;

        setHistory({
          ...data,
          records
        });
        setSelectedId(records[0]?.id || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "历史记录读取失败。");
      }
    }

    loadHistory();
  }, []);

  const selectedRecord = history?.records.find((record) => record.id === selectedId) || null;

  function openResult(record: ResumeHistoryRecord) {
    sessionStorage.setItem("resume-analysis-result", JSON.stringify(record.analysis_result));
    window.location.href = "/result";
  }

  function handleClearLocalHistory() {
    clearLocalHistory();
    setDeleteError("");
    setHistory((currentHistory) => (currentHistory ? { ...currentHistory, records: [] } : currentHistory));
    setSelectedId(null);
  }

  async function handleDeleteRecord(record: ResumeHistoryRecord) {
    const confirmed = window.confirm("确定删除这条历史记录吗？删除后无法恢复。");

    if (!confirmed || deletingId) {
      return;
    }

    setDeletingId(record.id);
    setDeleteError("");

    try {
      if (history?.configured) {
        const response = await fetch(`/api/history?id=${encodeURIComponent(record.id)}`, {
          method: "DELETE"
        });
        const data = (await response.json()) as { message?: string };

        if (!response.ok) {
          throw new Error(data.message || "历史记录删除失败。");
        }
      } else {
        deleteLocalHistory(record.id);
      }

      const currentRecords = history?.records || [];
      const currentIndex = currentRecords.findIndex((item) => item.id === record.id);
      const nextRecords = currentRecords.filter((item) => item.id !== record.id);
      const nextSelectedRecord = nextRecords[currentIndex] || nextRecords[currentIndex - 1] || nextRecords[0] || null;

      setHistory((currentHistory) => (currentHistory ? { ...currentHistory, records: nextRecords } : currentHistory));
      setSelectedId(nextSelectedRecord?.id || null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "历史记录删除失败。");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/" className="text-sm font-semibold text-brand-700">
            返回首页
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-ink md:text-4xl">历史记录</h1>
          <p className="mt-3 max-w-3xl text-muted">查看保存过的简历分析结果，包含原简历、岗位 JD、分析结果和优化版简历。</p>
        </div>
        <Link
          href="/optimizer"
          className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
        >
          新建分析
        </Link>
      </header>

      {!history && !error ? (
        <section className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <div className="text-lg font-bold text-ink">正在读取历史记录...</div>
          <p className="mt-2 text-sm text-muted">如果你还没有配置 Supabase，这里会显示配置提示。</p>
        </section>
      ) : null}

      {error ? <Notice title="历史记录读取失败" description={error} tone="error" /> : null}

      {deleteError ? <Notice title="删除失败" description={deleteError} tone="error" /> : null}

      {history && !history.configured ? (
        <LocalModeNotice />
      ) : null}

      {history && history.records.length === 0 ? (
        <Notice
          title="暂无历史记录"
          description={
            history.configured
              ? "完成一次简历分析后，系统会把原简历、JD、分析结果和优化版简历保存到这里。"
              : "完成一次新的简历分析后，系统会先把结果保存到本地历史记录。"
          }
          tone="info"
        />
      ) : null}

      {history && history.records.length > 0 ? (
        <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-3">
            {!history.configured ? (
              <button
                type="button"
                onClick={handleClearLocalHistory}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-red-200 hover:text-red-700"
              >
                清空本地历史记录
              </button>
            ) : null}

            {history.records.map((record) => (
              <button
                key={record.id}
                type="button"
                onClick={() => setSelectedId(record.id)}
                className={`w-full rounded-2xl border bg-white p-5 text-left transition ${
                  selectedId === record.id ? "border-brand-500 shadow-soft" : "border-line hover:border-brand-100"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-bold text-ink">匹配度 {record.score}</div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{record.analysis_result.summary}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    {record.storage === "local" ? "本地 " : ""}
                    {formatDate(record.created_at)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {selectedRecord ? (
            <HistoryDetail
              record={selectedRecord}
              deleting={deletingId === selectedRecord.id}
              onDelete={handleDeleteRecord}
              onOpenResult={openResult}
            />
          ) : null}
        </section>
      ) : null}
    </main>
  );
}

function LocalModeNotice() {
  return (
    <section className="mb-5 rounded-2xl border border-brand-100 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">当前使用本地历史记录</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            还没有配置 Supabase，所以分析结果会先保存在这个浏览器里。配置 Supabase 后，新的分析结果会自动保存到云端数据库。
          </p>
        </div>
        <Link
          href="/optimizer"
          className="w-fit rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          去分析一份简历
        </Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          "在 Supabase 执行 supabase/schema.sql",
          "在 .env.local 添加 SUPABASE_URL",
          "添加 SUPABASE_SECRET_KEY 后重启项目"
        ].map((item) => (
          <div key={item} className="rounded-xl bg-slate-50 p-4 text-sm font-semibold text-ink">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function Notice({ title, description, tone }: { title: string; description: string; tone: "info" | "error" }) {
  return (
    <section
      className={`rounded-2xl border p-6 ${
        tone === "error" ? "border-red-200 bg-red-50" : "border-brand-100 bg-white"
      } shadow-soft`}
    >
      <h2 className={`text-lg font-bold ${tone === "error" ? "text-red-800" : "text-ink"}`}>{title}</h2>
      <p className={`mt-2 text-sm leading-6 ${tone === "error" ? "text-red-700" : "text-muted"}`}>{description}</p>
    </section>
  );
}

function HistoryDetail({
  deleting,
  record,
  onDelete,
  onOpenResult
}: {
  deleting: boolean;
  record: ResumeHistoryRecord;
  onDelete: (record: ResumeHistoryRecord) => void;
  onOpenResult: (record: ResumeHistoryRecord) => void;
}) {
  return (
    <article className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink">分析详情</h2>
          <p className="mt-2 text-sm text-muted">创建时间：{formatDateTime(record.created_at)}</p>
          {record.storage === "local" ? (
            <p className="mt-2 text-sm font-semibold text-brand-700">保存位置：浏览器本地</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onOpenResult(record)}
            className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            打开结果页
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => onDelete(record)}
            className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "正在删除..." : "删除记录"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Metric label="匹配度" value={`${record.score}`} />
        <Metric label="缺失关键词" value={`${record.analysis_result.missing_keywords.length}`} />
        <Metric label="改写对比" value={`${record.analysis_result.rewrite_comparison.length}`} />
      </div>

      <div className="mt-5 space-y-4">
        <TextBlock title="原简历" content={record.resume_text} />
        <TextBlock title="岗位 JD" content={record.job_description} />
        <TextBlock title="优化版简历" content={record.optimized_resume} dark />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold text-brand-600">{value}</div>
    </div>
  );
}

function TextBlock({ title, content, dark = false }: { title: string; content: string; dark?: boolean }) {
  return (
    <section>
      <h3 className="font-semibold text-ink">{title}</h3>
      <pre
        className={`mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl p-4 text-sm leading-7 ${
          dark ? "bg-slate-950 text-slate-50" : "bg-slate-50 text-ink"
        }`}
      >
        {content}
      </pre>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
