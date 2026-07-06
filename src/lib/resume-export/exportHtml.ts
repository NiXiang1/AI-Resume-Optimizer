export function exportResumeHtmlFromElement(element: HTMLElement, fileName = "resume.html") {
  const title = element.getAttribute("aria-label") || "个人简历";
  const html = buildStandaloneHtml({
    title,
    body: element.outerHTML,
    styles: collectDocumentStyles()
  });

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".html") ? fileName : `${fileName}.html`;
  link.click();
  URL.revokeObjectURL(url);
}

function buildStandaloneHtml({ title, body, styles }: { title: string; body: string; styles: string }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    ${styles}

    html {
      background: #eef4ff;
    }

    body {
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: start center;
      background: #eef4ff;
      padding: 32px;
      font-family: Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
    }

    @media print {
      html,
      body {
        background: #ffffff;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  ${body}
</body>
</html>`;
}

function collectDocumentStyles() {
  return Array.from(document.styleSheets)
    .flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((rule) => rule.cssText);
      } catch {
        return [];
      }
    })
    .join("\n");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[char];
  });
}
