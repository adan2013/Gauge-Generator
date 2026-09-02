"use client";

import { useTranslations } from "next-intl";
import { BooleanPropertyRow } from "@/components/molecules/boolean-property-row/boolean-property-row";
import { ColorPropertyRow } from "@/components/molecules/color-property-row/color-property-row";
import { NumericPropertyFields } from "@/features/editor/numeric-property-fields/numeric-property-fields";
import type { TextStyleSizePropertyDefinition } from "@/features/layers/core/text-style/text-style-properties";
import type { TextStyleDto } from "@/features/project/project-dto/project-dto";
import { FontFamilyPropertyRow } from "./font-family-property-row";

type TextStylePropertiesEditorProps = {
  definition: TextStyleSizePropertyDefinition;
  onChange: (style: TextStyleDto) => void;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
  style: TextStyleDto;
};

export function TextStylePropertiesEditor({
  definition,
  onChange,
  onInteractionEnd,
  onInteractionStart,
  snapping,
  style,
}: TextStylePropertiesEditorProps) {
  const t = useTranslations("Editor.textStyle");
  const controlsT = useTranslations("Editor.controls");
  return (
    <>
      <NumericPropertyFields
        definitions={[definition]}
        getLabel={() => t("size")}
        getSuffix={() => controlsT("millimeters")}
        group="textStyle"
        onInteractionEnd={onInteractionEnd}
        onInteractionStart={onInteractionStart}
        onValueChange={(_, sizeMm) => onChange({ ...style, sizeMm })}
        snapping={snapping}
      />
      <FontFamilyPropertyRow
        onChange={(family) =>
          onChange({
            ...style,
            font: { source: "system", family },
          })
        }
        value={style.font.family}
      />
      <BooleanPropertyRow
        checked={style.bold}
        label={t("bold")}
        onChange={(bold) => onChange({ ...style, bold })}
      />
      <BooleanPropertyRow
        checked={style.italic}
        label={t("italic")}
        onChange={(italic) => onChange({ ...style, italic })}
      />
      <BooleanPropertyRow
        checked={style.underline}
        label={t("underline")}
        onChange={(underline) => onChange({ ...style, underline })}
      />
      <ColorPropertyRow
        label={t("color")}
        onChange={(color) => onChange({ ...style, color })}
        onInteractionEnd={onInteractionEnd}
        onInteractionStart={onInteractionStart}
        value={style.color}
      />
    </>
  );
}
