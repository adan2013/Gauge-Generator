import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import {
  getRangeRadiusMaximum,
  type CanvasDto,
  type RangeDto,
} from "@/features/project/project-dto/project-dto";

export const RANGE_NUMERIC_PROPERTY_KEYS = [
  "centerX",
  "centerY",
  "radius",
  "angleStart",
  "openingAngle",
] as const;

export type RangeNumericPropertyKey = (typeof RANGE_NUMERIC_PROPERTY_KEYS)[number];
export type RangeNumericPropertyDefinition = NumericPropertyDefinition<RangeNumericPropertyKey> & {
  group: "geometry" | "position";
  labelKey: "angleStart" | "centerX" | "centerY" | "openingAngle" | "radius";
  unit: "degrees" | "millimeters";
};
export type ScalePropertyDefinition = NumericPropertyDefinition<"end" | "start"> & {
  labelKey: "scaleEnd" | "scaleStart";
};

export function getRangeNumericPropertyDefinitions(
  range: RangeDto,
  canvas: CanvasDto,
): readonly RangeNumericPropertyDefinition[] {
  return [
    {
      key: "centerX",
      labelKey: "centerX",
      group: "position",
      unit: "millimeters",
      snap: "distance",
      value: range.centerX,
      min: 0,
      max: canvas.widthMm,
      step: 1,
    },
    {
      key: "centerY",
      labelKey: "centerY",
      group: "position",
      unit: "millimeters",
      snap: "distance",
      value: range.centerY,
      min: 0,
      max: canvas.heightMm,
      step: 1,
    },
    {
      key: "radius",
      labelKey: "radius",
      group: "geometry",
      unit: "millimeters",
      snap: "distance",
      value: range.radius,
      min: 5,
      max: getRangeRadiusMaximum(canvas),
      step: 1,
    },
    {
      key: "angleStart",
      labelKey: "angleStart",
      group: "geometry",
      unit: "degrees",
      snap: "angle",
      value: range.angleStart,
      min: 0,
      max: 360,
      step: 1,
    },
    {
      key: "openingAngle",
      labelKey: "openingAngle",
      group: "geometry",
      unit: "degrees",
      snap: "angle",
      value: range.openingAngle,
      min: -360,
      max: 360,
      step: 1,
    },
  ];
}

export function getScalePropertyDefinitions(range: RangeDto): readonly ScalePropertyDefinition[] {
  const definition = range.scaleDefinition;
  if (definition.mode === "custom") return [];
  const minimum = definition.mode === "logarithmic" ? 1 : -1_000_000;
  return [
    {
      integerOnly: true,
      key: "start",
      labelKey: "scaleStart",
      snap: "none",
      value: definition.start,
      min: minimum,
      max: definition.end,
      step: 1,
    },
    {
      integerOnly: true,
      key: "end",
      labelKey: "scaleEnd",
      snap: "none",
      value: definition.end,
      min: definition.start,
      max: 1_000_000,
      step: 1,
    },
  ];
}
