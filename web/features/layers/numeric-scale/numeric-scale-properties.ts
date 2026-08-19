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
  "fontSizeMm",
] as const;
export type NumericScaleNumericPropertyKey = (typeof NUMERIC_SCALE_NUMERIC_PROPERTY_KEYS)[number];
export type NumericScaleNumericPropertyDefinition =
  NumericPropertyDefinition<NumericScaleNumericPropertyKey> & {
    group: "range" | "geometry" | "font";
    labelKey:
      | "valueStart"
      | "valueEnd"
      | "valueStep"
      | "scaleMultiplier"
      | "decimalPlaces"
      | "radiusOffset"
      | "fontSize";
    unit: "millimeters" | "none";
  };
export type NumericScaleColorPropertyDefinition = {
  key: "color";
  labelKey: "color";
  value: string;
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
      min: 0.01,
      max: 100,
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
    {
      key: "fontSizeMm",
      labelKey: "fontSize",
      group: "font",
      unit: "millimeters",
      snap: "distance",
      value: layer.fontSizeMm,
      min: NUMERIC_SCALE_LIMITS.fontSizeMm.min,
      max: geometry?.maxFontSizeMm ?? NUMERIC_SCALE_LIMITS.fontSizeMm.max,
      step: 0.1,
    },
  ];
}

export function getNumericScaleColorPropertyDefinition(
  layer: NumericScaleLayerDto,
): NumericScaleColorPropertyDefinition {
  return { key: "color", labelKey: "color", value: layer.color };
}
