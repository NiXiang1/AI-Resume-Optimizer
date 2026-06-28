import Link from "next/link";

const highlights = [
  "简历与岗位 JD 语义匹配分析",
  "结构化输出评分、问题和建议",
  "按目标岗位生成定制化简历文本"
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8">
      <nav className="flex items-center justify-between">
        <div className="text-lg font-bold text-ink">AI Resume Optimizer</div>
        <div className="flex items-center gap-3">
          <Link
            href="/history"
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-brand-500 hover:text-brand-700"
          >
            历史记录
          </Link>
          <Link
            href="/optimizer"
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-brand-500 hover:text-brand-700"
          >
            开始优化
          </Link>
        </div>
      </nav>

      <section className="grid flex-1 items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-5 inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
            面向秋招与实习投递的 AI 简历优化工具
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-ink md:text-6xl">
            让你的简历更贴近目标岗位，而不是只写得更好看。
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            粘贴简历和岗位 JD，系统会分析匹配度、缺失关键词、项目表达问题，并生成一版更适合投递该岗位的优化简历文本。
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/optimizer"
              className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-soft transition hover:bg-brand-700"
            >
              开始优化简历
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-6 py-3 text-base font-semibold text-ink transition hover:border-brand-500"
            >
              查看 MVP 功能
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
            <div>
              <div className="text-sm text-muted">岗位匹配度</div>
              <div className="mt-1 text-4xl font-bold text-brand-600">82</div>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              示例报告
            </span>
          </div>
          <div className="space-y-4">
            {[
              ["优势", "项目经历和技术栈较完整，具备 AI 应用落地意识。"],
              ["问题", "部分项目描述偏过程，缺少结果量化和岗位关键词。"],
              ["建议", "强化 Prompt Engineering、API 封装、产品闭环等表达。"]
            ].map(([title, content]) => (
              <div key={title} className="rounded-xl bg-slate-50 p-4">
                <div className="font-semibold text-ink">{title}</div>
                <p className="mt-2 text-sm leading-6 text-muted">{content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="grid gap-4 pb-12 md:grid-cols-3">
        {highlights.map((item) => (
          <div key={item} className="rounded-xl border border-line bg-white p-5 shadow-sm">
            <div className="text-base font-semibold text-ink">{item}</div>
          </div>
        ))}
      </section>
    </main>
  );
}
