import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import {
  SCALE_VALUE_MAX,
  SCALE_VALUE_MIN,
  type RangeDto,
} from "@/features/project/project-dto/project-dto";
import { getRangeScaleValueBounds } from "@/features/ranges/scale-mapping/scale-mapping";
import type { ScaleInterval, ScaleSequence } from "@/features/ranges/scale-mapping/scale-sequence";

export type RangeLayerValuePropertyKey = "valueEnd" | "valueStart" | "valueStep";

export type RangeLayerValuePropertyDefinition =
  NumericPropertyDefinition<RangeLayerValuePropertyKey> & {
    group: "range";
    labelKey: RangeLayerValuePropertyKey;
    unit: "none";
  };

export type RangeLayerIntervalPropertyDefinition = Omit<
  RangeLayerValuePropertyDefinition,
  "key" | "labelKey"
> & {
  key: "valueEnd" | "valueStart";
  labelKey: "valueEnd" | "valueStart";
};

export function getRangeLayerIntervalPropertyDefinitions(
  interval: ScaleInterval,
  range: RangeDto | undefined,
  minimumSpan = 0,
): readonly RangeLayerIntervalPropertyDefinition[] {
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
      value: interval.valueStart,
      min: bounds.min,
      max: interval.valueEnd - minimumSpan,
      step: 1,
    },
    {
      integerOnly: true,
      key: "valueEnd",
      labelKey: "valueEnd",
      group: "range",
      unit: "none",
      snap: "none",
      value: interval.valueEnd,
      min: interval.valueStart + minimumSpan,
      max: bounds.max,
      step: 1,
    },
  ];
}

export function getRangeLayerValuePropertyDefinitions(
  sequence: ScaleSequence,
  range: RangeDto | undefined,
): readonly RangeLayerValuePropertyDefinition[] {
  const intervalDefinitions = getRangeLayerIntervalPropertyDefinitions(sequence, range);
  return [
    ...intervalDefinitions,
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
