import type { LabelLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { getRangeScaleValueBounds } from "@/features/ranges/scale-mapping/scale-mapping";

export type PointLabelLayout = Extract<LabelLayerDto["layout"], { mode: "point" }>;
export type TextArcLabelLayout = Extract<LabelLayerDto["layout"], { mode: "text-arc" }>;

export function createPointLabelLayout(
  overrides: Partial<PointLabelLayout> = {},
): PointLabelLayout {
  return {
    mode: "point",
    offsetXMm: 0,
    offsetYMm: 0,
    rotationDegrees: 0,
    ...overrides,
  };
}

export function createTextArcLabelLayout(
  range: RangeDto | undefined,
  overrides: Partial<TextArcLabelLayout> = {},
): TextArcLabelLayout {
  const bounds = range ? getRangeScaleValueBounds(range) : { min: 0, max: 100 };
  return {
    mode: "text-arc",
    radiusOffsetMm: 0,
    valueStart: bounds.min,
    valueEnd: bounds.max,
    alignment: "center",
    direction: "forward",
    ...overrides,
  };
}
