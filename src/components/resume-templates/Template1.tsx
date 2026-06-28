/* eslint-disable @next/next/no-img-element */

"use client";

import type { ResumeData, ProjectItem } from "@/src/types/resume";
import { ResumeOverflowHint, useSmartResumeLayout } from "./useSmartResumeLayout";

type Template1Props = {
  data: ResumeData;
};

const sidebarSections = [
  { key: "basic", title: "基本信息", icon: "i" },
  { key: "skills", title: "技能证书", icon: "★" },
  { key: "advantages", title: "个人优势", icon: "✓" },
  { key: "volunteer", title: "志愿服务", icon: "♥" }
] as const;

export default function Template1({ data }: Template1Props) {
  const [setSmartLayoutRoot, smartLayoutClassName, isSmartLayoutOverflow] = useSmartResumeLayout();
  const basicInfo = data.basicInfo || {};
  const contacts = {
    phone: basicInfo.phone || basicInfo.contacts?.phone,
    email: basicInfo.email || basicInfo.contacts?.email,
    location: basicInfo.location || basicInfo.city || basicInfo.contacts?.location || basicInfo.contacts?.city,
    website: basicInfo.website || basicInfo.github || basicInfo.contacts?.website || basicInfo.contacts?.github
  };
  const name = basicInfo.name || "姓名";
  const role = basicInfo.role || basicInfo.jobIntention || "求职方向";
  const avatar = typeof basicInfo.avatar === "string" ? basicInfo.avatar : basicInfo.avatarUrl;
  const education = data.education || [];
  const awards = normalizeNamedItems(data.awards);
  const projects = data.projects || [];
  const campusExperience = data.campusExperience || [];
  const skills = flattenSkills(data.skills);
  const advantages = data.advantages || [];
  const volunteerExperience = data.volunteerExperience || [];
  const selfEvaluation = normalizeTextList(data.selfEvaluation);

  return (
    <article ref={setSmartLayoutRoot} className={`template1-page ${smartLayoutClassName}`} aria-label={`${name} 的简历`}>
      {isSmartLayoutOverflow ? <ResumeOverflowHint /> : null}
      <aside className="template1-sidebar">
        <header className="template1-profile">
          <div className="template1-avatar">
            {avatar ? (
              <img src={avatar} alt={`${name}头像`} />
            ) : (
              <span>{name.slice(0, 1)}</span>
            )}
          </div>
          <h1>{name}</h1>
          <p>{role}</p>
        </header>

        <SidebarSection title={sidebarSections[0].title} icon={sidebarSections[0].icon}>
          <InfoList contacts={contacts} />
        </SidebarSection>

        <SidebarSection title={sidebarSections[1].title} icon={sidebarSections[1].icon}>
          <BulletList items={skills} />
        </SidebarSection>

        <SidebarSection title={sidebarSections[2].title} icon={sidebarSections[2].icon}>
          <BulletList items={advantages} />
        </SidebarSection>

        <SidebarSection title={sidebarSections[3].title} icon={sidebarSections[3].icon}>
          <ul className="template1-list">
            {volunteerExperience.map((item) => (
              <li key={item.name || item.description?.toString()}>
                {item.name}
                {item.hours ? <strong>{item.hours}</strong> : null}
              </li>
            ))}
          </ul>
        </SidebarSection>
      </aside>

      <main className="template1-main">
        <MainSection title="教育背景" icon="🎓">
          {education.map((item) => (
            <div className="template1-education" key={`${item.school}-${item.major}`}>
              <div className="template1-education-top">
                <span>{item.dateRange || item.time}</span>
                <strong>{item.school}</strong>
                <b>{item.degree}</b>
              </div>
              <div className="template1-major-line">
                <span>{item.major}</span>
                {item.ranking ? <em>{item.ranking}</em> : null}
              </div>
              <p>
                <strong>主修课程：</strong>
                {(item.courses || item.relatedCourses || []).join("、")}
              </p>
            </div>
          ))}
        </MainSection>

        <MainSection title="荣誉奖项" icon="🏆">
          <div className="template1-awards">
            {awards.map((award) => (
              <div className="template1-award" key={award}>
                <span aria-hidden="true">〔</span>
                <strong>{award}</strong>
                <span aria-hidden="true">〕</span>
              </div>
            ))}
          </div>
        </MainSection>

        <MainSection title="项目经历" icon="💼">
          <div className="template1-stack">
            {projects.map((project) => (
              <ProjectItem project={project} key={`${project.name}-${project.dateRange || project.time}`} />
            ))}
          </div>
        </MainSection>

        <MainSection title="校园经历" icon="👥">
          <div className="template1-stack">
            {campusExperience.map((item) => (
              <div className="template1-experience" key={`${item.role}-${item.dateRange || item.time}`}>
                <div className="template1-bar">
                  <strong>{item.role}</strong>
                  <span>{item.dateRange || item.time}</span>
                </div>
                <BulletList items={normalizeTextList(item.description)} />
              </div>
            ))}
          </div>
        </MainSection>

        <MainSection title="自我评价" icon="▣">
          <div className="template1-evaluation">
            {selfEvaluation.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </MainSection>

        <footer className="template1-quote">脚踏实地 · 勤学善思 · 知行合一 · 追求卓越</footer>
      </main>
    </article>
  );
}

function SidebarSection({
  title,
  icon,
  children
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="template1-sidebar-section">
      <h2>
        <span>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function MainSection({
  title,
  icon,
  children
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="template1-section">
      <div className="template1-section-title">
        <span>{icon}</span>
        <h2>{title}</h2>
        <i />
      </div>
      {children}
    </section>
  );
}

function ProjectItem({ project }: { project: ProjectItem }) {
  const description = normalizeTextList(project.description);
  const results = normalizeTextList(project.results);

  return (
    <article className="template1-project">
      <div className="template1-bar">
        <strong>{project.name}</strong>
        <span>{project.dateRange || project.time}</span>
      </div>
      <BulletList items={description} />
      {project.techStack?.length ? (
        <p className="template1-tech-stack">
          <strong>技术栈：</strong>
          {project.techStack.join("、")}
        </p>
      ) : null}
      {results.length ? (
        <p>
          <strong>项目成果：</strong>
          {results.join("；")}
        </p>
      ) : null}
    </article>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="template1-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function InfoList({
  contacts
}: {
  contacts: {
    phone?: string;
    email?: string;
    location?: string;
    website?: string;
  };
}) {
  const rows = [
    contacts.phone ? ["☎", contacts.phone] : null,
    contacts.email ? ["✉", contacts.email] : null,
    contacts.location ? ["⌖", contacts.location] : null,
    contacts.website ? ["⌘", contacts.website] : null
  ].filter(Boolean) as string[][];

  return (
    <ul className="template1-info-list">
      {rows.map(([icon, value]) => (
        <li key={value}>
          <span>{icon}</span>
          {value}
        </li>
      ))}
    </ul>
  );
}

function normalizeTextList(value: string[] | string | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : value.split(/\n|；|;/).map((item) => item.trim()).filter(Boolean);
}

function normalizeNamedItems(value: ResumeData["awards"]) {
  if (!value) {
    return [];
  }

  return value.map((item) => (typeof item === "string" ? item : item.name || "")).filter(Boolean);
}

function flattenSkills(skills: ResumeData["skills"]) {
  if (!skills) {
    return [];
  }

  if (Array.isArray(skills)) {
    return skills.flatMap((item) => {
      if (typeof item === "string") {
        return [item];
      }

      return item.items || item.skills || [];
    });
  }

  return Object.entries(skills).flatMap(([category, value]) => {
    const items = Array.isArray(value) ? value : [value];
    return items.map((item) => `${category}：${item}`);
  });
}
