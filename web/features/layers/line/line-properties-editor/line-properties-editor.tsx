"use client";

import { useTranslations } from "next-intl";
import { BooleanPropertyRow } from "@/components/molecules/boolean-property-row/boolean-property-row";
import { ColorPropertyRow } from "@/components/molecules/color-property-row/color-property-row";
import { NumericPropertyFields } from "@/features/editor/numeric-property-fields/numeric-property-fields";
import { PropertyGroup } from "@/features/editor/property-controls/property-controls";
import {
  getLineNumericPropertyDefinitions,
  type LineNumericPropertyDefinition,
} from "@/features/layers/line/line-properties";
import type {
  CanvasDto,
  LayerDto,
  LineLayerDto,
  RangeDto,
} from "@/features/project/project-dto/project-dto";

type LinePropertiesEditorProps = {
  canvas: CanvasDto;
  layer: LineLayerDto;
  onLayerChange: (change: Partial<LayerDto>) => void;
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  ranges: RangeDto[];
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function LinePropertiesEditor({
  canvas,
  layer,
  onLayerChange,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  ranges,
  snapping,
}: LinePropertiesEditorProps) {
  const t = useTranslations("Editor");
  const definitions = getLineNumericPropertyDefinitions(
    layer,
    canvas,
    ranges.find((range) => range.id === layer.rangeId),
  );
  const fields = (group: LineNumericPropertyDefinition["group"]) => (
    <NumericPropertyFields
      definitions={definitions}
      getLabel={(definition) => t(`line.${definition.labelKey}`)}
      getSuffix={(definition) => t(`controls.${definition.unit}`)}
      group={group}
      onInteractionEnd={onHistoryTransactionEnd}
      onInteractionStart={onHistoryTransactionStart}
      onValueChange={(key, value) => {
        if (key === "strokeWidthMm")
          return onLayerChange({
            style: { ...layer.style, strokeWidthMm: value },
          } as Partial<LineLayerDto>);
        onLayerChange({
          geometry: { ...layer.geometry, [key]: value },
        } as Partial<LineLayerDto>);
      }}
      snapping={snapping}
    />
  );
  return (
    <>
      <PropertyGroup title={t("line.groups.position")}>{fields("position")}</PropertyGroup>
      <PropertyGroup title={t("line.groups.geometry")}>{fields("geometry")}</PropertyGroup>
      <PropertyGroup title={t("line.groups.appearance")}>
        {fields("appearance")}
        <BooleanPropertyRow
          checked={layer.style.roundedEnds}
          label={t("line.roundedEnds")}
          onChange={(roundedEnds) =>
            onLayerChange({ style: { ...layer.style, roundedEnds } } as Partial<LineLayerDto>)
          }
        />
        <ColorPropertyRow
          label={t("line.color")}
          onChange={(color) =>
            onLayerChange({ style: { ...layer.style, color } } as Partial<LineLayerDto>)
          }
          onInteractionEnd={onHistoryTransactionEnd}
          onInteractionStart={onHistoryTransactionStart}
          value={layer.style.color}
        />
      </PropertyGroup>
    </>
  );
}
