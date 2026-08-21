import type { RangeDto } from "@/features/project/project-dto/project-dto";
import { clamp } from "@/lib/geometry/geometry";
import { MAX_GENERATED_SCALE_ITEMS } from "./scale-constants";
import { getRangeScaleValueBounds, valueToNormalizedPosition } from "./scale-mapping";

export type ScaleInterval = {
  valueEnd: number;
  valueStart: number;
};

export type ScaleSequence = ScaleInterval & {
  valueStep: number;
};

export type ScaleDistributionItem = {
  angle: number;
  position: number;
  value: number;
};

const POSITION_TOLERANCE = 1e-9;

function getValueTolerance(...values: number[]) {
  return Number.EPSILON * Math.max(1, ...values.map((value) => Math.abs(value))) * 16;
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

export function getScaleDistribution(
  sequence: ScaleSequence,
  range: RangeDto,
): ScaleDistributionItem[] {
  return getScaleValues(sequence, range).map((value) => {
    const position = valueToNormalizedPosition(range, value);
    return {
      angle: range.angleStart + range.openingAngle * position,
      position,
      value,
    };
  });
}

export function constrainScaleSequenceToRange<TSequence extends ScaleSequence>(
  sequence: TSequence,
  range: RangeDto,
): TSequence {
  return constrainScaleIntervalToRange(sequence, range);
}

export function constrainScaleIntervalToRange<TInterval extends ScaleInterval>(
  interval: TInterval,
  range: RangeDto,
  minimumSpan = 0,
): TInterval {
  const bounds = getRangeScaleValueBounds(range);
  let valueStart = clamp(interval.valueStart, bounds.min, bounds.max);
  let valueEnd = clamp(interval.valueEnd, valueStart, bounds.max);
  if (valueEnd - valueStart < minimumSpan) {
    if (valueStart + minimumSpan <= bounds.max) valueEnd = valueStart + minimumSpan;
    else {
      valueEnd = bounds.max;
      valueStart = bounds.max - minimumSpan;
    }
  }
  return {
    ...interval,
    valueStart,
    valueEnd,
  };
}
