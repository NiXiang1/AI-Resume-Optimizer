import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const CANVAS_SCALE = 2;

export async function exportResumePdfFromElement(element: HTMLElement, fileName = "resume.pdf") {
  await waitForImages(element);

  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: CANVAS_SCALE,
    useCORS: true,
    logging: false,
    ignoreElements: (node) => node instanceof HTMLElement && (node.classList.contains("resume-overflow-hint") || node.classList.contains("a4-preview-warning")),
    windowWidth: Math.max(document.documentElement.scrollWidth, element.scrollWidth),
    windowHeight: Math.max(document.documentElement.scrollHeight, element.scrollHeight)
  });

  if (!canvas.width || !canvas.height) {
    throw new Error("简历预览为空，暂时无法生成 PDF。");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true
  });

  const pageHeightPx = Math.floor((canvas.width * A4_HEIGHT_MM) / A4_WIDTH_MM);
  const totalPages = Math.max(1, Math.ceil(canvas.height / pageHeightPx));

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    const sourceY = pageIndex * pageHeightPx;
    const sliceHeight = Math.min(pageHeightPx, canvas.height - sourceY);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;

    const context = pageCanvas.getContext("2d");
    if (!context) {
      throw new Error("浏览器暂时无法生成 PDF 画布。");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    context.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

    const imageData = pageCanvas.toDataURL("image/jpeg", 0.98);
    const pageImageHeightMm = (sliceHeight * A4_WIDTH_MM) / canvas.width;
    pdf.addImage(imageData, "JPEG", 0, 0, A4_WIDTH_MM, pageImageHeightMm, undefined, "FAST");
  }

  pdf.save(normalizePdfFileName(fileName));
}

async function waitForImages(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map((image) => {
      if (image.complete) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    })
  );

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
}

function normalizePdfFileName(fileName: string) {
  return fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`;
}
