import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import { getRangeLayerIntervalPropertyDefinitions } from "@/features/layers/core/range-layer-properties";
import type { ArcLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { getArcGeometryBounds } from "./arc-constraints";
import { ARC_LIMITS } from "./arc-limits";

export const ARC_NUMERIC_PROPERTY_KEYS = [
  "valueStart",
  "valueEnd",
  "radiusOffsetMm",
  "strokeWidthMm",
] as const;

export type ArcNumericPropertyKey = (typeof ARC_NUMERIC_PROPERTY_KEYS)[number];
export type ArcNumericPropertyDefinition = NumericPropertyDefinition<ArcNumericPropertyKey> & {
  group: "geometry" | "range";
  labelKey: "radiusOffset" | "strokeWidth" | "valueEnd" | "valueStart";
  unit: "millimeters" | "none";
};

export function getArcNumericPropertyDefinitions(
  layer: ArcLayerDto,
  range: RangeDto | undefined,
): readonly ArcNumericPropertyDefinition[] {
  const geometry = range ? getArcGeometryBounds(layer, range) : undefined;
  return [
    ...getRangeLayerIntervalPropertyDefinitions(layer, range, ARC_LIMITS.minimumValueSpan),
    {
      key: "radiusOffsetMm",
      labelKey: "radiusOffset",
      group: "geometry",
      unit: "millimeters",
      snap: "distance",
      value: layer.radiusOffsetMm,
      min: geometry?.minRadiusOffsetMm ?? -500,
      max: geometry?.maxRadiusOffsetMm ?? 500,
      step: 0.1,
    },
    {
      key: "strokeWidthMm",
      labelKey: "strokeWidth",
      group: "geometry",
      unit: "millimeters",
      snap: "none",
      value: layer.strokeWidthMm,
      min: ARC_LIMITS.strokeWidthMm.min,
      max: geometry?.maxStrokeWidthMm ?? ARC_LIMITS.strokeWidthMm.max,
      step: 0.1,
    },
  ];
}
