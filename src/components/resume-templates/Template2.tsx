/* eslint-disable @next/next/no-img-element */

"use client";

import type {
  AwardItem,
  CampusExperienceItem,
  CertificateItem,
  EducationItem,
  ProjectItem,
  ResumeData,
  SkillCategory,
  SkillData,
  VolunteerExperienceItem,
  WorkExperienceItem
} from "@/src/types/resume";
import { ResumeOverflowHint, useSmartResumeLayout } from "./useSmartResumeLayout";

type Template2Props = {
  resumeData: ResumeData;
};

type SectionProps = {
  title: string;
  icon: string;
  children: React.ReactNode;
};

export default function Template2({ resumeData }: Template2Props) {
  const [setSmartLayoutRoot, smartLayoutClassName, isSmartLayoutOverflow] = useSmartResumeLayout();
  const density = getDensity(resumeData);
  const basicInfo = resumeData.basicInfo || {};
  const avatar = typeof basicInfo.avatar === "string" ? basicInfo.avatar : basicInfo.avatarUrl;
  const hasAvatar = Boolean(avatar);
  const internship = [...(resumeData.internshipExperience || []), ...(resumeData.workExperience || [])];
  const skillGroups = normalizeSkills(resumeData.skills);
  const awards = normalizeAwards(resumeData.awards);
  const certificates = normalizeCertificates(resumeData.certificates);
  const selfEvaluation = normalizeTextList(resumeData.selfEvaluation);

  return (
    <article ref={setSmartLayoutRoot} className={`template2-page ${density} ${smartLayoutClassName}`} aria-label={`${basicInfo.name || "用户"}的简历`}>
      {isSmartLayoutOverflow ? <ResumeOverflowHint /> : null}
      <div className="template2-personal">PERSONAL</div>

      <TemplateSection title="基本信息" icon="♡">
        <div className={`template2-basic ${hasAvatar ? "has-avatar" : "no-avatar"}`}>
          <div className="template2-basic-grid">
            <InfoField label="姓名" value={basicInfo.name} />
            <InfoField label="求职意向" value={basicInfo.jobIntention || basicInfo.role} />
            <InfoField label="性别" value={basicInfo.gender} />
            <InfoField label="出生年月" value={basicInfo.birthDate} />
            <InfoField label="所在城市" value={basicInfo.city || basicInfo.location || basicInfo.contacts?.city || basicInfo.contacts?.location} />
            <InfoField label="联系方式" value={basicInfo.phone || basicInfo.contacts?.phone} />
            <InfoField label="电子邮箱" value={basicInfo.email || basicInfo.contacts?.email} />
            <InfoField label="GitHub" value={basicInfo.github || basicInfo.contacts?.github} />
            <InfoField label="个人网站" value={basicInfo.website || basicInfo.contacts?.website} />
          </div>

          {hasAvatar ? (
            <div className="template2-avatar">
              <img src={avatar} alt={`${basicInfo.name || "用户"}头像`} />
            </div>
          ) : null}
        </div>
      </TemplateSection>

      <EducationSection items={resumeData.education || []} />
      <ExperienceSection title="项目经历" icon="▣" items={resumeData.projects || []} kind="project" />
      <WorkSection items={internship} />
      <CampusSection items={resumeData.campusExperience || []} />
      <SkillsSection groups={skillGroups} />
      <TagSection title="荣誉奖项" icon="♕" items={awards} />
      <TagSection title="证书" icon="✓" items={certificates} />
      <VolunteerSection items={resumeData.volunteerExperience || []} />

      {selfEvaluation.length > 0 ? (
        <TemplateSection title="自我评价" icon="✎">
          <div className="template2-paragraphs">
            {selfEvaluation.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </TemplateSection>
      ) : null}

      {(resumeData.customSections || []).map((section) =>
        section.content || section.items?.length ? (
          <TemplateSection key={section.title} title={section.title} icon="•">
            {section.content ? <p className="template2-text">{section.content}</p> : null}
            {section.items?.length ? <BulletList items={section.items} /> : null}
          </TemplateSection>
        ) : null
      )}
    </article>
  );
}

function TemplateSection({ title, icon, children }: SectionProps) {
  return (
    <section className="template2-section">
      <header className="template2-section-title">
        <span>{icon}</span>
        <h2>{title}</h2>
        <i />
      </header>
      {children}
    </section>
  );
}

function InfoField({ label, value }: { label: string; value?: unknown }) {
  if (!isNonEmpty(value)) {
    return null;
  }

  return (
    <div className="template2-info-field">
      <strong>{label}</strong>
      <span>：</span>
      <p>{String(value)}</p>
    </div>
  );
}

function EducationSection({ items }: { items: EducationItem[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <TemplateSection title="教育背景" icon="□">
      <div className="template2-stack">
        {items.map((item, index) => (
          <article className="template2-entry" key={`${item.school}-${item.major}-${index}`}>
            <div className="template2-entry-head">
              <span>{item.dateRange || item.time}</span>
              <strong>{item.school}</strong>
              <b>{[item.major, item.degree].filter(Boolean).join(" / ")}</b>
            </div>
            <MetaLine
              items={[
                item.gpa ? `GPA：${item.gpa}` : "",
                item.ranking ? `专业排名：${item.ranking}` : ""
              ]}
            />
            <CourseLine label="主修课程" items={item.courses} />
            <CourseLine label="相关课程" items={item.relatedCourses} />
            <BulletList items={normalizeTextList(item.description)} />
          </article>
        ))}
      </div>
    </TemplateSection>
  );
}

function SkillsSection({ groups }: { groups: { title: string; items: string[] }[] }) {
  if (!groups.length) {
    return null;
  }

  return (
    <TemplateSection title="专业技能" icon="♙">
      <div className="template2-skill-groups">
        {groups.map((group) => (
          <div className="template2-skill-row" key={group.title}>
            <strong>{group.title}</strong>
            <div>
              {group.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </TemplateSection>
  );
}

function ExperienceSection({
  title,
  icon,
  items,
  kind
}: {
  title: string;
  icon: string;
  items: ProjectItem[];
  kind: "project";
}) {
  if (!items.length) {
    return null;
  }

  return (
    <TemplateSection title={title} icon={icon}>
      <div className="template2-stack">
        {items.map((item, index) => (
          <article className="template2-project" key={`${item.name}-${index}`}>
            <div className="template2-project-title">
              <strong>{item.name || "项目经历"}</strong>
              <span>{item.dateRange || item.time}</span>
            </div>
            {item.summary ? <p className="template2-text">{item.summary}</p> : null}
            <BulletList items={normalizeTextList(item.description)} />
            <LabelList label="技术栈" items={item.techStack} />
            <LabelList label="个人职责" items={normalizeTextList(item.responsibilities)} />
            <LabelList label="核心功能" items={normalizeTextList(item.coreFeatures)} />
            <LabelList label="项目成果" items={normalizeTextList(item.results)} />
            {item.link ? (
              <p className="template2-link">
                <strong>项目链接：</strong>
                {item.link}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </TemplateSection>
  );
}

function WorkSection({ items }: { items: WorkExperienceItem[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <TemplateSection title="实习经历 / 工作经历" icon="▤">
      <div className="template2-stack">
        {items.map((item, index) => (
          <article className="template2-entry" key={`${item.company}-${item.role}-${index}`}>
            <div className="template2-entry-head">
              <span>{item.dateRange || item.time}</span>
              <strong>{item.company}</strong>
              <b>{item.role || item.position}</b>
            </div>
            <BulletList items={normalizeTextList(item.description)} />
            <LabelList label="个人贡献" items={normalizeTextList(item.contributions)} />
            <LabelList label="量化成果" items={normalizeTextList(item.results)} />
          </article>
        ))}
      </div>
    </TemplateSection>
  );
}

function CampusSection({ items }: { items: CampusExperienceItem[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <TemplateSection title="校园经历" icon="⌂">
      <div className="template2-stack">
        {items.map((item, index) => (
          <article className="template2-entry" key={`${item.organization}-${item.role}-${index}`}>
            <div className="template2-entry-head">
              <span>{item.dateRange || item.time}</span>
              <strong>{item.organization}</strong>
              <b>{item.role}</b>
            </div>
            <BulletList items={normalizeTextList(item.description)} />
            <LabelList label="成果" items={normalizeTextList(item.results)} />
          </article>
        ))}
      </div>
    </TemplateSection>
  );
}

function VolunteerSection({ items }: { items: VolunteerExperienceItem[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <TemplateSection title="志愿服务" icon="♡">
      <div className="template2-stack compact">
        {items.map((item, index) => (
          <article className="template2-entry" key={`${item.name}-${index}`}>
            <div className="template2-entry-head">
              <span>{item.dateRange || item.time}</span>
              <strong>{item.name}</strong>
              <b>{item.hours}</b>
            </div>
            <BulletList items={normalizeTextList(item.description)} />
          </article>
        ))}
      </div>
    </TemplateSection>
  );
}

function TagSection({ title, icon, items }: { title: string; icon: string; items: { name: string; meta?: string }[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <TemplateSection title={title} icon={icon}>
      <div className="template2-tags">
        {items.map((item) => (
          <span key={`${item.name}-${item.meta}`}>
            <strong>{item.name}</strong>
            {item.meta ? <em>{item.meta}</em> : null}
          </span>
        ))}
      </div>
    </TemplateSection>
  );
}

function BulletList({ items }: { items?: string[] }) {
  const validItems = (items || []).filter(Boolean);
  if (!validItems.length) {
    return null;
  }

  return (
    <ul className="template2-list">
      {validItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function LabelList({ label, items }: { label: string; items?: string[] }) {
  const validItems = (items || []).filter(Boolean);
  if (!validItems.length) {
    return null;
  }

  return (
    <p className={`template2-label-line ${label === "技术栈" ? "template2-tech-line" : ""}`}>
      <strong>{label}：</strong>
      {validItems.join("；")}
    </p>
  );
}

function CourseLine({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) {
    return null;
  }

  return (
    <p className="template2-label-line">
      <strong>{label}：</strong>
      {items.join("、")}
    </p>
  );
}

function MetaLine({ items }: { items: string[] }) {
  const validItems = items.filter(Boolean);
  if (!validItems.length) {
    return null;
  }

  return <p className="template2-meta-line">{validItems.join("　")}</p>;
}

function normalizeSkills(skills: SkillData | undefined) {
  if (!skills) {
    return [];
  }

  if (Array.isArray(skills)) {
    if (skills.every((item) => typeof item === "string")) {
      return [{ title: "技能", items: skills as string[] }];
    }

    return (skills as SkillCategory[])
      .map((item) => ({
        title: item.category || item.name || "技能",
        items: item.items || item.skills || []
      }))
      .filter((item) => item.items.length > 0);
  }

  return Object.entries(skills)
    .map(([title, value]) => ({
      title,
      items: Array.isArray(value) ? value : [value]
    }))
    .filter((item) => item.items.length > 0);
}

function normalizeAwards(awards: ResumeData["awards"]) {
  return (awards || [])
    .map((item) => {
      if (typeof item === "string") {
        return { name: item };
      }

      return {
        name: item.name || "",
        meta: [item.date, item.level, item.description].filter(Boolean).join(" · ")
      };
    })
    .filter((item) => item.name);
}

function normalizeCertificates(certificates: ResumeData["certificates"]) {
  return (certificates || [])
    .map((item) => {
      if (typeof item === "string") {
        return { name: item };
      }

      return {
        name: item.name || "",
        meta: [item.date, item.description].filter(Boolean).join(" · ")
      };
    })
    .filter((item) => item.name);
}

function normalizeTextList(value: string[] | string | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : value.split(/\n|；|;/).map((item) => item.trim()).filter(Boolean);
}

function isNonEmpty(value: unknown) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function getDensity(data: ResumeData) {
  const count =
    (data.education?.length || 0) +
    (data.projects?.length || 0) * 2 +
    ((data.internshipExperience?.length || 0) + (data.workExperience?.length || 0)) * 2 +
    (data.campusExperience?.length || 0) +
    (data.volunteerExperience?.length || 0) +
    normalizeTextList(data.selfEvaluation).length;

  if (count > 12) {
    return "template2-dense";
  }

  if (count > 8) {
    return "template2-compact";
  }

  return "template2-comfortable";
}
