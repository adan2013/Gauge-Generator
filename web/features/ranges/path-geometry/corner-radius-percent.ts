import type { NumericPropertyDefinition } from "@/features/layers/core/layer";

export const CORNER_RADIUS_PERCENT = {
  defaultValue: 50,
  max: 50,
  min: 1,
  step: 1,
} as const;

export type CornerRadiusPercentPropertyDefinition =
  NumericPropertyDefinition<"cornerRadiusPercent"> & {
    group: "geometry";
    labelKey: "cornerRadius";
    unit: "percent";
  };

export function getCornerRadiusPercentPropertyDefinition(
  value: number,
): CornerRadiusPercentPropertyDefinition {
  return {
    key: "cornerRadiusPercent",
    labelKey: "cornerRadius",
    group: "geometry",
    unit: "percent",
    snap: "none",
    value,
    min: CORNER_RADIUS_PERCENT.min,
    max: CORNER_RADIUS_PERCENT.max,
    step: CORNER_RADIUS_PERCENT.step,
  };
}
