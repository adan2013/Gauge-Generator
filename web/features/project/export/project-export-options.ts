import type { ProjectDto } from "@/features/project/project-dto/project-dto";

export const DEFAULT_EXPORT_DPI = 300;
export const EXPORT_DPI_PRESETS = [72, 96, 150, 300, 600] as const;
export const MAX_RASTER_PIXELS = 80_000_000;
export const PDF_EXPORT_MARGIN_MM = 10;

export type ProjectExportFormat = "pdf" | "png" | "svg";
export type ProjectExportScope = "combined" | "layers";
export type PdfPaperSize = "a3" | "a4";
export type PdfExportScale = "actual" | "fit";

export type ProjectExportOptions = {
  dpi: number;
  format: ProjectExportFormat;
  pdfPaperSize: PdfPaperSize;
  pdfScale: PdfExportScale;
  scope: ProjectExportScope;
};

export function getPngDimensions(project: ProjectDto, dpi: number) {
  return {
    height: Math.max(1, Math.round((project.canvas.heightMm / 25.4) * dpi)),
    width: Math.max(1, Math.round((project.canvas.widthMm / 25.4) * dpi)),
  };
}

export function isRasterSizeSupported(project: ProjectDto, dpi: number): boolean {
  const { height, width } = getPngDimensions(project, dpi);
  return width * height <= MAX_RASTER_PIXELS;
}

export function getPdfPageLayout(project: ProjectDto, paperSize: PdfPaperSize) {
  const portraitDimensions =
    paperSize === "a3" ? { height: 420, width: 297 } : { height: 297, width: 210 };
  const landscape = project.canvas.widthMm > project.canvas.heightMm;
  const pageWidth = landscape ? portraitDimensions.height : portraitDimensions.width;
  const pageHeight = landscape ? portraitDimensions.width : portraitDimensions.height;
  const availableWidth = pageWidth - PDF_EXPORT_MARGIN_MM * 2;
  const availableHeight = pageHeight - PDF_EXPORT_MARGIN_MM * 2;

  return {
    availableHeight,
    availableWidth,
    fitsActualSize:
      project.canvas.widthMm <= availableWidth && project.canvas.heightMm <= availableHeight,
    landscape,
    pageHeight,
    pageWidth,
  };
}
