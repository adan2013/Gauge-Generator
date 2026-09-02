import type { ProjectDto } from "@/features/project/project-dto/project-dto";
import { resolveLucideIconDefinitions } from "@/features/layers/icon/lucide-icon-resources";
import { sanitizeFilename } from "@/features/project/project-file/project-filename";
import {
  getProjectIconNames,
  renderProjectSvgDocument,
} from "@/features/project/rendering/project-svg";
import {
  PDF_EXPORT_MARGIN_MM,
  getPngDimensions,
  type PdfExportScale,
  type ProjectExportFormat,
  type ProjectExportOptions,
} from "./project-export-options";
import { createProjectExportTargets } from "./project-export-targets";

export async function exportProject(
  project: ProjectDto,
  options: ProjectExportOptions,
): Promise<void> {
  const iconDefinitions = await resolveLucideIconDefinitions(getProjectIconNames(project));
  const targets = createProjectExportTargets(project, options.scope);
  if (targets.length === 0) throw new Error("No visible layers to export");

  const renderedTargets = targets.map((target) => ({
    ...target,
    svg: renderProjectSvgDocument(project, iconDefinitions, {
      layerIds: target.layerIds,
      transparentBackground: target.transparentBackground,
    }),
  }));

  if (options.format === "pdf") {
    downloadBlob(
      await renderPdf(
        renderedTargets.map((target) => target.svg),
        project,
        options.pdfPaperSize,
        options.pdfScale,
      ),
      `${sanitizeFilename(project.meta.title)}.pdf`,
    );
    return;
  }

  const files: Array<{ blob: Blob; filename: string }> = [];
  for (const target of renderedTargets) {
    files.push({
      blob: await createExportBlob(target.svg, project, options.format, options.dpi),
      filename: `${target.filename}.${options.format}`,
    });
  }

  if (files.length === 1) {
    downloadBlob(files[0].blob, files[0].filename);
    return;
  }

  const { default: JSZip } = await import("jszip");
  const archive = new JSZip();
  for (const file of files) archive.file(file.filename, file.blob);
  downloadBlob(
    await archive.generateAsync({ type: "blob" }),
    `${sanitizeFilename(project.meta.title)}-${options.format}-layers.zip`,
  );
}

async function createExportBlob(
  svg: string,
  project: ProjectDto,
  format: Exclude<ProjectExportFormat, "pdf">,
  dpi: number,
): Promise<Blob> {
  if (format === "svg") return new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  return rasterizeSvg(svg, getPngDimensions(project, dpi));
}

async function rasterizeSvg(
  svg: string,
  dimensions: { height: number; width: number },
): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas rendering is unavailable");
    context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
    return await canvasToBlob(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image), { once: true });
    image.addEventListener("error", () => reject(new Error("SVG rasterization failed")), {
      once: true,
    });
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG encoding failed"));
    }, "image/png");
  });
}

async function renderPdf(
  pages: readonly string[],
  project: ProjectDto,
  paperSize: "a3" | "a4",
  scaleMode: PdfExportScale,
): Promise<Blob> {
  const [{ jsPDF }, { svg2pdf }] = await Promise.all([import("jspdf"), import("svg2pdf.js")]);
  const landscape = project.canvas.widthMm > project.canvas.heightMm;
  const pdf = new jsPDF({
    format: paperSize,
    orientation: landscape ? "landscape" : "portrait",
    unit: "mm",
  });
  for (const [index, svg] of pages.entries()) {
    if (index > 0) pdf.addPage(paperSize, landscape ? "landscape" : "portrait");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const scale =
      scaleMode === "fit"
        ? Math.min(
            (pageWidth - PDF_EXPORT_MARGIN_MM * 2) / project.canvas.widthMm,
            (pageHeight - PDF_EXPORT_MARGIN_MM * 2) / project.canvas.heightMm,
          )
        : 1;
    const width = project.canvas.widthMm * scale;
    const height = project.canvas.heightMm * scale;
    const element = new DOMParser().parseFromString(svg, "image/svg+xml").documentElement;
    await svg2pdf(element, pdf, {
      height,
      width,
      x: (pageWidth - width) / 2,
      y: (pageHeight - height) / 2,
    });
  }
  return pdf.output("blob");
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
