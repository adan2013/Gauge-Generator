"use client";

import { useTranslations } from "next-intl";
import { ColorPropertyRow } from "@/components/molecules/color-property-row/color-property-row";
import { NumericPropertyFields } from "@/features/editor/numeric-property-fields/numeric-property-fields";
import { PropertyGroup } from "@/features/editor/property-controls/property-controls";
import {
  getPlanarShapeNumericPropertyDefinitions,
  getRectangleNumericPropertyDefinitions,
  type PlanarShapeNumericPropertyDefinition,
} from "@/features/layers/planar-shape/planar-shape-properties";
import type {
  CanvasDto,
  LayerDto,
  PlanarShapeLayerDto,
  RangeDto,
} from "@/features/project/project-dto/project-dto";

type PlanarShapePropertiesEditorProps = {
  canvas: CanvasDto;
  layer: PlanarShapeLayerDto;
  onLayerChange: (change: Partial<LayerDto>) => void;
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  ranges: RangeDto[];
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function PlanarShapePropertiesEditor({
  canvas,
  layer,
  onLayerChange,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  ranges,
  snapping,
}: PlanarShapePropertiesEditorProps) {
  const t = useTranslations("Editor");
  const range = ranges.find((candidate) => candidate.id === layer.rangeId);
  const definitions =
    layer.type === "rectangle"
      ? getRectangleNumericPropertyDefinitions(layer, canvas, range)
      : getPlanarShapeNumericPropertyDefinitions(layer, canvas, range);
  const fields = (group: PlanarShapeNumericPropertyDefinition["group"]) => (
    <NumericPropertyFields
      definitions={definitions}
      getLabel={(definition) => t(`shape.${definition.labelKey}`)}
      getSuffix={(definition) => t(`controls.${definition.unit}`)}
      group={group}
      onInteractionEnd={onHistoryTransactionEnd}
      onInteractionStart={onHistoryTransactionStart}
      onValueChange={(key, value) => {
        if (key === "borderWidthMm")
          return onLayerChange({
            style: { ...layer.style, borderWidthMm: value },
          } as Partial<PlanarShapeLayerDto>);
        if (key === "cornerRadiusPercent" && layer.type === "rectangle")
          return onLayerChange({ cornerRadiusPercent: value });
        onLayerChange({
          geometry: { ...layer.geometry, [key]: value },
        } as Partial<PlanarShapeLayerDto>);
      }}
      snapping={snapping}
    />
  );
  const colorProps = {
    onInteractionEnd: onHistoryTransactionEnd,
    onInteractionStart: onHistoryTransactionStart,
  };
  return (
    <>
      <PropertyGroup title={t("shape.groups.position")}>{fields("position")}</PropertyGroup>
      <PropertyGroup title={t("shape.groups.size")}>{fields("size")}</PropertyGroup>
      <PropertyGroup title={t("shape.groups.appearance")}>
        {fields("appearance")}
        <ColorPropertyRow
          {...colorProps}
          label={t("shape.fillColor")}
          onChange={(fillColor) =>
            onLayerChange({ style: { ...layer.style, fillColor } } as Partial<PlanarShapeLayerDto>)
          }
          value={layer.style.fillColor}
        />
        <ColorPropertyRow
          {...colorProps}
          label={t("shape.borderColor")}
          onChange={(borderColor) =>
            onLayerChange({
              style: { ...layer.style, borderColor },
            } as Partial<PlanarShapeLayerDto>)
          }
          value={layer.style.borderColor}
        />
      </PropertyGroup>
    </>
  );
}
