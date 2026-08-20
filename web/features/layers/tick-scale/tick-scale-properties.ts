import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import type { RangeDto, TickScaleLayerDto } from "@/features/project/project-dto/project-dto";
import { getRangeLayerValuePropertyDefinitions } from "@/features/layers/core/range-layer-properties";
import { getTickScaleGeometryBounds } from "./tick-scale-constraints";
import { TICK_SCALE_LIMITS } from "./tick-scale-limits";

export const TICK_SCALE_NUMERIC_PROPERTY_KEYS = [
  "valueStart",
  "valueEnd",
  "valueStep",
  "tickLengthMm",
  "tickWidthMm",
  "radiusOffsetMm",
] as const;

export type TickScaleNumericPropertyKey = (typeof TICK_SCALE_NUMERIC_PROPERTY_KEYS)[number];
export type TickScaleNumericPropertyDefinition =
  NumericPropertyDefinition<TickScaleNumericPropertyKey> & {
    group: "geometry" | "range" | "ticks";
    labelKey: "radiusOffset" | "tickLength" | "tickWidth" | "valueEnd" | "valueStart" | "valueStep";
    unit: "millimeters" | "none";
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
  return [
    ...getRangeLayerValuePropertyDefinitions(layer, range),
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
      key: "tickLengthMm",
      labelKey: "tickLength",
      group: "ticks",
      unit: "millimeters",
      snap: "distance",
      value: layer.tickLengthMm,
      min: TICK_SCALE_LIMITS.tickLengthMm.min,
      max: bounds?.maxTickLengthMm ?? TICK_SCALE_LIMITS.tickLengthMm.max,
      step: 0.1,
    },
    {
      key: "tickWidthMm",
      labelKey: "tickWidth",
      group: "ticks",
      unit: "millimeters",
      snap: "none",
      value: layer.tickWidthMm,
      min: TICK_SCALE_LIMITS.tickWidthMm.min,
      max: bounds?.maxTickWidthMm ?? TICK_SCALE_LIMITS.tickWidthMm.max,
      step: 0.1,
    },
  ];
}

export function getTickScaleColorPropertyDefinition(
  layer: TickScaleLayerDto,
): TickScaleColorPropertyDefinition {
  return { key: "color", labelKey: "color", value: layer.color };
}
