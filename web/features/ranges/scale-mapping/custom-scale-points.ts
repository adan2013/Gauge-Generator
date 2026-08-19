import {
  CUSTOM_SCALE_POSITION_STEP,
  type ScaleDefinitionDto,
} from "@/features/project/project-dto/project-dto";

export type CustomScalePoint = Extract<ScaleDefinitionDto, { mode: "custom" }>["points"][number];

export const CUSTOM_SCALE_VALUE_MIN = -1_000_000;
export const CUSTOM_SCALE_VALUE_MAX = 1_000_000;

export type CustomScaleSnapOptions = {
  enabled: boolean;
  valueStep: number;
};

export type CustomScalePointBounds = {
  position: { max: number; min: number };
  value: { max: number; min: number };
};

export function addCustomScalePoint(
  points: readonly CustomScalePoint[],
  point: CustomScalePoint,
): CustomScalePoint[] {
  if (points.length < 2) return [...points];
  if (!Number.isInteger(point.value)) return [...points];
  const segmentIndex = points.findIndex((candidate) => candidate.value > point.value);
  if (segmentIndex <= 0) return [...points];
  const previous = points[segmentIndex - 1];
  const next = points[segmentIndex];
  if (!previous || !next) return [...points];
  if (
    point.value <= previous.value ||
    point.value >= next.value ||
    point.position <= previous.position ||
    point.position >= next.position
  )
    return [...points];
  return [
    ...points.slice(0, segmentIndex),
    {
      value: point.value,
      position: point.position,
    },
    ...points.slice(segmentIndex),
  ];
}

export function addCustomScalePointAtLargestGap(
  points: readonly CustomScalePoint[],
  snapOptions?: CustomScaleSnapOptions,
): CustomScalePoint[] {
  if (points.length < 2) return [...points];
  let segmentIndex = 1;
  let largestGap = -Infinity;
  for (let index = 1; index < points.length; index += 1) {
    const gap = points[index].value - points[index - 1].value;
    if (gap > largestGap) {
      segmentIndex = index;
      largestGap = gap;
    }
  }
  const previous = points[segmentIndex - 1];
  const next = points[segmentIndex];
  const point = {
    value: Math.round((previous.value + next.value) / 2),
    position: roundToStep((previous.position + next.position) / 2, CUSTOM_SCALE_POSITION_STEP),
  };
  return addCustomScalePoint(
    points,
    snapOptions ? snapCustomScalePoint(point, snapOptions) : point,
  );
}

export function moveCustomScalePoint(
  points: readonly CustomScalePoint[],
  index: number,
  point: CustomScalePoint,
): CustomScalePoint[] {
  if (index <= 0 || index >= points.length - 1) return [...points];
  const previous = points[index - 1];
  const next = points[index + 1];
  return points.map((candidate, candidateIndex) =>
    candidateIndex === index
      ? {
          value:
            Number.isInteger(point.value) &&
            point.value > previous.value &&
            point.value < next.value
              ? point.value
              : candidate.value,
          position:
            point.position > previous.position && point.position < next.position
              ? point.position
              : candidate.position,
        }
      : candidate,
  );
}

export function editCustomScalePoint(
  points: readonly CustomScalePoint[],
  index: number,
  change: Partial<CustomScalePoint>,
): CustomScalePoint[] {
  const current = points[index];
  if (!current) return [...points];
  const bounds = getCustomScalePointBounds(points, index);
  const previous = points[index - 1];
  const next = points[index + 1];
  const isFirst = index === 0;
  const isLast = index === points.length - 1;
  const nextValue = change.value ?? current.value;
  const nextPosition = change.position ?? current.position;
  return points.map((candidate, candidateIndex) =>
    candidateIndex === index
      ? {
          value:
            nextValue >= bounds.value.min &&
            nextValue <= bounds.value.max &&
            Number.isInteger(nextValue) &&
            (!previous || nextValue > previous.value) &&
            (!next || nextValue < next.value)
              ? nextValue
              : current.value,
          position: isFirst
            ? 0
            : isLast
              ? 1
              : nextPosition >= bounds.position.min && nextPosition <= bounds.position.max
                ? nextPosition
                : current.position,
        }
      : candidate,
  );
}

export function getCustomScalePointBounds(
  points: readonly CustomScalePoint[],
  index: number,
): CustomScalePointBounds {
  const previous = points[index - 1];
  const next = points[index + 1];
  return {
    value: {
      min: previous ? previous.value : CUSTOM_SCALE_VALUE_MIN,
      max: next ? next.value : CUSTOM_SCALE_VALUE_MAX,
    },
    position: {
      min: previous
        ? roundToStep(previous.position + CUSTOM_SCALE_POSITION_STEP, CUSTOM_SCALE_POSITION_STEP)
        : 0,
      max: next
        ? roundToStep(next.position - CUSTOM_SCALE_POSITION_STEP, CUSTOM_SCALE_POSITION_STEP)
        : 1,
    },
  };
}

export function snapCustomScalePoint(
  point: CustomScalePoint,
  options: CustomScaleSnapOptions,
): CustomScalePoint {
  const position = roundToStep(point.position, CUSTOM_SCALE_POSITION_STEP);
  if (!options.enabled) return { value: Math.round(point.value), position };
  if (!Number.isFinite(options.valueStep) || options.valueStep <= 0)
    return { value: Math.round(point.value), position };
  const valueStep = Math.max(1, Math.round(options.valueStep));
  return {
    value: roundToStep(point.value, valueStep),
    position,
  };
}

export function removeCustomScalePoint(
  points: readonly CustomScalePoint[],
  index: number,
): CustomScalePoint[] {
  if (index <= 0 || index >= points.length - 1) return [...points];
  return points.filter((_, candidateIndex) => candidateIndex !== index);
}

function roundToStep(value: number, step: number) {
  const decimalPlaces = Math.min(12, getDecimalPlaces(step));
  return Number((Math.round(value / step) * step).toFixed(decimalPlaces));
}

function getDecimalPlaces(value: number) {
  const text = value.toString().toLowerCase();
  if (text.includes("e-")) return Number(text.split("e-")[1]);
  return text.split(".")[1]?.length ?? 0;
}
