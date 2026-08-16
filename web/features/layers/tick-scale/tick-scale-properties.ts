import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import type { RangeDto, TickScaleLayerDto } from "@/features/project/project-dto/project-dto";
import { getScaleValueBounds, getTickScaleGeometryBounds } from "./tick-scale-constraints";

export const TICK_SCALE_NUMERIC_PROPERTY_KEYS = [
  "valueStart",
  "valueEnd",
  "valueStep",
  "tickLengthMm",
  "tickWidthMm",
  "radiusOffsetMm",
  "cornerRadiusPercent",
] as const;

export type TickScaleNumericPropertyKey = (typeof TICK_SCALE_NUMERIC_PROPERTY_KEYS)[number];
export type TickScaleNumericPropertyDefinition =
  NumericPropertyDefinition<TickScaleNumericPropertyKey> & {
    group: "geometry" | "range" | "ticks";
    labelKey:
      | "cornerRadius"
      | "radiusOffset"
      | "tickLength"
      | "tickWidth"
      | "valueEnd"
      | "valueStart"
      | "valueStep";
    unit: "millimeters" | "none" | "percent";
  };
export type TickScaleColorPropertyDefinition = {
  key: "color";
  labelKey: "color";
  value: string;
};

export function getTickScaleNumericPropertyDefinitions(
  layer: TickScaleLayerDto,
  range: RangeDto | undefined,
): readonly TickScaleNumericPropertyDefinition[] {
  const bounds = range ? getTickScaleGeometryBounds(layer, range) : undefined;
  const valueBounds = range ? getScaleValueBounds(range) : { min: -1_000_000, max: 1_000_000 };
  return [
    {
      key: "valueStart",
      labelKey: "valueStart",
      group: "range",
      unit: "none",
      snap: "none",
      value: layer.valueStart,
      min: valueBounds.min,
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
      max: valueBounds.max,
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
      key: "radiusOffsetMm",
      labelKey: "radiusOffset",
      group: "geometry",
      unit: "millimeters",
      snap: "distance",
      value: layer.radiusOffsetMm,
      min: bounds?.minRadiusOffsetMm ?? -500,
      max: bounds?.maxRadiusOffsetMm ?? 500,
      step: 0.1,
    },
    {
      key: "cornerRadiusPercent",
      labelKey: "cornerRadius",
      group: "geometry",
      unit: "percent",
      snap: "none",
      value: layer.cornerRadiusPercent,
      min: 0,
      max: 50,
      step: 1,
    },
    {
      key: "tickLengthMm",
      labelKey: "tickLength",
      group: "ticks",
      unit: "millimeters",
      snap: "distance",
      value: layer.tickLengthMm,
      min: 0.2,
      max: bounds?.maxTickLengthMm ?? 50,
      step: 0.1,
    },
    {
      key: "tickWidthMm",
      labelKey: "tickWidth",
      group: "ticks",
      unit: "millimeters",
      snap: "none",
      value: layer.tickWidthMm,
      min: 0.1,
      max: bounds?.maxTickWidthMm ?? 10,
      step: 0.1,
    },
  ];
}

export function getTickScaleColorPropertyDefinition(
  layer: TickScaleLayerDto,
): TickScaleColorPropertyDefinition {
  return { key: "color", labelKey: "color", value: layer.color };
}
