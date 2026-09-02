"use client";

import { FolderSearch } from "lucide-react";
import { useId } from "react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { FieldRow } from "@/components/molecules/field-row/field-row";
import { useLocalFonts } from "@/features/local-fonts/local-fonts-provider";
import { SYSTEM_FONT_FAMILIES } from "@/features/layers/core/text-style/text-style-limits";

type FontFamilyPropertyRowProps = {
  onChange: (family: string) => void;
  value: string;
};

export function FontFamilyPropertyRow({ onChange, value }: FontFamilyPropertyRowProps) {
  const inputId = useId();
  const t = useTranslations("Editor.textStyle");
  const { families, loadLocalFonts, status } = useLocalFonts();
  const options = [...new Set([...SYSTEM_FONT_FAMILIES, value, ...families])];
  const errorKey =
    status === "unsupported"
      ? "localFontsUnsupported"
      : status === "denied"
        ? "localFontsDenied"
        : status === "error"
          ? "localFontsError"
          : null;

  return (
    <FieldRow htmlFor={inputId} label={t("font")}>
      <div className="space-y-2">
        <select
          aria-label={t("font")}
          className="h-9 w-full rounded-md border border-border bg-app px-2 text-right text-xs text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30"
          id={inputId}
          onChange={(event) => onChange(event.target.value)}
          style={{ fontFamily: value }}
          value={value}
        >
          {options.map((family) => (
            <option key={family} style={{ fontFamily: family }} value={family}>
              {family}
            </option>
          ))}
        </select>
        <ActionButton
          className="min-h-7 w-full px-2 text-xs"
          disabled={status === "loading"}
          icon={FolderSearch}
          label={
            status === "loading"
              ? t("loadingLocalFonts")
              : status === "loaded"
                ? t("reloadLocalFonts", { count: families.length })
                : t("loadLocalFonts")
          }
          onClick={() => void loadLocalFonts()}
          variant="quiet"
        />
        {errorKey ? (
          <p className="text-xs leading-4 text-danger" role="alert">
            {t(errorKey)}
          </p>
        ) : null}
      </div>
    </FieldRow>
  );
}
