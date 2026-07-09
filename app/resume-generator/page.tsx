"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AvatarUploader from "@/src/components/AvatarUploader";
import A4PreviewFrame from "@/src/components/resume-templates/A4PreviewFrame";
import Template1 from "@/src/components/resume-templates/Template1";
import Template2 from "@/src/components/resume-templates/Template2";
import Template3 from "@/src/components/resume-templates/Template3";
import { sampleResume } from "@/src/data/sampleResume";
import { exportResumeHtmlFromElement } from "@/src/lib/resume-export/exportHtml";
import { exportResumePdfFromElement } from "@/src/lib/resume-export/exportPdf";
import { getActiveResumeDraftId, getResumeDraftForCurrentSession, saveResumeDraft } from "@/src/lib/resume-storage/resumeDraft";
import type {
  AwardItem,
  CampusExperienceItem,
  CertificateItem,
  CustomSection,
  EducationItem,
  ProjectItem,
  ResumeData,
  WorkExperienceItem
} from "@/src/types/resume";

type Mode = "preview" | "edit";
type TemplateId = "template1" | "template2" | "template3";
type EditableSectionKey =
  | "education"
  | "skills"
  | "projects"
  | "work"
  | "campus"
  | "awards"
  | "certificates"
  | "advantages"
  | "volunteer"
  | "selfEvaluation";

const customSectionPresets = ["实践经历", "比赛经历", "科研经历", "社团经历", "培训经历", "语言能力", "作品集"];

const editableSections: { key: EditableSectionKey; title: string }[] = [
  { key: "education", title: "教育背景" },
  { key: "skills", title: "专业技能" },
  { key: "projects", title: "项目经历" },
  { key: "work", title: "实习经历 / 工作经历" },
  { key: "campus", title: "校园经历" },
  { key: "awards", title: "荣誉奖项" },
  { key: "certificates", title: "证书" },
  { key: "advantages", title: "个人优势" },
  { key: "volunteer", title: "志愿服务" },
  { key: "selfEvaluation", title: "自我评价" }
];

const templateOptions: { id: TemplateId; name: string; description: string }[] = [
  {
    id: "template1",
    name: "左侧深色信息栏模板",
    description: "蓝白配色、A4 双栏布局，适合大学生求职与项目经历展示。"
  },
  {
    id: "template2",
    name: "浅蓝单栏自适应模板",
    description: "单栏布局、模块自动隐藏与扩展，适合 AI 动态生成的 resume.json。"
  },
  {
    id: "template3",
    name: "深色左栏金色标题模板",
    description: "深灰侧栏、金色标题、右侧经历列表，适合成熟稳重的求职风格。"
  }
];

export default function ResumeGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("template2");
  const [mode, setMode] = useState<Mode>("preview");
  const [saved, setSaved] = useState(false);
  const [exportError, setExportError] = useState("");
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [draftId, setDraftId] = useState("");
  const [resumeData, setResumeData] = useState<ResumeData>(sampleResume);

  useEffect(() => {
    queueMicrotask(() => {
      setDraftId(getActiveResumeDraftId());
      setResumeData(getResumeDraftForCurrentSession() || sampleResume);
      setDraftReady(true);
    });
  }, []);

  useEffect(() => {
    if (!draftReady) {
      return;
    }

    saveResumeDraft(resumeData, draftId);
  }, [draftId, draftReady, resumeData]);

  function saveResumeJson() {
    saveResumeDraft(resumeData, draftId);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  async function exportPdf() {
    saveResumeJson();
    setExportError("");
    setIsExportingPdf(true);

    try {
      const previewElement = document.querySelector<HTMLElement>(".resume-generator-preview article");

      if (!previewElement) {
        setExportError("暂时没有找到可导出的简历预览，请稍后重试。");
        return;
      }

      await exportResumePdfFromElement(previewElement, `${resumeData.basicInfo?.name || "resume"}.pdf`);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "PDF 生成失败，请稍后重试。");
    } finally {
      setIsExportingPdf(false);
    }
  }

  function handleExportHtml() {
    saveResumeJson();
    setExportError("");

    const previewElement = document.querySelector<HTMLElement>(".resume-generator-preview article");

    if (!previewElement) {
      setExportError("暂时没有找到可导出的简历预览，请稍后重试。");
      return;
    }

    exportResumeHtmlFromElement(previewElement, `${resumeData.basicInfo?.name || "resume"}.html`);
  }

  return (
    <main className={`resume-generator-shell ${mode === "edit" ? "is-editing" : ""}`}>
      <aside className="resume-generator-panel">
        <Link href="/result" className="resume-generator-back">
          返回结果页
        </Link>

        <div className="resume-generator-heading">
          <h1>简历预览 / 编辑</h1>
          <p>AI 生成 resume.json 后，可以先手动修改内容，再导出 HTML 或最终投递 PDF。</p>
        </div>

        <section className="resume-generator-card">
          <h2>页面模式</h2>
          <div className="resume-generator-actions two">
            <button type="button" onClick={() => setMode("edit")} className={mode === "edit" ? "primary" : ""}>
              编辑简历
            </button>
            <button type="button" onClick={() => setMode("preview")} className={mode === "preview" ? "primary" : ""}>
              预览简历
            </button>
          </div>
        </section>

        <section className="resume-generator-card">
          <h2>选择模板</h2>
          <div className="resume-template-list">
            {templateOptions.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplate(template.id)}
                className={selectedTemplate === template.id ? "is-selected" : ""}
              >
                <strong>{template.name}</strong>
                <span>{template.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="resume-generator-card">
          <h2>导出</h2>
          <div className="resume-generator-actions">
            <button type="button" onClick={saveResumeJson}>
              {saved ? "已保存" : "保存修改"}
            </button>
            <button type="button" onClick={handleExportHtml}>
              导出 HTML
            </button>
            <button type="button" onClick={exportPdf} className="primary" disabled={isExportingPdf}>
              {isExportingPdf ? "正在生成 PDF..." : "导出 PDF"}
            </button>
          </div>
          <p>HTML 可直接用浏览器打开或分享；PDF 用于最终投递。</p>
          <p className="resume-generator-save-state">编辑内容会自动保存到浏览器，下次进入会继续保留。</p>
          {exportError ? <p className="resume-generator-error">{exportError}</p> : null}
        </section>
      </aside>

      {mode === "edit" ? <ResumeEditor resumeData={resumeData} onChange={setResumeData} /> : null}

      <section className="resume-generator-preview" aria-label="简历模板预览">
        <A4PreviewFrame>
          {selectedTemplate === "template3" ? (
            <Template3 resumeData={resumeData} />
          ) : selectedTemplate === "template2" ? (
            <Template2 resumeData={resumeData} />
          ) : (
            <Template1 data={resumeData} />
          )}
        </A4PreviewFrame>
      </section>
    </main>
  );
}

function ResumeEditor({ resumeData, onChange }: { resumeData: ResumeData; onChange: (data: ResumeData) => void }) {
  const hiddenSections = resumeData.hiddenSections || [];
  const customSections = resumeData.customSections || [];

  function updateBasicInfo(key: string, value: string) {
    onChange({
      ...resumeData,
      basicInfo: {
        ...(resumeData.basicInfo || {}),
        [key]: value
      }
    });
  }

  function updateTextList(key: "selfEvaluation" | "advantages", value: string) {
    onChange({
      ...resumeData,
      [key]: linesToArray(value)
    });
  }

  function updateSkills(value: string) {
    onChange({
      ...resumeData,
      skills: linesToArray(value)
    });
  }

  function isVisible(key: EditableSectionKey) {
    return !hiddenSections.includes(key);
  }

  function hideSection(key: EditableSectionKey) {
    if (hiddenSections.includes(key)) {
      return;
    }

    onChange({
      ...resumeData,
      hiddenSections: [...hiddenSections, key]
    });
  }

  function showSection(key: EditableSectionKey) {
    onChange({
      ...resumeData,
      hiddenSections: hiddenSections.filter((item) => item !== key)
    });
  }

  function addCustomSection(title: string) {
    const nextTitle = title || `自定义板块 ${customSections.length + 1}`;
    onChange({
      ...resumeData,
      customSections: [
        ...customSections,
        {
          title: nextTitle,
          items: []
        }
      ]
    });
  }

  function updateCustomSection(index: number, patch: Partial<CustomSection>) {
    const nextSections = [...customSections];
    nextSections[index] = { ...nextSections[index], ...patch };
    onChange({ ...resumeData, customSections: nextSections });
  }

  function deleteCustomSection(index: number) {
    onChange({
      ...resumeData,
      customSections: customSections.filter((_, currentIndex) => currentIndex !== index)
    });
  }

  return (
    <section className="resume-editor-panel">
      <header className="resume-editor-header">
        <h2>编辑 resume.json</h2>
        <p>修改后右侧预览会实时更新。可以隐藏暂时不用的板块，也可以新增实践经历等自定义板块。</p>
      </header>

      <EditorBlock title="基本信息">
        <div className="resume-editor-grid">
          <Field label="姓名" value={resumeData.basicInfo?.name} onChange={(value) => updateBasicInfo("name", value)} />
          <Field label="求职意向" value={resumeData.basicInfo?.jobIntention || resumeData.basicInfo?.role} onChange={(value) => updateBasicInfo("jobIntention", value)} />
          <Field label="手机号" value={resumeData.basicInfo?.phone || resumeData.basicInfo?.contacts?.phone} onChange={(value) => updateBasicInfo("phone", value)} />
          <Field label="邮箱" value={resumeData.basicInfo?.email || resumeData.basicInfo?.contacts?.email} onChange={(value) => updateBasicInfo("email", value)} />
          <Field label="所在城市" value={resumeData.basicInfo?.city || resumeData.basicInfo?.location} onChange={(value) => updateBasicInfo("city", value)} />
          <Field label="出生年月" value={resumeData.basicInfo?.birthDate} onChange={(value) => updateBasicInfo("birthDate", value)} />
          <Field label="GitHub" value={resumeData.basicInfo?.github} onChange={(value) => updateBasicInfo("github", value)} />
          <Field label="个人网站" value={resumeData.basicInfo?.website} onChange={(value) => updateBasicInfo("website", value)} />
          <AvatarUploader
            value={typeof resumeData.basicInfo?.avatar === "string" ? resumeData.basicInfo.avatar : resumeData.basicInfo?.avatarUrl}
            originalImage={typeof resumeData.basicInfo?.originalImage === "string" ? resumeData.basicInfo.originalImage : ""}
            onChange={(value) => updateBasicInfo("avatar", value)}
            onOriginalImageChange={(value) => updateBasicInfo("originalImage", value)}
          />
        </div>
      </EditorBlock>

      <SectionManager hiddenSections={hiddenSections} onAddCustomSection={addCustomSection} onShowSection={showSection} />

      {isVisible("education") ? <EducationEditor resumeData={resumeData} onChange={onChange} onRemove={() => hideSection("education")} /> : null}
      {isVisible("skills") ? (
        <TextareaBlock title="专业技能" value={flattenSkills(resumeData.skills).join("\n")} onChange={updateSkills} onRemove={() => hideSection("skills")} placeholder="每行一个技能" />
      ) : null}
      {isVisible("projects") ? <ProjectEditor resumeData={resumeData} onChange={onChange} onRemove={() => hideSection("projects")} /> : null}
      {isVisible("work") ? <WorkEditor resumeData={resumeData} onChange={onChange} onRemove={() => hideSection("work")} /> : null}
      {isVisible("campus") ? <CampusEditor resumeData={resumeData} onChange={onChange} onRemove={() => hideSection("campus")} /> : null}
      {isVisible("awards") ? <AwardsEditor resumeData={resumeData} onChange={onChange} onRemove={() => hideSection("awards")} /> : null}
      {isVisible("certificates") ? <CertificatesEditor resumeData={resumeData} onChange={onChange} onRemove={() => hideSection("certificates")} /> : null}
      {isVisible("advantages") ? (
        <TextareaBlock
          title="个人优势"
          value={(resumeData.advantages || []).join("\n")}
          onChange={(value) => updateTextList("advantages", value)}
          onRemove={() => hideSection("advantages")}
          placeholder="每行一条个人优势"
        />
      ) : null}
      {isVisible("volunteer") ? <VolunteerEditor resumeData={resumeData} onChange={onChange} onRemove={() => hideSection("volunteer")} /> : null}
      {isVisible("selfEvaluation") ? (
        <TextareaBlock
          title="自我评价"
          value={toText(resumeData.selfEvaluation)}
          onChange={(value) => updateTextList("selfEvaluation", value)}
          onRemove={() => hideSection("selfEvaluation")}
          placeholder="每行一段自我评价"
        />
      ) : null}
      <CustomSectionsEditor sections={customSections} onChange={updateCustomSection} onDelete={deleteCustomSection} />
    </section>
  );
}

function SectionManager({
  hiddenSections,
  onAddCustomSection,
  onShowSection
}: {
  hiddenSections: string[];
  onAddCustomSection: (title: string) => void;
  onShowSection: (key: EditableSectionKey) => void;
}) {
  const [selectedTitle, setSelectedTitle] = useState(customSectionPresets[0]);
  const hiddenEditableSections = editableSections.filter((section) => hiddenSections.includes(section.key));

  return (
    <section className="resume-section-manager" aria-label="板块管理">
      <div>
        <h3>板块管理</h3>
        <p>隐藏的板块不会出现在右侧预览和导出的 DOCX 中；需要时可以恢复。</p>
      </div>
      <div className="resume-section-manager-actions">
        <label>
          <span>新增板块</span>
          <select value={selectedTitle} onChange={(event) => setSelectedTitle(event.target.value)}>
            {customSectionPresets.map((title) => (
              <option value={title} key={title}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => onAddCustomSection(selectedTitle)}>
          新建板块
        </button>
      </div>
      {hiddenEditableSections.length ? (
        <div className="resume-hidden-section-list">
          {hiddenEditableSections.map((section) => (
            <button type="button" key={section.key} onClick={() => onShowSection(section.key)}>
              恢复{section.title}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function EducationEditor({ resumeData, onChange, onRemove }: EditorProps) {
  const items = resumeData.education || [];
  return (
    <ArrayBlock
      title="教育背景"
      items={items}
      onRemove={onRemove}
      onAdd={() => onChange({ ...resumeData, education: [...items, { school: "", major: "", degree: "", dateRange: "", courses: [] }] })}
      onMove={(from, to) => onChange({ ...resumeData, education: moveItem(items, from, to) })}
      onDelete={(index) => onChange({ ...resumeData, education: removeItem(items, index) })}
      render={(item, index) => (
        <div className="resume-editor-grid">
          <Field label="学校" value={item.school} onChange={(value) => updateArrayItem(resumeData, onChange, "education", index, { school: value })} />
          <Field label="专业" value={item.major} onChange={(value) => updateArrayItem(resumeData, onChange, "education", index, { major: value })} />
          <Field label="学历" value={item.degree} onChange={(value) => updateArrayItem(resumeData, onChange, "education", index, { degree: value })} />
          <Field label="时间" value={item.dateRange || item.time} onChange={(value) => updateArrayItem(resumeData, onChange, "education", index, { dateRange: value })} />
          <Field label="GPA" value={item.gpa} onChange={(value) => updateArrayItem(resumeData, onChange, "education", index, { gpa: value })} />
          <Field label="专业排名" value={item.ranking} onChange={(value) => updateArrayItem(resumeData, onChange, "education", index, { ranking: value })} />
          <TextareaField label="主修课程" value={(item.courses || []).join("\n")} onChange={(value) => updateArrayItem(resumeData, onChange, "education", index, { courses: linesToArray(value) })} />
        </div>
      )}
    />
  );
}

function ProjectEditor({ resumeData, onChange, onRemove }: EditorProps) {
  const items = resumeData.projects || [];
  return (
    <ArrayBlock
      title="项目经历"
      items={items}
      onRemove={onRemove}
      onAdd={() => onChange({ ...resumeData, projects: [...items, { name: "", dateRange: "", description: [], techStack: [], responsibilities: [], coreFeatures: [], results: [] }] })}
      onMove={(from, to) => onChange({ ...resumeData, projects: moveItem(items, from, to) })}
      onDelete={(index) => onChange({ ...resumeData, projects: removeItem(items, index) })}
      render={(item, index) => (
        <div className="resume-editor-grid">
          <Field label="项目名称" value={item.name} onChange={(value) => updateArrayItem(resumeData, onChange, "projects", index, { name: value })} />
          <Field label="项目时间" value={item.dateRange || item.time} onChange={(value) => updateArrayItem(resumeData, onChange, "projects", index, { dateRange: value })} />
          <TextareaField label="项目简介" value={item.summary || ""} onChange={(value) => updateArrayItem(resumeData, onChange, "projects", index, { summary: value })} />
          <TextareaField label="技术栈" value={(item.techStack || []).join("\n")} onChange={(value) => updateArrayItem(resumeData, onChange, "projects", index, { techStack: linesToArray(value) })} />
          <TextareaField label="项目描述" value={toText(item.description)} onChange={(value) => updateArrayItem(resumeData, onChange, "projects", index, { description: linesToArray(value) })} />
          <TextareaField label="个人职责" value={toText(item.responsibilities)} onChange={(value) => updateArrayItem(resumeData, onChange, "projects", index, { responsibilities: linesToArray(value) })} />
          <TextareaField label="核心功能" value={toText(item.coreFeatures)} onChange={(value) => updateArrayItem(resumeData, onChange, "projects", index, { coreFeatures: linesToArray(value) })} />
          <TextareaField label="项目成果" value={toText(item.results)} onChange={(value) => updateArrayItem(resumeData, onChange, "projects", index, { results: linesToArray(value) })} />
          <Field label="项目链接" value={item.link} onChange={(value) => updateArrayItem(resumeData, onChange, "projects", index, { link: value })} />
        </div>
      )}
    />
  );
}

function WorkEditor({ resumeData, onChange, onRemove }: EditorProps) {
  const items = resumeData.internshipExperience || [];
  return (
    <ArrayBlock
      title="实习经历 / 工作经历"
      items={items}
      onRemove={onRemove}
      onAdd={() => onChange({ ...resumeData, internshipExperience: [...items, { company: "", role: "", dateRange: "", description: [], contributions: [], results: [] }] })}
      onMove={(from, to) => onChange({ ...resumeData, internshipExperience: moveItem(items, from, to) })}
      onDelete={(index) => onChange({ ...resumeData, internshipExperience: removeItem(items, index) })}
      render={(item, index) => (
        <div className="resume-editor-grid">
          <Field label="公司名称" value={item.company} onChange={(value) => updateArrayItem(resumeData, onChange, "internshipExperience", index, { company: value })} />
          <Field label="岗位名称" value={item.role || item.position} onChange={(value) => updateArrayItem(resumeData, onChange, "internshipExperience", index, { role: value })} />
          <Field label="时间" value={item.dateRange || item.time} onChange={(value) => updateArrayItem(resumeData, onChange, "internshipExperience", index, { dateRange: value })} />
          <TextareaField label="工作内容" value={toText(item.description)} onChange={(value) => updateArrayItem(resumeData, onChange, "internshipExperience", index, { description: linesToArray(value) })} />
          <TextareaField label="个人贡献" value={toText(item.contributions)} onChange={(value) => updateArrayItem(resumeData, onChange, "internshipExperience", index, { contributions: linesToArray(value) })} />
          <TextareaField label="量化成果" value={toText(item.results)} onChange={(value) => updateArrayItem(resumeData, onChange, "internshipExperience", index, { results: linesToArray(value) })} />
        </div>
      )}
    />
  );
}

function CampusEditor({ resumeData, onChange, onRemove }: EditorProps) {
  const items = resumeData.campusExperience || [];
  return (
    <ArrayBlock
      title="校园经历"
      items={items}
      onRemove={onRemove}
      onAdd={() => onChange({ ...resumeData, campusExperience: [...items, { organization: "", role: "", dateRange: "", description: [], results: [] }] })}
      onMove={(from, to) => onChange({ ...resumeData, campusExperience: moveItem(items, from, to) })}
      onDelete={(index) => onChange({ ...resumeData, campusExperience: removeItem(items, index) })}
      render={(item, index) => (
        <div className="resume-editor-grid">
          <Field label="组织名称" value={item.organization} onChange={(value) => updateArrayItem(resumeData, onChange, "campusExperience", index, { organization: value })} />
          <Field label="职务" value={item.role} onChange={(value) => updateArrayItem(resumeData, onChange, "campusExperience", index, { role: value })} />
          <Field label="时间" value={item.dateRange || item.time} onChange={(value) => updateArrayItem(resumeData, onChange, "campusExperience", index, { dateRange: value })} />
          <TextareaField label="工作内容" value={toText(item.description)} onChange={(value) => updateArrayItem(resumeData, onChange, "campusExperience", index, { description: linesToArray(value) })} />
          <TextareaField label="成果" value={toText(item.results)} onChange={(value) => updateArrayItem(resumeData, onChange, "campusExperience", index, { results: linesToArray(value) })} />
        </div>
      )}
    />
  );
}

function AwardsEditor({ resumeData, onChange, onRemove }: EditorProps) {
  const items = normalizeAwards(resumeData.awards);
  return (
    <ArrayBlock
      title="荣誉奖项"
      items={items}
      onRemove={onRemove}
      onAdd={() => onChange({ ...resumeData, awards: [...items, { name: "", date: "", level: "", description: "" }] })}
      onMove={(from, to) => onChange({ ...resumeData, awards: moveItem(items, from, to) })}
      onDelete={(index) => onChange({ ...resumeData, awards: removeItem(items, index) })}
      render={(item, index) => (
        <div className="resume-editor-grid">
          <Field label="奖项名称" value={item.name} onChange={(value) => updateArrayItem(resumeData, onChange, "awards", index, { name: value })} />
          <Field label="获奖时间" value={item.date} onChange={(value) => updateArrayItem(resumeData, onChange, "awards", index, { date: value })} />
          <Field label="级别" value={item.level} onChange={(value) => updateArrayItem(resumeData, onChange, "awards", index, { level: value })} />
          <Field label="说明" value={item.description} onChange={(value) => updateArrayItem(resumeData, onChange, "awards", index, { description: value })} />
        </div>
      )}
    />
  );
}

function CertificatesEditor({ resumeData, onChange, onRemove }: EditorProps) {
  const items = normalizeCertificates(resumeData.certificates);
  return (
    <ArrayBlock
      title="证书"
      items={items}
      onRemove={onRemove}
      onAdd={() => onChange({ ...resumeData, certificates: [...items, { name: "", date: "", description: "" }] })}
      onMove={(from, to) => onChange({ ...resumeData, certificates: moveItem(items, from, to) })}
      onDelete={(index) => onChange({ ...resumeData, certificates: removeItem(items, index) })}
      render={(item, index) => (
        <div className="resume-editor-grid">
          <Field label="证书名称" value={item.name} onChange={(value) => updateArrayItem(resumeData, onChange, "certificates", index, { name: value })} />
          <Field label="获得时间" value={item.date} onChange={(value) => updateArrayItem(resumeData, onChange, "certificates", index, { date: value })} />
          <Field label="说明" value={item.description} onChange={(value) => updateArrayItem(resumeData, onChange, "certificates", index, { description: value })} />
        </div>
      )}
    />
  );
}

function VolunteerEditor({ resumeData, onChange, onRemove }: EditorProps) {
  const items = resumeData.volunteerExperience || [];
  return (
    <ArrayBlock
      title="志愿服务"
      items={items}
      onRemove={onRemove}
      onAdd={() => onChange({ ...resumeData, volunteerExperience: [...items, { name: "", dateRange: "", description: [], hours: "" }] })}
      onMove={(from, to) => onChange({ ...resumeData, volunteerExperience: moveItem(items, from, to) })}
      onDelete={(index) => onChange({ ...resumeData, volunteerExperience: removeItem(items, index) })}
      render={(item, index) => (
        <div className="resume-editor-grid">
          <Field label="服务名称" value={item.name} onChange={(value) => updateArrayItem(resumeData, onChange, "volunteerExperience", index, { name: value })} />
          <Field label="服务时间" value={item.dateRange || item.time} onChange={(value) => updateArrayItem(resumeData, onChange, "volunteerExperience", index, { dateRange: value })} />
          <Field label="服务时长" value={item.hours} onChange={(value) => updateArrayItem(resumeData, onChange, "volunteerExperience", index, { hours: value })} />
          <TextareaField label="服务内容" value={toText(item.description)} onChange={(value) => updateArrayItem(resumeData, onChange, "volunteerExperience", index, { description: linesToArray(value) })} />
        </div>
      )}
    />
  );
}

type EditorProps = {
  resumeData: ResumeData;
  onChange: (data: ResumeData) => void;
  onRemove: () => void;
};

function EditorBlock({ title, children, onRemove, removeLabel = "隐藏板块" }: { title: string; children: React.ReactNode; onRemove?: () => void; removeLabel?: string }) {
  return (
    <section className="resume-editor-block">
      <div className="resume-editor-block-head">
        <h3>{title}</h3>
        {onRemove ? (
          <button type="button" onClick={onRemove}>
            {removeLabel}
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ArrayBlock<T>({
  title,
  items,
  render,
  onAdd,
  onDelete,
  onMove,
  onRemove
}: {
  title: string;
  items: T[];
  render: (item: T, index: number) => React.ReactNode;
  onAdd: () => void;
  onDelete: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onRemove?: () => void;
}) {
  return (
    <EditorBlock title={title} onRemove={onRemove}>
      <div className="resume-array-list">
        {items.map((item, index) => (
          <article className="resume-array-item" key={index}>
            <div className="resume-array-actions">
              <span>第 {index + 1} 项</span>
              <button type="button" onClick={() => onMove(index, index - 1)} disabled={index === 0}>
                上移
              </button>
              <button type="button" onClick={() => onMove(index, index + 1)} disabled={index === items.length - 1}>
                下移
              </button>
              <button type="button" onClick={() => onDelete(index)}>
                删除
              </button>
            </div>
            {render(item, index)}
          </article>
        ))}
        <button type="button" className="resume-add-button" onClick={onAdd}>
          新增{title}
        </button>
      </div>
    </EditorBlock>
  );
}

function TextareaBlock({ title, value, onChange, onRemove, placeholder }: { title: string; value: string; onChange: (value: string) => void; onRemove?: () => void; placeholder: string }) {
  return (
    <EditorBlock title={title} onRemove={onRemove}>
      <TextareaField label={title} value={value} onChange={onChange} placeholder={placeholder} />
    </EditorBlock>
  );
}

function CustomSectionsEditor({
  sections,
  onChange,
  onDelete
}: {
  sections: CustomSection[];
  onChange: (index: number, patch: Partial<CustomSection>) => void;
  onDelete: (index: number) => void;
}) {
  if (!sections.length) {
    return null;
  }

  return (
    <>
      {sections.map((section, index) => (
        <EditorBlock title={section.title || "自定义板块"} key={`${section.title}-${index}`} onRemove={() => onDelete(index)} removeLabel="删除板块">
          <div className="resume-editor-grid">
            <Field label="板块名称" value={section.title} onChange={(value) => onChange(index, { title: value })} />
            <TextareaField label="段落内容" value={section.content || ""} onChange={(value) => onChange(index, { content: value })} placeholder="适合填写一段整体说明，可留空" />
            <TextareaField label="条目内容" value={(section.items || []).join("\n")} onChange={(value) => onChange(index, { items: linesToArray(value) })} placeholder="每行一条经历或成果" />
          </div>
        </EditorBlock>
      ))}
    </>
  );
}

function Field({ label, value, onChange }: { label: string; value?: string; onChange: (value: string) => void }) {
  return (
    <label className="resume-field">
      <span>{label}</span>
      <input value={value || ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextareaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="resume-field resume-field-wide">
      <span>{label}</span>
      <textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function updateArrayItem<K extends keyof ResumeData>(resumeData: ResumeData, onChange: (data: ResumeData) => void, key: K, index: number, patch: Record<string, unknown>) {
  const items = Array.isArray(resumeData[key]) ? ([...(resumeData[key] as unknown[])] as Record<string, unknown>[]) : [];
  items[index] = { ...(items[index] || {}), ...patch };
  onChange({ ...resumeData, [key]: items });
}

function moveItem<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(from, 1);
  nextItems.splice(to, 0, item);
  return nextItems;
}

function removeItem<T>(items: T[], index: number) {
  return items.filter((_, currentIndex) => currentIndex !== index);
}

function linesToArray(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

function toText(value: string[] | string | undefined) {
  return Array.isArray(value) ? value.join("\n") : value || "";
}

function flattenSkills(skills: ResumeData["skills"]) {
  if (!skills) {
    return [];
  }

  if (Array.isArray(skills)) {
    return skills.flatMap((item) => (typeof item === "string" ? [item] : item.items || item.skills || []));
  }

  return Object.entries(skills).flatMap(([key, value]) => (Array.isArray(value) ? value.map((item) => `${key}：${item}`) : [`${key}：${value}`]));
}

function normalizeAwards(awards: ResumeData["awards"]): AwardItem[] {
  return (awards || []).map((item) => (typeof item === "string" ? { name: item } : item));
}

function normalizeCertificates(certificates: ResumeData["certificates"]): CertificateItem[] {
  return (certificates || []).map((item) => (typeof item === "string" ? { name: item } : item));
}
