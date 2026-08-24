import { useTranslations } from "next-intl";
import type { ProjectDto } from "@/features/project/project-dto/project-dto";
import {
  getPdfPageLayout,
  type PdfExportScale,
  type PdfPaperSize,
} from "../project-export-options";
import { CompactChoice } from "./compact-choice";
import { OptionGroup } from "./option-group";

export function PdfExportSettings({
  onPaperSizeChange,
  onScaleChange,
  paperSize,
  project,
  scale,
}: {
  onPaperSizeChange: (paperSize: PdfPaperSize) => void;
  onScaleChange: (scale: PdfExportScale) => void;
  paperSize: PdfPaperSize;
  project: ProjectDto;
  scale: PdfExportScale;
}) {
  const t = useTranslations("Editor.export");
  const pageLayout = getPdfPageLayout(project, paperSize);
  const sizeIsSupported = scale === "fit" || pageLayout.fitsActualSize;

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-ink">{t("settings")}</h3>
      <fieldset className="mb-3">
        <legend className="sr-only">{t("pdf.paperSizeLabel")}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <CompactChoice
            checked={paperSize === "a4"}
            label="A4"
            name="pdf-paper-size"
            onChange={() => onPaperSizeChange("a4")}
            value="a4"
          />
          <CompactChoice
            checked={paperSize === "a3"}
            label="A3"
            name="pdf-paper-size"
            onChange={() => onPaperSizeChange("a3")}
            value="a3"
          />
        </div>
      </fieldset>
      <OptionGroup legend={t("pdf.scaleLabel")} legendTone="field">
        <CompactChoice
          checked={scale === "actual"}
          label={t("pdf.actual")}
          name="pdf-scale"
          onChange={() => onScaleChange("actual")}
          value="actual"
        />
        <CompactChoice
          checked={scale === "fit"}
          label={t("pdf.fit")}
          name="pdf-scale"
          onChange={() => onScaleChange("fit")}
          value="fit"
        />
      </OptionGroup>
      {!sizeIsSupported ? (
        <p className="mt-2 text-xs leading-5 text-danger" role="alert">
          {t(paperSize === "a4" ? "pdf.a4TooSmall" : "pdf.a3TooSmall", {
            availableHeight: pageLayout.availableHeight,
            availableWidth: pageLayout.availableWidth,
            projectHeight: project.canvas.heightMm,
            projectWidth: project.canvas.widthMm,
          })}
        </p>
      ) : null}
    </section>
  );
}
