import type { CampusExperienceItem, ProjectItem, ResumeData, VolunteerExperienceItem } from "@/src/types/resume";

const sectionTitles = [
  "个人总结",
  "个人简介",
  "教育背景",
  "教育经历",
  "项目经历",
  "项目经验",
  "校园经历",
  "实习经历",
  "实践经历",
  "技能栈",
  "专业技能",
  "技能",
  "荣誉奖项",
  "获奖经历",
  "志愿服务",
  "自我评价"
];

export function convertOptimizedResumeToResumeData(optimizedResume: string): ResumeData {
  const sections = parseSections(optimizedResume);
  const allText = optimizedResume.trim();
  const summary = getFirstAvailableSection(sections, ["个人总结", "个人简介", "自我评价"]);
  const skills = parseSkills(getFirstAvailableSection(sections, ["技能栈", "专业技能", "技能"]));
  const projects = parseProjects(getFirstAvailableSection(sections, ["项目经历", "项目经验"]));
  const education = parseEducation(getFirstAvailableSection(sections, ["教育背景", "教育经历"]));
  const campusExperience = parseCampusExperience(getFirstAvailableSection(sections, ["校园经历", "实践经历", "实习经历"]));
  const awards = parseSimpleItems(getFirstAvailableSection(sections, ["荣誉奖项", "获奖经历"]));
  const volunteerExperience = parseVolunteerExperience(getFirstAvailableSection(sections, ["志愿服务"]));
  const selfEvaluation = splitParagraphs(summary || getFallbackParagraph(allText));

  return {
    basicInfo: {
      name: extractName(allText),
      role: extractRole(summary, skills),
      contacts: {
        phone: extractPhone(allText),
        email: extractEmail(allText),
        location: extractLocation(allText)
      }
    },
    education:
      education.length > 0
        ? education
        : [
            {
              dateRange: "教育时间",
              school: "学校名称",
              degree: "学历",
              major: "专业名称",
              courses: []
            }
          ],
    awards: awards.length > 0 ? awards : ["奖项经历可在 resume.json 中补充"],
    projects:
      projects.length > 0
        ? projects
        : [
            {
              name: "项目经历",
              dateRange: "项目时间",
              description: splitParagraphs(getFirstAvailableSection(sections, ["项目经历", "项目经验"]) || getFallbackParagraph(allText)),
              techStack: skills.slice(0, 5),
              results: ["项目成果可在 resume.json 中继续补充"]
            }
          ],
    campusExperience:
      campusExperience.length > 0
        ? campusExperience
        : [
            {
              role: "校园/实践经历",
              dateRange: "经历时间",
              description: ["可在 resume.json 中补充校园经历、社团经历或实践经历。"]
            }
          ],
    skills: skills.length > 0 ? skills : ["技能可在 resume.json 中补充"],
    advantages: deriveAdvantages(summary, skills),
    volunteerExperience:
      volunteerExperience.length > 0 ? volunteerExperience : [{ name: "志愿服务经历可在 resume.json 中补充" }],
    selfEvaluation
  };
}

function parseSections(text: string) {
  const sections = new Map<string, string[]>();
  let currentTitle = "个人总结";

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) {
      continue;
    }

    const normalizedTitle = normalizeTitle(line);
    if (normalizedTitle) {
      currentTitle = normalizedTitle;
      if (!sections.has(currentTitle)) {
        sections.set(currentTitle, []);
      }
      continue;
    }

    if (!sections.has(currentTitle)) {
      sections.set(currentTitle, []);
    }
    sections.get(currentTitle)?.push(line);
  }

  return sections;
}

function normalizeTitle(line: string) {
  const title = line.replace(/^#+\s*/, "").replace(/[：:]\s*$/, "");
  return sectionTitles.find((item) => item === title) || null;
}

function getFirstAvailableSection(sections: Map<string, string[]>, titles: string[]) {
  for (const title of titles) {
    const content = sections.get(title);
    if (content?.length) {
      return content.join("\n");
    }
  }

  return "";
}

function parseSkills(text: string) {
  return unique(
    text
      .split(/\n|；|;|、|，|,/)
      .map((item) => item.replace(/^[-•]\s*/, "").replace(/^(前端|后端|AI 应用|工程工具|技能栈|技术栈)[:：]\s*/, "").trim())
      .filter(Boolean)
  ).slice(0, 12);
}

function parseProjects(text: string): ProjectItem[] {
  if (!text.trim()) {
    return [];
  }

  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const projects: ProjectItem[] = [];
  let currentProject: ProjectItem | null = null;

  for (const line of lines) {
    const isBullet = /^[-•]/.test(line);
    const isMeta = /技术栈|项目成果|成果/.test(line);

    if (!isBullet && !isMeta) {
      if (currentProject) {
        projects.push(currentProject);
      }

      const [namePart, stackPart] = line.split("|").map((item) => item.trim());
      currentProject = {
        name: namePart || "项目经历",
        dateRange: extractDateRange(line) || "项目时间",
        description: [],
        techStack: stackPart ? parseSkills(stackPart) : [],
        results: []
      };
      continue;
    }

    if (!currentProject) {
      currentProject = {
        name: "项目经历",
        dateRange: "项目时间",
        description: [],
        techStack: [],
        results: []
      };
    }

    const content = line.replace(/^[-•]\s*/, "").trim();
    if (/技术栈/.test(content)) {
      currentProject.techStack = unique([...(currentProject.techStack || []), ...parseSkills(content.replace(/^技术栈[:：]\s*/, ""))]);
    } else if (/项目成果|成果/.test(content)) {
      currentProject.results = [...normalizeTextList(currentProject.results), content.replace(/^(项目成果|成果)[:：]\s*/, "")];
    } else {
      currentProject.description = [...normalizeTextList(currentProject.description), content];
    }
  }

  if (currentProject) {
    projects.push(currentProject);
  }

  return projects.map((project) => ({
    ...project,
    techStack: project.techStack && project.techStack.length > 0 ? project.techStack : ["技术栈待补充"],
    results: normalizeTextList(project.results).length > 0 ? normalizeTextList(project.results) : ["项目成果待补充"]
  }));
}

function parseEducation(text: string): NonNullable<ResumeData["education"]> {
  if (!text.trim()) {
    return [];
  }

  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const joined = lines.join(" ");
  const schoolLine = lines.find((line) => /大学|学院|学校/.test(line)) || joined;

  return [
    {
      dateRange: extractDateRange(joined) || "教育时间",
      school: schoolLine.replace(extractDateRange(schoolLine) || "", "").trim() || "学校名称",
      degree: /本科/.test(joined) ? "本科" : /硕士|研究生/.test(joined) ? "硕士" : "学历",
      major: extractMajor(joined),
      ranking: extractRanking(joined),
      courses: extractCourses(joined)
    }
  ];
}

function parseCampusExperience(text: string): CampusExperienceItem[] {
  const items = splitParagraphs(text);
  if (items.length === 0) {
    return [];
  }

  return [
    {
      role: items[0].replace(/^[-•]\s*/, "").slice(0, 18) || "校园经历",
      dateRange: extractDateRange(text) || "经历时间",
      description: items.map((item) => item.replace(/^[-•]\s*/, ""))
    }
  ];
}

function parseVolunteerExperience(text: string): VolunteerExperienceItem[] {
  return splitParagraphs(text).map((item) => ({
    name: item.replace(/^[-•]\s*/, ""),
    hours: item.match(/\d+\s*h\+?/i)?.[0]
  }));
}

function parseSimpleItems(text: string) {
  return unique(
    text
      .split(/\n|；|;|、|，|,/)
      .map((item) => item.replace(/^[-•]\s*/, "").trim())
      .filter(Boolean)
  ).slice(0, 8);
}

function deriveAdvantages(summary: string, skills: string[]) {
  const advantages = splitParagraphs(summary).slice(0, 4);
  if (skills.length > 0) {
    advantages.push(`掌握 ${skills.slice(0, 4).join("、")} 等相关技能`);
  }

  return advantages.length > 0 ? advantages : ["具备良好的学习能力、执行力和项目实践意识"];
}

function splitParagraphs(text: string) {
  return text
    .split(/\n|。/)
    .map((item) => item.replace(/^[-•]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 8);
}

function normalizeTextList(value: string[] | string | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : value.split(/\n|；|;/).map((item) => item.trim()).filter(Boolean);
}

function extractName(text: string) {
  const nameLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^姓名[:：]/.test(line));
  return nameLine?.replace(/^姓名[:：]\s*/, "") || "姓名";
}

function extractRole(summary: string, skills: string[]) {
  if (/AI|大模型|人工智能/i.test(summary)) {
    return "AI 应用开发方向";
  }
  if (skills.some((skill) => /前端|React|Next|Vue|TypeScript/i.test(skill))) {
    return "前端 / Web 开发方向";
  }
  return "求职方向";
}

function extractPhone(text: string) {
  return text.match(/1[3-9]\d{9}/)?.[0];
}

function extractEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
}

function extractLocation(text: string) {
  return text.match(/[\u4e00-\u9fa5]{2,}(省|市|区|县)/)?.[0];
}

function extractDateRange(text: string) {
  return text.match(/\d{4}[./-]\d{1,2}\s*[-至~—]\s*(\d{4}[./-]\d{1,2}|至今|现在)/)?.[0];
}

function extractMajor(text: string) {
  return text.match(/[\u4e00-\u9fa5A-Za-z]+(专业|方向)/)?.[0] || "专业名称";
}

function extractRanking(text: string) {
  return text.match(/(专业)?排名[:：]?\s*前?\d+%/)?.[0];
}

function extractCourses(text: string) {
  const courseMatch = text.match(/主修课程[:：]\s*(.+)$/);
  return courseMatch ? parseSimpleItems(courseMatch[1]) : [];
}

function getFallbackParagraph(text: string) {
  return text.split(/\n/).find((line) => line.trim().length > 10)?.trim() || "请在 resume.json 中补充内容。";
}

function unique(items: string[]) {
  return Array.from(new Set(items));
}
