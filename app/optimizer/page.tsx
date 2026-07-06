"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { createLocalHistoryRecord, saveLocalHistory } from "@/lib/history/localHistory";

const sampleResume = `个人总结
计算机专业本科生，熟悉 React、TypeScript 和基础后端开发，关注 AI 应用方向。

项目经历
AI 简历优化助手
- 使用 Next.js 实现简历输入、岗位 JD 输入和结果展示页面。
- 调用大模型接口分析简历内容，生成优化建议。
- 使用 Tailwind CSS 完成响应式页面开发。

技能
React、Next.js、TypeScript、Tailwind CSS、Node.js、Git`;

const sampleJd = `岗位：AI 应用开发实习生
职责：
1. 参与大模型应用产品的前后端开发。
2. 根据业务场景设计 Prompt，并优化模型输出质量。
3. 封装 AI API，处理结构化数据返回。
4. 与产品协作完成从需求分析到上线验证的闭环。

要求：
熟悉 React / Next.js / TypeScript，有 AI API 调用经验，了解 Prompt Engineering，有完整项目经验优先。`;

const analysisSteps = ["解析简历", "分析岗位 JD", "匹配关键词", "生成优化建议", "生成优化版简历"];
const stepSwitchInterval = 2400;
const completionVisibleTime = 650;

type AiMode = "mock" | "real";

type AnalyzeErrorState = {
  message: string;
  suggestion?: string;
  code?: string;
};

export default function OptimizerPage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isAnalysisComplete, setIsAnalysisComplete] = useState(false);
  const [hasAnalysisAttempt, setHasAnalysisAttempt] = useState(false);
  const [error, setError] = useState<AnalyzeErrorState | null>(null);
  const [aiMode, setAiMode] = useState<AiMode>("mock");

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const stepTimer = window.setInterval(() => {
      setActiveStep((currentStep) => Math.min(currentStep + 1, analysisSteps.length - 1));
    }, stepSwitchInterval);

    const elapsedTimer = window.setInterval(() => {
      setElapsedSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => {
      window.clearInterval(stepTimer);
      window.clearInterval(elapsedTimer);
    };
  }, [isLoading]);

  async function handleAnalyze() {
    setError(null);

    if (!resumeText.trim() || !jobDescription.trim()) {
      setHasAnalysisAttempt(false);
      setError({
        message: "请先填写简历内容和目标岗位 JD。",
        suggestion: "简历和岗位 JD 都不能为空。可以先点击“填入示例内容”体验完整流程。"
      });
      return;
    }

    setIsLoading(true);
    setActiveStep(0);
    setElapsedSeconds(0);
    setIsAnalysisComplete(false);
    setHasAnalysisAttempt(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ resumeText, jobDescription, aiMode })
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          message: data.message || "分析失败，请稍后重试。",
          suggestion: data.suggestion,
          code: data.code
        });
        return;
      }

      sessionStorage.setItem("resume-analysis-result", JSON.stringify(data));

      if (!data.history?.saved) {
        const localRecord = createLocalHistoryRecord({
          resumeText,
          jobDescription,
          analysisResult: data
        });
        saveLocalHistory(localRecord);
        data.history = {
          saved: true,
          id: localRecord.id,
          createdAt: localRecord.created_at,
          storage: "local"
        };
        sessionStorage.setItem("resume-analysis-result", JSON.stringify(data));
      }

      setActiveStep(analysisSteps.length - 1);
      setIsAnalysisComplete(true);
      await new Promise((resolve) => window.setTimeout(resolve, completionVisibleTime));

      router.push("/result");
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "分析失败，请稍后重试。",
        suggestion: "请检查本地服务是否正常运行，或稍后重新提交。"
      });
      setIsAnalysisComplete(false);
    } finally {
      setIsLoading(false);
    }
  }

  function fillSample() {
    setResumeText(sampleResume);
    setJobDescription(sampleJd);
    setError(null);
    setUploadedFileName("");
    setActiveStep(0);
    setElapsedSeconds(0);
    setIsAnalysisComplete(false);
    setHasAnalysisAttempt(false);
  }

  function selectAiMode(nextAiMode: AiMode) {
    setAiMode(nextAiMode);
  }

  async function handleResumeFileUpload(file: File) {
    setError(null);
    setIsExtracting(true);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract-resume", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        setError({
          message: data.message || "文件解析失败。",
          suggestion: data.suggestion
        });
        return;
      }

      setResumeText(data.text);
      setUploadedFileName(data.fileName);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "文件上传失败。",
        suggestion: "请检查本地服务是否正常运行，或直接粘贴简历文本。"
      });
    } finally {
      setIsExtracting(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/" className="text-sm font-semibold text-brand-700">
            返回首页
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-ink md:text-4xl">简历优化</h1>
          <p className="mt-3 max-w-2xl text-muted">
            粘贴你的简历和目标岗位 JD，可以用 Mock 演示流程，也可以切换到真实模型生成诊断结果。
          </p>
        </div>
        <button
          type="button"
          onClick={fillSample}
          disabled={isLoading}
          className="rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-brand-500"
        >
          填入示例内容
        </button>
      </header>

      <section className="mb-5 rounded-2xl border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">分析模式</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Mock 模式适合演示和调试，不消耗额度；真实模型会调用已配置的大模型 API。
            </p>
          </div>
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-slate-50 p-1 md:min-w-80">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => selectAiMode("mock")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                aiMode === "mock" ? "bg-white text-brand-700 shadow-sm" : "text-muted hover:text-ink"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              Mock 演示
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => selectAiMode("real")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                aiMode === "real" ? "bg-white text-brand-700 shadow-sm" : "text-muted hover:text-ink"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              真实模型
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <InputPanel
          title="简历文本"
          description="建议包含个人总结、教育经历、项目经历、实习实践和技能栈。"
          placeholder="在这里粘贴你的简历文本..."
          value={resumeText}
          onChange={setResumeText}
          upload={{
            fileName: uploadedFileName,
            isExtracting,
            disabled: isLoading,
            onFileSelect: handleResumeFileUpload
          }}
        />
        <InputPanel
          title="目标岗位 JD"
          description="粘贴岗位职责、任职要求和加分项，内容越完整，分析越准确。"
          placeholder="在这里粘贴目标岗位描述..."
          value={jobDescription}
          onChange={setJobDescription}
        />
      </section>

      {isLoading || isAnalysisComplete || (error && hasAnalysisAttempt) ? (
        <AnalysisStepper
          activeStep={activeStep}
          elapsedSeconds={elapsedSeconds}
          status={error && hasAnalysisAttempt ? "error" : isAnalysisComplete ? "complete" : "loading"}
          error={error}
          onRetry={handleAnalyze}
        />
      ) : null}

      {error && !hasAnalysisAttempt ? (
        <ErrorNotice message={error.message} suggestion={error.suggestion} code={error.code} onRetry={handleAnalyze} />
      ) : null}

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full rounded-xl bg-brand-600 px-6 py-4 text-base font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto md:min-w-52"
        >
          {isLoading ? getLoadingButtonText(activeStep, isAnalysisComplete) : error ? "重新分析" : "开始分析"}
        </button>
      </div>
    </main>
  );
}

function ErrorNotice({ message, suggestion, code, onRetry }: AnalyzeErrorState & { onRetry: () => void }) {
  return (
    <section className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-bold text-red-800">{message}</h2>
          {suggestion ? <p className="mt-2 text-sm leading-6 text-red-700">{suggestion}</p> : null}
        </div>
        {code ? (
          <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-700">
            {code}
          </span>
        ) : null}
        <button
          type="button"
          onClick={onRetry}
          className="w-fit rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
        >
          重新分析
        </button>
      </div>
    </section>
  );
}

function AnalysisStepper({
  activeStep,
  elapsedSeconds,
  status,
  error,
  onRetry
}: {
  activeStep: number;
  elapsedSeconds: number;
  status: "loading" | "complete" | "error";
  error: AnalyzeErrorState | null;
  onRetry: () => void;
}) {
  const isComplete = status === "complete";
  const isError = status === "error";
  const lastStepIndex = analysisSteps.length - 1;
  const [visibleActiveStep, setVisibleActiveStep] = useState(0);
  const [completedThrough, setCompletedThrough] = useState(-1);
  const [lineProgressStep, setLineProgressStep] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    const schedule = (callback: () => void, delay = 0) => {
      const timer = window.setTimeout(callback, delay);
      timers.push(timer);
    };

    if (status === "loading" && activeStep === 0) {
      schedule(() => {
        setVisibleActiveStep(0);
        setCompletedThrough(-1);
        setLineProgressStep(0);
      });
      return () => timers.forEach((timer) => window.clearTimeout(timer));
    }

    if (status === "complete") {
      schedule(() => {
        setCompletedThrough(lastStepIndex);
        setLineProgressStep(lastStepIndex);
        setVisibleActiveStep(lastStepIndex);
      });
      return () => timers.forEach((timer) => window.clearTimeout(timer));
    }

    if (status === "error") {
      schedule(() => {
        setCompletedThrough(Math.max(activeStep - 1, -1));
        setLineProgressStep(activeStep);
        setVisibleActiveStep(activeStep);
      });
      return () => timers.forEach((timer) => window.clearTimeout(timer));
    }

    if (activeStep <= visibleActiveStep) {
      return () => timers.forEach((timer) => window.clearTimeout(timer));
    }

    schedule(() => {
      setCompletedThrough(activeStep - 1);
      setLineProgressStep(activeStep);
    });
    schedule(() => {
      setVisibleActiveStep(activeStep);
    }, 560);

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [activeStep, lastStepIndex, status, visibleActiveStep]);

  const progressRatio = lastStepIndex > 0 ? (lineProgressStep / lastStepIndex) * 100 : 0;

  return (
    <section className="mt-6 rounded-2xl border border-brand-100 bg-white p-5 shadow-soft md:p-7">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">{isComplete ? "分析完成" : isError ? "分析失败" : "AI 正在分析你的简历"}</h2>
          <p className="mt-1 text-sm text-muted">系统会按简历内容、岗位要求和关键词匹配逐步生成结果。</p>
        </div>
        <div
          className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
            isError ? "bg-red-50 text-red-700" : isComplete ? "bg-emerald-50 text-emerald-700" : "bg-brand-50 text-brand-700"
          }`}
        >
          {isError ? "处理失败" : isComplete ? "正在进入结果页" : "正在处理中"}
        </div>
      </div>

      {elapsedSeconds >= 30 && !isComplete && !isError ? (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-800">
          AI 正在深度分析中，请稍候。
        </p>
      ) : null}

      <div className="ai-stepper-shell mt-8" style={{ "--step-progress": `${progressRatio}%` } as CSSProperties}>
        <div className="ai-stepper-line" aria-hidden="true">
          <div className="ai-stepper-progress-line" />
        </div>

        <ol className="ai-stepper-list">
          {analysisSteps.map((step, index) => {
            const isDone = index <= completedThrough;
            const isCurrent = status === "loading" && index === visibleActiveStep && index > completedThrough;
            const isFailed = isError && index === visibleActiveStep;

            return (
              <li key={step} className="ai-stepper-item">
                <div
                  className={`ai-stepper-node ${
                    isDone ? "is-done" : isFailed ? "is-error" : isCurrent ? "is-current" : "is-pending"
                  }`}
                >
                  {isDone ? (
                    <span className="ai-stepper-check">✓</span>
                  ) : isFailed ? (
                    <span className="ai-stepper-error-icon">!</span>
                  ) : isCurrent ? (
                    <span className="ai-stepper-bolt">ϟ</span>
                  ) : null}
                </div>

                <div className="ai-stepper-copy">
                  <div className="ai-stepper-title">{step}</div>
                  <div
                    className={`ai-stepper-status ${
                      isDone ? "is-done" : isFailed ? "is-error" : isCurrent ? "is-current" : "is-pending"
                    }`}
                  >
                    {isDone ? "已完成" : isFailed ? "处理失败" : isCurrent ? "正在处理中" : "等待中"}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {isError && error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-sm font-bold text-red-800">{error.message}</h3>
              {error.suggestion ? <p className="mt-2 text-sm leading-6 text-red-700">{error.suggestion}</p> : null}
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="w-fit rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
            >
              重新分析
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function getLoadingButtonText(activeStep: number, isComplete: boolean) {
  if (isComplete) {
    return "分析完成，正在跳转...";
  }

  if (activeStep === analysisSteps.length - 1) {
    return "正在生成优化版简历";
  }

  return `正在${analysisSteps[activeStep]}`;
}

function InputPanel({
  title,
  description,
  placeholder,
  value,
  onChange,
  upload
}: {
  title: string;
  description: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  upload?: {
    fileName: string;
    isExtracting: boolean;
    disabled: boolean;
    onFileSelect: (file: File) => void;
  };
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <label className="block">
        <span className="text-lg font-bold text-ink">{title}</span>
        <span className="mt-2 block text-sm leading-6 text-muted">{description}</span>
      </label>

      {upload ? <ResumeUpload upload={upload} /> : null}

      <textarea
        className="mt-4 h-[28rem] w-full resize-none rounded-xl border border-line bg-slate-50 p-4 leading-7 text-ink outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function ResumeUpload({
  upload
}: {
  upload: {
    fileName: string;
    isExtracting: boolean;
    disabled: boolean;
    onFileSelect: (file: File) => void;
  };
}) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-brand-100 bg-brand-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-ink">上传简历文件</div>
          <p className="mt-1 text-sm leading-6 text-muted">支持 PDF 和 Word .docx，系统会自动解析文本并填入下方输入框。</p>
          {upload.fileName ? (
            <p className="mt-2 text-sm font-semibold text-brand-700">
              {upload.isExtracting ? "正在解析：" : "已读取："}
              {upload.fileName}
            </p>
          ) : null}
        </div>

        <label
          className={`inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
            upload.disabled || upload.isExtracting
              ? "cursor-not-allowed bg-slate-200 text-muted"
              : "bg-brand-600 text-white hover:bg-brand-700"
          }`}
        >
          {upload.isExtracting ? "解析中..." : "选择文件"}
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            disabled={upload.disabled || upload.isExtracting}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";

              if (file) {
                upload.onFileSelect(file);
              }
            }}
          />
        </label>
      </div>
    </div>
  );
}
