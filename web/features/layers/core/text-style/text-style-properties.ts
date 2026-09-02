import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import { TEXT_STYLE_LIMITS } from "./text-style-limits";

export type TextStyleSizePropertyDefinition = NumericPropertyDefinition<"sizeMm"> & {
  group: "textStyle";
  unit: "millimeters";
};

export function getTextStyleSizePropertyDefinition(
  value: number,
  maximum: number = TEXT_STYLE_LIMITS.sizeMm.max,
): TextStyleSizePropertyDefinition {
  return {
    key: "sizeMm",
    group: "textStyle",
    max: Math.min(maximum, TEXT_STYLE_LIMITS.sizeMm.max),
    min: TEXT_STYLE_LIMITS.sizeMm.min,
    snap: "none",
    step: 0.1,
    unit: "millimeters",
    value,
  };
}
