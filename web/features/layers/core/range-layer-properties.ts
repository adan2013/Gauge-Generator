import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import type { RangeDto } from "@/features/project/project-dto/project-dto";
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
  const bounds = range ? getRangeScaleValueBounds(range) : { min: -1_000_000, max: 1_000_000 };
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
