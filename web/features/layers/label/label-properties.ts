import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import { getLabelTextArcRadiusOffsetBounds } from "@/features/layers/label/label-constraints";
import {
  SCALE_VALUE_MAX,
  SCALE_VALUE_MIN,
  type LabelLayerDto,
  type RangeDto,
} from "@/features/project/project-dto/project-dto";
import { getRangeScaleValueBounds } from "@/features/ranges/scale-mapping/scale-mapping";
import { LABEL_LIMITS } from "./label-limits";

type PointLayout = Extract<LabelLayerDto["layout"], { mode: "point" }>;
type TextArcLayout = Extract<LabelLayerDto["layout"], { mode: "text-arc" }>;

export type LabelPointPropertyDefinition = NumericPropertyDefinition<
  "offsetXMm" | "offsetYMm" | "rotationDegrees"
> & {
  group: "point";
  labelKey: "offsetX" | "offsetY" | "rotation";
  unit: "degrees" | "millimeters";
};

export type LabelTextArcPropertyDefinition = NumericPropertyDefinition<
  "radiusOffsetMm" | "valueStart" | "valueEnd"
> & {
  group: "textArc";
  labelKey: "radiusOffset" | "valueStart" | "valueEnd";
  unit: "millimeters" | "none";
};

export function getLabelPointPropertyDefinitions(
  layout: PointLayout,
  range: RangeDto | undefined,
): readonly LabelPointPropertyDefinition[] {
  const maximumOffset = range?.radius ?? LABEL_LIMITS.pointOffsetMm.max;
  return [
    {
      key: "offsetXMm",
      group: "point",
      labelKey: "offsetX",
      max: maximumOffset,
      min: -maximumOffset,
      snap: "distance",
      step: 0.1,
      unit: "millimeters",
      value: layout.offsetXMm,
    },
    {
      key: "offsetYMm",
      group: "point",
      labelKey: "offsetY",
      max: maximumOffset,
      min: -maximumOffset,
      snap: "distance",
      step: 0.1,
      unit: "millimeters",
      value: layout.offsetYMm,
    },
    {
      integerOnly: true,
      key: "rotationDegrees",
      group: "point",
      labelKey: "rotation",
      max: LABEL_LIMITS.rotationDegrees.max,
      min: LABEL_LIMITS.rotationDegrees.min,
      snap: "angle",
      step: 1,
      unit: "degrees",
      value: layout.rotationDegrees,
    },
  ];
}

export function getLabelTextArcPropertyDefinitions(
  layout: TextArcLayout,
  range: RangeDto | undefined,
): readonly LabelTextArcPropertyDefinition[] {
  const valueBounds = range
    ? getRangeScaleValueBounds(range)
    : { min: SCALE_VALUE_MIN, max: SCALE_VALUE_MAX };
  const radiusBounds = range
    ? getLabelTextArcRadiusOffsetBounds(range)
    : {
        minRadiusOffsetMm: LABEL_LIMITS.radiusOffsetMm.min,
        maxRadiusOffsetMm: LABEL_LIMITS.radiusOffsetMm.max,
      };
  return [
    {
      integerOnly: true,
      key: "valueStart",
      group: "textArc",
      labelKey: "valueStart",
      max: Math.min(valueBounds.max - 1, layout.valueEnd - 1),
      min: valueBounds.min,
      snap: "distance",
      step: 1,
      unit: "none",
      value: layout.valueStart,
    },
    {
      integerOnly: true,
      key: "valueEnd",
      group: "textArc",
      labelKey: "valueEnd",
      max: valueBounds.max,
      min: Math.max(valueBounds.min + 1, layout.valueStart + 1),
      snap: "distance",
      step: 1,
      unit: "none",
      value: layout.valueEnd,
    },
    {
      key: "radiusOffsetMm",
      group: "textArc",
      labelKey: "radiusOffset",
      max: radiusBounds.maxRadiusOffsetMm,
      min: radiusBounds.minRadiusOffsetMm,
      snap: "distance",
      step: 0.1,
      unit: "millimeters",
      value: layout.radiusOffsetMm,
    },
  ];
}
