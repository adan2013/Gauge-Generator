"use client";

import { useTranslations } from "next-intl";
import { ColorPropertyRow } from "@/components/molecules/color-property-row/color-property-row";
import { NumericPropertyFields } from "@/features/editor/numeric-property-fields/numeric-property-fields";
import { PropertyGroup } from "@/features/editor/property-controls/property-controls";
import {
  getTickScaleColorPropertyDefinition,
  getTickScaleNumericPropertyDefinitions,
  type TickScaleNumericPropertyDefinition,
} from "@/features/layers/tick-scale/tick-scale-properties";
import type {
  LayerDto,
  RangeDto,
  TickScaleLayerDto,
} from "@/features/project/project-dto/project-dto";

export type TickScalePropertiesEditorProps = {
  layer: TickScaleLayerDto;
  ranges: RangeDto[];
  onLayerChange: (change: Partial<LayerDto>) => void;
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function TickScalePropertiesEditor({
  layer,
  ranges,
  onLayerChange,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  snapping,
}: TickScalePropertiesEditorProps) {
  const t = useTranslations("Editor");
  const definitions = getTickScaleNumericPropertyDefinitions(
    layer,
    ranges.find((range) => range.id === layer.rangeId),
  );
  const color = getTickScaleColorPropertyDefinition(layer);
  const fields = (group: TickScaleNumericPropertyDefinition["group"]) => (
    <NumericPropertyFields
      definitions={definitions}
      getLabel={(definition) => t(`tickScale.${definition.labelKey}`)}
      getSuffix={(definition) =>
        definition.unit === "none" ? "" : t(`controls.${definition.unit}`)
      }
      group={group}
      onInteractionEnd={onHistoryTransactionEnd}
      onInteractionStart={onHistoryTransactionStart}
      onValueChange={(key, value) => onLayerChange({ [key]: value } as Partial<TickScaleLayerDto>)}
      snapping={snapping}
    />
  );
  return (
    <>
      <PropertyGroup title={t("tickScale.range")}>{fields("range")}</PropertyGroup>
      <PropertyGroup title={t("tickScale.geometry")}>{fields("geometry")}</PropertyGroup>
      <PropertyGroup title={t("tickScale.ticks")}>
        {fields("ticks")}
        <ColorPropertyRow
          label={t(`tickScale.${color.labelKey}`)}
          onChange={(value) => onLayerChange({ color: value })}
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          value={color.value}
        />
      </PropertyGroup>
    </>
  );
}
