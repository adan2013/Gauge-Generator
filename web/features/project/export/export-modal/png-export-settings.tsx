import { useTranslations } from "next-intl";
import type { ProjectDto } from "@/features/project/project-dto/project-dto";
import {
  EXPORT_DPI_PRESETS,
  getPngDimensions,
  isRasterSizeSupported,
} from "../project-export-options";
import { CompactChoice } from "./compact-choice";
import { OptionGroup } from "./option-group";

export function PngExportSettings({
  dpi,
  onDpiChange,
  project,
}: {
  dpi: number;
  onDpiChange: (dpi: number) => void;
  project: ProjectDto;
}) {
  const t = useTranslations("Editor.export");
  const dimensions = getPngDimensions(project, dpi);
  const sizeIsSupported = isRasterSizeSupported(project, dpi);

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">{t("settings")}</legend>
      <OptionGroup columns="dpi" legend={t("png.dpi")} legendTone="field">
        {EXPORT_DPI_PRESETS.map((preset) => (
          <CompactChoice
            checked={dpi === preset}
            key={preset}
            label={String(preset)}
            name="export-dpi"
            onChange={() => onDpiChange(preset)}
            value={String(preset)}
          />
        ))}
      </OptionGroup>
      <p className="mt-2 text-xs text-muted">
        {t("png.outputResolution")}: {t("png.resolution", dimensions)}
      </p>
      {!sizeIsSupported ? (
        <p className="mt-2 text-xs leading-5 text-danger" role="alert">
          {t("png.tooLarge")}
        </p>
      ) : null}
    </fieldset>
  );
}
