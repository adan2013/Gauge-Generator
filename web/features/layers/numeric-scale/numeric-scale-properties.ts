import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import type { NumericScaleLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { getRangeLayerValuePropertyDefinitions } from "@/features/layers/core/range-layer-properties";
import { NUMERIC_SCALE_LIMITS } from "./numeric-scale-limits";
import { getNumericScaleGeometryBounds } from "./numeric-scale-constraints";

export const NUMERIC_SCALE_NUMERIC_PROPERTY_KEYS = [
  "valueStart",
  "valueEnd",
  "valueStep",
  "scaleMultiplier",
  "decimalPlaces",
  "radiusOffsetMm",
] as const;
export type NumericScaleNumericPropertyKey = (typeof NUMERIC_SCALE_NUMERIC_PROPERTY_KEYS)[number];
export type NumericScaleNumericPropertyDefinition =
  NumericPropertyDefinition<NumericScaleNumericPropertyKey> & {
    group: "range" | "geometry";
    labelKey:
      | "valueStart"
      | "valueEnd"
      | "valueStep"
      | "scaleMultiplier"
      | "decimalPlaces"
      | "radiusOffset";
    unit: "millimeters" | "none";
  };
export function getNumericScaleNumericPropertyDefinitions(
  layer: NumericScaleLayerDto,
  range: RangeDto | undefined,
): readonly NumericScaleNumericPropertyDefinition[] {
  const geometry = range ? getNumericScaleGeometryBounds(layer, range) : undefined;
  return [
    ...getRangeLayerValuePropertyDefinitions(layer, range),
    {
      key: "scaleMultiplier",
      labelKey: "scaleMultiplier",
      group: "range",
      unit: "none",
      snap: "none",
      value: layer.scaleMultiplier,
      min: NUMERIC_SCALE_LIMITS.scaleMultiplier.min,
      max: NUMERIC_SCALE_LIMITS.scaleMultiplier.max,
      step: 0.01,
    },
    {
      integerOnly: true,
      key: "decimalPlaces",
      labelKey: "decimalPlaces",
      group: "range",
      unit: "none",
      snap: "none",
      value: layer.decimalPlaces,
      min: 0,
      max: 4,
      step: 1,
    },
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
  ];
}
