import { FileArchive, FileImage, FileType2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProjectExportFormat } from "../project-export-options";
import { CompactChoice } from "./compact-choice";
import { OptionGroup } from "./option-group";

export function ExportFormatOptions({
  format,
  onChange,
}: {
  format: ProjectExportFormat;
  onChange: (format: ProjectExportFormat) => void;
}) {
  const t = useTranslations("Editor.export");

  return (
    <OptionGroup columns="formats" legend={t("format.label")}>
      <CompactChoice
        checked={format === "svg"}
        icon={<FileType2 aria-hidden="true" size={20} />}
        label={t("format.svg")}
        name="export-format"
        onChange={() => onChange("svg")}
        value="svg"
      />
      <CompactChoice
        checked={format === "png"}
        icon={<FileImage aria-hidden="true" size={20} />}
        label={t("format.png")}
        name="export-format"
        onChange={() => onChange("png")}
        value="png"
      />
      <CompactChoice
        checked={format === "pdf"}
        icon={<FileArchive aria-hidden="true" size={20} />}
        label={t("format.pdf")}
        name="export-format"
        onChange={() => onChange("pdf")}
        value="pdf"
      />
    </OptionGroup>
  );
}
