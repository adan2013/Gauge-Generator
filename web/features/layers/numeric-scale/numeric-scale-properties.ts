import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import type { NumericScaleLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { getScaleValueBounds } from "@/features/layers/tick-scale/tick-scale-constraints";
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
  const values = range ? getScaleValueBounds(range) : { min: -1_000_000, max: 1_000_000 };
  return [
    {
      key: "valueStart",
      labelKey: "valueStart",
      group: "range",
      unit: "none",
      snap: "none",
      value: layer.valueStart,
      min: values.min,
      max: layer.valueEnd,
      step: 1,
    },
    {
      key: "valueEnd",
      labelKey: "valueEnd",
      group: "range",
      unit: "none",
      snap: "none",
      value: layer.valueEnd,
      min: layer.valueStart,
      max: values.max,
      step: 1,
    },
    {
      key: "valueStep",
      labelKey: "valueStep",
      group: "range",
      unit: "none",
      snap: "none",
      value: layer.valueStep,
      min: Number.EPSILON,
      max: Math.max(Number.EPSILON, layer.valueEnd - layer.valueStart),
      step: 1,
    },
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
      min: 0.5,
      max: geometry?.maxFontSizeMm ?? 50,
      step: 0.1,
    },
  ];
}

export function getNumericScaleColorPropertyDefinition(
  layer: NumericScaleLayerDto,
): NumericScaleColorPropertyDefinition {
  return { key: "color", labelKey: "color", value: layer.color };
}
