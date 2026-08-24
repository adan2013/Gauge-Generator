import { FileType2, Layers3 } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  PdfPaperSize,
  ProjectExportFormat,
  ProjectExportScope,
} from "../project-export-options";
import { ChoiceCard } from "./choice-card";
import { OptionGroup } from "./option-group";

export function ExportScopeOptions({
  format,
  onChange,
  paperSize,
  scope,
  visibleLayerCount,
}: {
  format: ProjectExportFormat;
  onChange: (scope: ProjectExportScope) => void;
  paperSize: PdfPaperSize;
  scope: ProjectExportScope;
  visibleLayerCount: number;
}) {
  const t = useTranslations("Editor.export");
  const exportsPdfPages = format === "pdf";

  return (
    <>
      <OptionGroup legend={t("scope.label")}>
        <ChoiceCard
          checked={scope === "combined"}
          description={t("scope.combinedDescription")}
          icon={<FileType2 aria-hidden="true" size={20} />}
          label={t("scope.combined")}
          name="export-scope"
          onChange={() => onChange("combined")}
          value="combined"
        />
        <ChoiceCard
          checked={scope === "layers"}
          description={t(
            exportsPdfPages ? "scope.pdfLayersDescription" : "scope.layersDescription",
            { count: visibleLayerCount },
          )}
          icon={<Layers3 aria-hidden="true" size={20} />}
          label={t(exportsPdfPages ? "scope.pdfLayers" : "scope.layers")}
          name="export-scope"
          onChange={() => onChange("layers")}
          value="layers"
        />
      </OptionGroup>
      {scope === "layers" ? (
        <p className="rounded-lg bg-app p-3 text-xs leading-5 text-muted">
          {exportsPdfPages
            ? t("scope.pdfLayersNote", { size: paperSize.toUpperCase() })
            : t("scope.layersNote")}
        </p>
      ) : null}
    </>
  );
}
