"use client";

import { useState } from "react";
import { Download, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { Modal } from "@/components/molecules/modal/modal";
import type { ProjectDto } from "@/features/project/project-dto/project-dto";
import {
  DEFAULT_EXPORT_DPI,
  getPdfPageLayout,
  isRasterSizeSupported,
  type PdfExportScale,
  type PdfPaperSize,
  type ProjectExportFormat,
  type ProjectExportOptions,
  type ProjectExportScope,
} from "../project-export-options";
import { ExportFormatOptions } from "./export-format-options";
import { ExportScopeOptions } from "./export-scope-options";
import { ExportSupportPanel } from "./export-support-panel";
import { PdfExportSettings } from "./pdf-export-settings";
import { PngExportSettings } from "./png-export-settings";

export function ExportModal({
  onCancel,
  onExport,
  project,
}: {
  onCancel: () => void;
  onExport: (options: ProjectExportOptions) => Promise<boolean>;
  project: ProjectDto;
}) {
  const t = useTranslations("Editor.export");
  const [dpi, setDpi] = useState(DEFAULT_EXPORT_DPI);
  const [format, setFormat] = useState<ProjectExportFormat>("svg");
  const [pdfPaperSize, setPdfPaperSize] = useState<PdfPaperSize>("a4");
  const [pdfScale, setPdfScale] = useState<PdfExportScale>("actual");
  const [scope, setScope] = useState<ProjectExportScope>("combined");
  const [isExporting, setIsExporting] = useState(false);
  const visibleLayerCount = project.layers.filter((layer) => layer.visible).length;
  const pdfPageLayout = getPdfPageLayout(project, pdfPaperSize);
  const canExport =
    !isExporting &&
    (scope === "combined" || visibleLayerCount > 0) &&
    (format !== "png" || isRasterSizeSupported(project, dpi)) &&
    (format !== "pdf" || pdfScale === "fit" || pdfPageLayout.fitsActualSize);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canExport) return;

    setIsExporting(true);
    const succeeded = await onExport({ dpi, format, pdfPaperSize, pdfScale, scope });
    if (!succeeded) setIsExporting(false);
  }

  return (
    <Modal.Root onClose={onCancel} size="wide">
      <Modal.Header description={t("description")} icon={Download} title={t("title")} />
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="grid max-h-[min(68vh,45rem)] gap-6 overflow-y-auto p-1 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.72fr)]">
            <div className="space-y-5">
              <ExportFormatOptions format={format} onChange={setFormat} />
              {format === "png" ? (
                <PngExportSettings dpi={dpi} onDpiChange={setDpi} project={project} />
              ) : null}
              {format === "pdf" ? (
                <PdfExportSettings
                  onPaperSizeChange={setPdfPaperSize}
                  onScaleChange={setPdfScale}
                  paperSize={pdfPaperSize}
                  project={project}
                  scale={pdfScale}
                />
              ) : null}
              <ExportScopeOptions
                format={format}
                onChange={setScope}
                paperSize={pdfPaperSize}
                scope={scope}
                visibleLayerCount={visibleLayerCount}
              />
            </div>
            <ExportSupportPanel />
          </div>
        </Modal.Body>
        <Modal.Actions>
          <ActionButton icon={X} label={t("cancel")} onClick={onCancel} variant="quiet" />
          <ActionButton
            disabled={!canExport}
            icon={Download}
            label={isExporting ? t("exporting") : t("confirm")}
            type="submit"
            variant="primary"
          />
        </Modal.Actions>
      </form>
    </Modal.Root>
  );
}
