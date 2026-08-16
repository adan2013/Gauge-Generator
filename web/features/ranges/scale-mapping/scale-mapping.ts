import type { RangeDto } from "@/features/project/project-dto/project-dto";

export const MAX_GENERATED_SCALE_ITEMS = 200;

type ScaleSequence = {
  valueEnd: number;
  valueStart: number;
  valueStep: number;
};

const POSITION_TOLERANCE = 1e-9;

function getValueTolerance(...values: number[]) {
  return Number.EPSILON * Math.max(1, ...values.map((value) => Math.abs(value))) * 16;
}

export function getRangeScaleValueBounds(range: RangeDto): { max: number; min: number } {
  if (range.scaleDefinition.mode === "custom") {
    const values = range.scaleDefinition.points.map((point) => point.value);
    return { min: Math.min(...values), max: Math.max(...values) };
  }
  return {
    min: Math.min(range.scaleDefinition.start, range.scaleDefinition.end),
    max: Math.max(range.scaleDefinition.start, range.scaleDefinition.end),
  };
}

export function getScaleItemCount(sequence: ScaleSequence): number {
  const span = sequence.valueEnd - sequence.valueStart;
  if (span < 0 || sequence.valueStep <= 0) return 0;
  const quotient = span / sequence.valueStep;
  const nearestInteger = Math.round(quotient);
  const steps =
    Math.abs(quotient - nearestInteger) <= getValueTolerance(quotient)
      ? nearestInteger
      : Math.floor(quotient);
  return steps + 1;
}

export function getScaleValues(sequence: ScaleSequence, range: RangeDto): number[] {
  const count = Math.min(getScaleItemCount(sequence), MAX_GENERATED_SCALE_ITEMS);
  const valueTolerance = getValueTolerance(
    sequence.valueStart,
    sequence.valueEnd,
    sequence.valueStep,
  );
  const values = Array.from(
    { length: Math.max(0, count) },
    (_, index) => sequence.valueStart + sequence.valueStep * index,
  ).filter((value) => value <= sequence.valueEnd + valueTolerance);
  const first = values[0];
  const last = values.at(-1);
  if (
    Math.abs(range.openingAngle) === 360 &&
    values.length > 1 &&
    first !== undefined &&
    last !== undefined &&
    Math.abs(
      Math.abs(valueToNormalizedPosition(range, first) - valueToNormalizedPosition(range, last)) -
        1,
    ) <= POSITION_TOLERANCE
  )
    values.pop();
  return values;
}

export function valueToNormalizedPosition(range: RangeDto, value: number): number {
  const definition = range.scaleDefinition;
  if (definition.mode === "linear")
    return (value - definition.start) / (definition.end - definition.start);
  if (definition.mode === "logarithmic")
    return Math.log(value / definition.start) / Math.log(definition.end / definition.start);
  const segmentIndex = definition.points.findIndex((point) => point.value >= value);
  if (segmentIndex === -1) return definition.points.at(-1)!.position;
  if (segmentIndex <= 0) return definition.points[0].position;
  const previous = definition.points[segmentIndex - 1];
  const next = definition.points[segmentIndex];
  if (!next) return definition.points.at(-1)!.position;
  const progress = (value - previous.value) / (next.value - previous.value);
  return previous.position + (next.position - previous.position) * progress;
}
