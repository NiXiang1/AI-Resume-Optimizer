import type { ResumeData } from "@/src/types/resume";
import { AlignmentType, Document, HeadingLevel, ImageRun, Packer, Paragraph, TextRun } from "docx";

export async function exportResumeDocx(resumeData: ResumeData, fileName = "resume.docx") {
  const avatar = getAvatarValue(resumeData);
  const avatarParagraphs = avatar ? await createAvatarParagraphs(avatar, resumeData.basicInfo?.name) : [];
  const children = [
    ...avatarParagraphs,
    new Paragraph({
      text: resumeData.basicInfo?.name || "个人简历",
      heading: HeadingLevel.TITLE
    }),
    paragraph(resumeData.basicInfo?.jobIntention || resumeData.basicInfo?.role || ""),
    ...section("基本信息", [
      joinInfo("手机", resumeData.basicInfo?.phone || resumeData.basicInfo?.contacts?.phone),
      joinInfo("邮箱", resumeData.basicInfo?.email || resumeData.basicInfo?.contacts?.email),
      joinInfo("城市", resumeData.basicInfo?.city || resumeData.basicInfo?.location || resumeData.basicInfo?.contacts?.location),
      joinInfo("GitHub", resumeData.basicInfo?.github || resumeData.basicInfo?.contacts?.github),
      joinInfo("个人网站", resumeData.basicInfo?.website || resumeData.basicInfo?.contacts?.website)
    ]),
    ...section(
      "教育背景",
      (resumeData.education || []).flatMap((item) => [
        [item.dateRange || item.time, item.school, item.major, item.degree].filter(Boolean).join(" | "),
        joinInfo("GPA", item.gpa),
        joinInfo("专业排名", item.ranking),
        item.courses?.length ? `主修课程：${item.courses.join("、")}` : "",
        item.relatedCourses?.length ? `相关课程：${item.relatedCourses.join("、")}` : ""
      ])
    ),
    ...section("专业技能", flattenSkills(resumeData.skills)),
    ...section(
      "项目经历",
      (resumeData.projects || []).flatMap((item) => [
        [item.name, item.dateRange || item.time].filter(Boolean).join(" | "),
        item.summary || "",
        ...toArray(item.description),
        item.techStack?.length ? `技术栈：${item.techStack.join("、")}` : "",
        ...toArray(item.responsibilities).map((line) => `个人职责：${line}`),
        ...toArray(item.coreFeatures).map((line) => `核心功能：${line}`),
        ...toArray(item.results).map((line) => `项目成果：${line}`),
        item.link ? `项目链接：${item.link}` : ""
      ])
    ),
    ...section(
      "实习经历 / 工作经历",
      [...(resumeData.internshipExperience || []), ...(resumeData.workExperience || [])].flatMap((item) => [
        [item.dateRange || item.time, item.company, item.role || item.position].filter(Boolean).join(" | "),
        ...toArray(item.description),
        ...toArray(item.contributions).map((line) => `个人贡献：${line}`),
        ...toArray(item.results).map((line) => `量化成果：${line}`)
      ])
    ),
    ...section(
      "校园经历",
      (resumeData.campusExperience || []).flatMap((item) => [
        [item.dateRange || item.time, item.organization, item.role].filter(Boolean).join(" | "),
        ...toArray(item.description),
        ...toArray(item.results).map((line) => `成果：${line}`)
      ])
    ),
    ...section("荣誉奖项", normalizeNamedItems(resumeData.awards)),
    ...section("证书", normalizeNamedItems(resumeData.certificates)),
    ...section(
      "志愿服务",
      (resumeData.volunteerExperience || []).flatMap((item) => [
        [item.time || item.dateRange, item.name, item.hours].filter(Boolean).join(" | "),
        ...toArray(item.description)
      ])
    ),
    ...section("自我评价", toArray(resumeData.selfEvaluation))
  ].filter(Boolean);

  const doc = new Document({
    sections: [
      {
        properties: {},
        children
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, fileName);
}

function section(title: string, lines: string[]) {
  const validLines = lines.map((line) => line.trim()).filter(Boolean);
  if (!validLines.length) {
    return [];
  }

  return [
    newParagraph(title, { heading: true }),
    ...validLines.map((line) => paragraph(line))
  ];
}

function newParagraph(text: string, options?: { heading?: boolean }) {
  return new Paragraph({
    heading: options?.heading ? HeadingLevel.HEADING_2 : undefined,
    children: [
      new TextRun({
        text,
        bold: Boolean(options?.heading),
        size: options?.heading ? 28 : 22
      })
    ]
  });
}

function paragraph(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: 120 }
  });
}

function joinInfo(label: string, value?: string) {
  return value ? `${label}：${value}` : "";
}

function toArray(value: string[] | string | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : value.split(/\n|；|;/).map((item) => item.trim()).filter(Boolean);
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

      return [`${item.category || item.name || "技能"}：${(item.items || item.skills || []).join("、")}`];
    });
  }

  return Object.entries(skills).map(([key, value]) => `${key}：${Array.isArray(value) ? value.join("、") : value}`);
}

function normalizeNamedItems(items: ResumeData["awards"] | ResumeData["certificates"]) {
  return (items || []).map((item) => {
    if (typeof item === "string") {
      return item;
    }

    return [item.name, item.date, "level" in item ? item.level : "", item.description].filter(Boolean).join(" | ");
  });
}

function getAvatarValue(resumeData: ResumeData) {
  if (typeof resumeData.basicInfo?.avatar === "string") {
    return resumeData.basicInfo.avatar;
  }

  return resumeData.basicInfo?.avatarUrl || "";
}

async function createAvatarParagraphs(avatar: string, name?: string) {
  const imageData = await avatarToPngBytes(avatar);

  if (!imageData) {
    return [];
  }

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new ImageRun({
          type: "png",
          data: imageData,
          transformation: {
            width: 96,
            height: 96
          },
          altText: {
            title: `${name || "用户"}头像`,
            description: "简历头像",
            name: "resume-avatar"
          }
        })
      ],
      spacing: { after: 160 }
    })
  ];
}

async function avatarToPngBytes(avatar: string) {
  const trimmedAvatar = avatar.trim();

  if (!trimmedAvatar) {
    return null;
  }

  try {
    const imageUrl = await toImageUrl(trimmedAvatar);
    const image = await loadImage(imageUrl);
    const canvas = document.createElement("canvas");
    const size = 192;
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
    const sourceX = (image.naturalWidth - sourceSize) / 2;
    const sourceY = (image.naturalHeight - sourceSize) / 2;
    context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
    if (!blob) {
      return null;
    }

    return new Uint8Array(await blob.arrayBuffer());
  } catch {
    return null;
  }
}

async function toImageUrl(avatar: string) {
  if (avatar.startsWith("data:") || avatar.startsWith("blob:")) {
    return avatar;
  }

  const response = await fetch(avatar);
  if (!response.ok) {
    throw new Error("Avatar image request failed");
  }

  return URL.createObjectURL(await response.blob());
}

async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
