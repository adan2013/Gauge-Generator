import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import {
  SCALE_VALUE_MAX,
  SCALE_VALUE_MIN,
  type RangeDto,
} from "@/features/project/project-dto/project-dto";
import { getRangeScaleValueBounds } from "@/features/ranges/scale-mapping/scale-mapping";
import type { ScaleSequence } from "@/features/ranges/scale-mapping/scale-sequence";

export type RangeLayerValuePropertyKey = "valueEnd" | "valueStart" | "valueStep";

export type RangeLayerValuePropertyDefinition =
  NumericPropertyDefinition<RangeLayerValuePropertyKey> & {
    group: "range";
    labelKey: RangeLayerValuePropertyKey;
    unit: "none";
  };

export function getRangeLayerValuePropertyDefinitions(
  sequence: ScaleSequence,
  range: RangeDto | undefined,
): readonly RangeLayerValuePropertyDefinition[] {
  const bounds = range
    ? getRangeScaleValueBounds(range)
    : { min: SCALE_VALUE_MIN, max: SCALE_VALUE_MAX };
  return [
    {
      integerOnly: true,
      key: "valueStart",
      labelKey: "valueStart",
      group: "range",
      unit: "none",
      snap: "none",
      value: sequence.valueStart,
      min: bounds.min,
      max: sequence.valueEnd,
      step: 1,
    },
    {
      integerOnly: true,
      key: "valueEnd",
      labelKey: "valueEnd",
      group: "range",
      unit: "none",
      snap: "none",
      value: sequence.valueEnd,
      min: sequence.valueStart,
      max: bounds.max,
      step: 1,
    },
    {
      integerOnly: true,
      key: "valueStep",
      labelKey: "valueStep",
      group: "range",
      unit: "none",
      snap: "none",
      value: sequence.valueStep,
      min: 1,
      max: Math.max(1, sequence.valueEnd - sequence.valueStart),
      step: 1,
    },
  ];
}
