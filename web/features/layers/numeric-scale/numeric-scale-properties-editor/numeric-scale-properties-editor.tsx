"use client";

import { useTranslations } from "next-intl";
import { BooleanPropertyRow } from "@/components/molecules/boolean-property-row/boolean-property-row";
import { ColorPropertyRow } from "@/components/molecules/color-property-row/color-property-row";
import { SelectPropertyRow } from "@/components/molecules/select-property-row/select-property-row";
import {
  PropertyGroup,
  RangePropertyRow,
} from "@/features/editor/property-controls/property-controls";
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
  const update = (definition: NumericScaleNumericPropertyDefinition) => (value: string) => {
    const raw = Number(value);
    const increment = definition.snap === "angle" ? snapping.angleDegrees : snapping.distanceMm;
    const next =
      snapping.enabled && definition.snap !== "none"
        ? Math.round(raw / increment) * increment
        : raw;
    onLayerChange({
      [definition.key]: Math.min(definition.max, Math.max(definition.min, next)),
    } as Partial<NumericScaleLayerDto>);
  };
  const fields = (group: NumericScaleNumericPropertyDefinition["group"]) =>
    definitions
      .filter((definition) => definition.group === group)
      .map((definition) => (
        <RangePropertyRow
          key={definition.key}
          label={t(`numericScale.${definition.labelKey}`)}
          max={definition.max}
          min={definition.min}
          onChange={update(definition)}
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          step={definition.step}
          suffix={definition.unit === "none" ? "" : t(`controls.${definition.unit}`)}
          value={String(definition.value)}
        />
      ));
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
