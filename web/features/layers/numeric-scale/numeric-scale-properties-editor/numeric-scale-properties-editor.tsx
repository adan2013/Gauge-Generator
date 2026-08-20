"use client";

import { useTranslations } from "next-intl";
import { BooleanPropertyRow } from "@/components/molecules/boolean-property-row/boolean-property-row";
import { ColorPropertyRow } from "@/components/molecules/color-property-row/color-property-row";
import { SelectPropertyRow } from "@/components/molecules/select-property-row/select-property-row";
import { NumericPropertyFields } from "@/features/editor/numeric-property-fields/numeric-property-fields";
import { PropertyGroup } from "@/features/editor/property-controls/property-controls";
import {
  getNumericScaleColorPropertyDefinition,
  getNumericScaleNumericPropertyDefinitions,
  type NumericScaleNumericPropertyDefinition,
} from "@/features/layers/numeric-scale/numeric-scale-properties";
import type {
  LayerDto,
  NumericScaleLayerDto,
  RangeDto,
} from "@/features/project/project-dto/project-dto";

export type NumericScalePropertiesEditorProps = {
  layer: NumericScaleLayerDto;
  ranges: RangeDto[];
  onLayerChange: (change: Partial<LayerDto>) => void;
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function NumericScalePropertiesEditor({
  layer,
  ranges,
  onLayerChange,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  snapping,
}: NumericScalePropertiesEditorProps) {
  const t = useTranslations("Editor");
  const definitions = getNumericScaleNumericPropertyDefinitions(
    layer,
    ranges.find((range) => range.id === layer.rangeId),
  );
  const color = getNumericScaleColorPropertyDefinition(layer);
  const fields = (group: NumericScaleNumericPropertyDefinition["group"]) => (
    <NumericPropertyFields
      definitions={definitions}
      getLabel={(definition) => t(`numericScale.${definition.labelKey}`)}
      getSuffix={(definition) =>
        definition.unit === "none" ? "" : t(`controls.${definition.unit}`)
      }
      group={group}
      onInteractionEnd={onHistoryTransactionEnd}
      onInteractionStart={onHistoryTransactionStart}
      onValueChange={(key, value) =>
        onLayerChange({ [key]: value } as Partial<NumericScaleLayerDto>)
      }
      snapping={snapping}
    />
  );
  return (
    <>
      <PropertyGroup title={t("numericScale.range")}>{fields("range")}</PropertyGroup>
      <PropertyGroup title={t("numericScale.geometry")}>{fields("geometry")}</PropertyGroup>
      <PropertyGroup title={t("numericScale.font")}>
        {fields("font")}
        <SelectPropertyRow
          label={t("numericScale.fontFamily")}
          onChange={(fontFamily) => onLayerChange({ fontFamily } as Partial<NumericScaleLayerDto>)}
          options={["Arial", "Georgia", "Courier New"].map((value) => ({ label: value, value }))}
          value={layer.fontFamily}
        />
        <BooleanPropertyRow
          checked={layer.bold}
          label={t("numericScale.bold")}
          onChange={(bold) => onLayerChange({ bold } as Partial<NumericScaleLayerDto>)}
        />
        <BooleanPropertyRow
          checked={layer.italic}
          label={t("numericScale.italic")}
          onChange={(italic) => onLayerChange({ italic } as Partial<NumericScaleLayerDto>)}
        />
        <BooleanPropertyRow
          checked={layer.underline}
          label={t("numericScale.underline")}
          onChange={(underline) => onLayerChange({ underline } as Partial<NumericScaleLayerDto>)}
        />
        <BooleanPropertyRow
          checked={layer.rotated}
          label={t("numericScale.rotated")}
          onChange={(rotated) => onLayerChange({ rotated } as Partial<NumericScaleLayerDto>)}
        />
        <ColorPropertyRow
          label={t(`numericScale.${color.labelKey}`)}
          onChange={(value) => onLayerChange({ color: value })}
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          value={color.value}
        />
      </PropertyGroup>
    </>
  );
}
