/* eslint-disable @next/next/no-img-element */

"use client";

import type {
  AwardItem,
  CertificateItem,
  EducationItem,
  ProjectItem,
  ResumeData,
  SkillCategory,
  SkillData,
  WorkExperienceItem
} from "@/src/types/resume";
import { ResumeOverflowHint, useSmartResumeLayout } from "./useSmartResumeLayout";

type Template3Props = {
  resumeData: ResumeData;
};

export default function Template3({ resumeData }: Template3Props) {
  const [setSmartLayoutRoot, smartLayoutClassName, isSmartLayoutOverflow] = useSmartResumeLayout();
  const basicInfo = resumeData.basicInfo || {};
  const name = basicInfo.name || "姓名";
  const role = basicInfo.jobIntention || basicInfo.role || "求职方向";
  const avatar = typeof basicInfo.avatar === "string" ? basicInfo.avatar : basicInfo.avatarUrl;
  const birthDate = toText(basicInfo.birthDate) || toText(basicInfo.birthday) || toText(basicInfo.birth);
  const contacts = [
    ["手机", basicInfo.phone || basicInfo.contacts?.phone],
    ["邮箱", basicInfo.email || basicInfo.contacts?.email],
    ["所在城市", basicInfo.city || basicInfo.location || basicInfo.contacts?.city || basicInfo.contacts?.location],
    ["出生年月", birthDate],
    ["性别", basicInfo.gender],
    ["民族", basicInfo.ethnicity],
    ["GitHub", basicInfo.github || basicInfo.contacts?.github],
    ["个人网站", basicInfo.website || basicInfo.contacts?.website]
  ].filter(([, value]) => Boolean(value)) as string[][];
  const education = resumeData.education || [];
  const skills = normalizeSkills(resumeData.skills);
  const certificates = normalizeCertificates(resumeData.certificates);
  const softSkills = resumeData.advantages || [];
  const profile = normalizeTextList(resumeData.selfEvaluation);
  const experiences = buildExperienceItems(resumeData);

  return (
    <article ref={setSmartLayoutRoot} className={`template3-page ${smartLayoutClassName}`} aria-label={`${name} 的简历`}>
      {isSmartLayoutOverflow ? <ResumeOverflowHint /> : null}
      <aside className="template3-sidebar">
        <div className="template3-avatar-wrap">
          {avatar ? <img src={avatar} className="template3-avatar" alt={`${name}头像`} /> : <span>{name.slice(0, 1)}</span>}
        </div>

        <h1>{name}</h1>
        <p className="template3-role">{role}</p>

        {contacts.length > 0 ? (
          <>
            <Divider />
            <SidebarSection title="基本信息">
              {contacts.map(([label, value]) => (
                <p key={label}>
                  <strong>{label}：</strong>{value}
                </p>
              ))}
            </SidebarSection>
          </>
        ) : null}

        {isSectionVisible(resumeData, "education") && education.length > 0 ? (
          <>
            <Divider />
            <SidebarSection title="教育背景">
              {education.map((item, index) => (
                <div className="template3-sidebar-item" key={`${item.school}-${index}`}>
                  <p>
                    <strong>{item.school}</strong>
                  </p>
                  <p>{[item.degree, item.major].filter(Boolean).join(" / ")}</p>
                  <p>{item.dateRange || item.time}</p>
                </div>
              ))}
            </SidebarSection>
          </>
        ) : null}

        {isSectionVisible(resumeData, "skills") ? <SidebarList title="专业技能" items={skills} /> : null}
        {isSectionVisible(resumeData, "certificates") ? <SidebarList title="证书" items={certificates} /> : null}
        {isSectionVisible(resumeData, "advantages") ? <SidebarList title="个人优势" items={softSkills} /> : null}
      </aside>

      <main className="template3-content">
        {isSectionVisible(resumeData, "selfEvaluation") && profile.length > 0 ? (
          <MainSection title="自我评价" className="template3-profile">
            {profile.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </MainSection>
        ) : null}

        {experiences.length > 0 ? (
          <MainSection title="经历展示">
            {experiences.map((item, index) => (
              <ExperienceItem item={item} key={`${item.organization}-${item.title}-${index}`} />
            ))}
          </MainSection>
        ) : null}

        {isSectionVisible(resumeData, "awards") && resumeData.awards?.length ? (
          <MainSection title="荣誉奖项">
            <div className="template3-tags">
              {normalizeAwards(resumeData.awards).map((award) => (
                <span key={award}>{award}</span>
              ))}
            </div>
          </MainSection>
        ) : null}

        {(resumeData.customSections || []).map((section) =>
          section.content || section.items?.length ? (
            <MainSection title={section.title} key={section.title}>
              {section.content ? <p>{section.content}</p> : null}
              {section.items?.length ? (
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </MainSection>
          ) : null
        )}
      </main>
    </article>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="template3-sidebar-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function SidebarList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <SidebarSection title={title}>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </SidebarSection>
  );
}

function Divider() {
  return <div className="template3-divider" />;
}

function MainSection({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={className}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

type ExperienceData = {
  organization?: string;
  title?: string;
  subtitle?: string;
  location?: string;
  dateRange?: string;
  bullets: ExperienceBullet[];
};

type ExperienceBullet = {
  text: string;
  kind?: "body" | "tech";
};

function ExperienceItem({ item }: { item: ExperienceData }) {
  return (
    <div className="template3-job">
      <div className="template3-job-left">
        {item.organization ? <h3>{item.organization}</h3> : null}
        {item.subtitle ? <p>{item.subtitle}</p> : null}
        {item.location ? (
          <p>
            <em>{item.location}</em>
          </p>
        ) : null}
        {item.dateRange ? (
          <p>
            <em>{item.dateRange}</em>
          </p>
        ) : null}
      </div>

      <div className="template3-job-right">
        {item.title ? <h3>{item.title}</h3> : null}
        <ul>
          {item.bullets.map((bullet) => (
            <li className={bullet.kind === "tech" ? "template3-tech-line" : ""} key={bullet.text}>
              {bullet.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function buildExperienceItems(data: ResumeData): ExperienceData[] {
  const work = isSectionVisible(data, "work")
    ? [...(data.workExperience || []), ...(data.internshipExperience || [])].map((item) => ({
    organization: item.company,
    title: item.role || item.position,
    dateRange: item.dateRange || item.time,
    bullets: [
      ...toBullets(normalizeTextList(item.description)),
      ...toBullets(normalizeTextList(item.responsibilities)),
      ...toBullets(normalizeTextList(item.contributions)),
      ...toBullets(normalizeTextList(item.results))
    ]
      }))
    : [];

  const projects = isSectionVisible(data, "projects")
    ? (data.projects || []).map((item) => ({
    organization: item.name,
    title: item.summary || "项目经历",
    dateRange: item.dateRange || item.time,
    bullets: [
      ...toBullets(normalizeTextList(item.description)),
      ...(item.techStack?.length ? [{ text: `技术栈：${item.techStack.join("、")}`, kind: "tech" as const }] : []),
      ...toBullets(normalizeTextList(item.responsibilities)),
      ...toBullets(normalizeTextList(item.coreFeatures)),
      ...toBullets(normalizeTextList(item.results)),
      ...(item.link ? [{ text: `项目链接：${item.link}` }] : [])
    ]
      }))
    : [];

  const campus = isSectionVisible(data, "campus")
    ? (data.campusExperience || []).map((item) => ({
    organization: item.organization,
    title: item.role,
    dateRange: item.dateRange || item.time,
    bullets: [...toBullets(normalizeTextList(item.description)), ...toBullets(normalizeTextList(item.results))]
      }))
    : [];

  const volunteer = isSectionVisible(data, "volunteer")
    ? (data.volunteerExperience || []).map((item) => ({
    organization: item.name,
    title: "志愿服务",
    dateRange: item.dateRange || item.time,
    subtitle: item.hours ? `服务时长：${item.hours}` : undefined,
    bullets: toBullets(normalizeTextList(item.description))
      }))
    : [];

  return [...work, ...projects, ...campus, ...volunteer].filter((item) => item.organization || item.title || item.bullets.length > 0);
}

function toBullets(items: string[]): ExperienceBullet[] {
  return items.map((text) => ({ text }));
}

function normalizeSkills(skills: SkillData | undefined) {
  if (!skills) {
    return [];
  }

  if (Array.isArray(skills)) {
    return skills.flatMap((item) => {
      if (typeof item === "string") {
        return [item];
      }

      const title = item.category || item.name;
      const values = item.items || item.skills || [];
      return title ? [`${title}：${values.join("、")}`] : values;
    });
  }

  return Object.entries(skills).map(([title, values]) => `${title}：${Array.isArray(values) ? values.join("、") : values}`);
}

function normalizeCertificates(certificates: ResumeData["certificates"]) {
  return (certificates || []).map((item) => (typeof item === "string" ? item : [item.name, item.date, item.description].filter(Boolean).join(" ｜ "))).filter(Boolean);
}

function normalizeAwards(awards: ResumeData["awards"]) {
  return (awards || [])
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      return [item.name, item.date, item.level, item.description].filter(Boolean).join(" ｜ ");
    })
    .filter(Boolean);
}

function toText(value: unknown) {
  if (value === undefined || value === null) {
    return undefined;
  }

  return String(value);
}

function normalizeTextList(value: string[] | string | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value.filter(Boolean) : value.split(/\n|；|;/).map((item) => item.trim()).filter(Boolean);
}

function isSectionVisible(data: ResumeData, key: string) {
  return !(data.hiddenSections || []).includes(key);
}
