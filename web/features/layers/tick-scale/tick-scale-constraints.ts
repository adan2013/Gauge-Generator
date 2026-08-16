import type { RangeDto, TickScaleLayerDto } from "@/features/project/project-dto/project-dto";
import { clamp } from "@/lib/geometry/geometry";

const minimumEffectiveRadiusMm = 0.2;
export const MAX_TICK_SCALE_MARKS = 200;

export function getTickScaleGeometryBounds(layer: TickScaleLayerDto, range: RangeDto) {
  const minRadiusOffsetMm = -range.radius + minimumEffectiveRadiusMm;
  const maxRadiusOffsetMm = range.radius;
  const effectiveRadiusMm = range.radius + layer.radiusOffsetMm;
  return {
    minRadiusOffsetMm,
    maxRadiusOffsetMm,
    maxTickLengthMm: Math.max(minimumEffectiveRadiusMm, effectiveRadiusMm),
    maxTickWidthMm: Math.min(10, layer.tickLengthMm),
  };
}

/** Keeps a Tick Scale proportional and valid after its Range geometry changes. */
export function constrainTickScaleToRange(
  layer: TickScaleLayerDto,
  range: RangeDto,
): TickScaleLayerDto {
  const valueBounds = getScaleValueBounds(range);
  const valueStart = clamp(layer.valueStart, valueBounds.min, valueBounds.max);
  const valueEnd = clamp(layer.valueEnd, valueStart, valueBounds.max);
  const radiusOffsetMm = clamp(
    layer.radiusOffsetMm,
    -range.radius + minimumEffectiveRadiusMm,
    range.radius,
  );
  const effectiveRadiusMm = range.radius + radiusOffsetMm;
  const tickLengthMm = clamp(layer.tickLengthMm, minimumEffectiveRadiusMm, effectiveRadiusMm);
  return {
    ...layer,
    valueStart,
    valueEnd,
    radiusOffsetMm,
    tickLengthMm,
    tickWidthMm: clamp(layer.tickWidthMm, 0.1, Math.min(10, tickLengthMm)),
  };
}

export function getScaleValueBounds(range: RangeDto): { max: number; min: number } {
  if (range.scaleDefinition.mode === "custom") {
    const values = range.scaleDefinition.points.map((point) => point.value);
    return { min: Math.min(...values), max: Math.max(...values) };
  }
  return {
    min: Math.min(range.scaleDefinition.start, range.scaleDefinition.end),
    max: Math.max(range.scaleDefinition.start, range.scaleDefinition.end),
  };
}

export function getTickScaleMarkCount(layer: TickScaleLayerDto): number {
  return Math.floor((layer.valueEnd - layer.valueStart) / layer.valueStep) + 1;
}

export function getTickScaleValues(layer: TickScaleLayerDto, range: RangeDto): number[] {
  const count = Math.min(getTickScaleMarkCount(layer), MAX_TICK_SCALE_MARKS + 1);
  const values = Array.from(
    { length: Math.max(0, count) },
    (_, index) => layer.valueStart + layer.valueStep * index,
  ).filter((value) => value <= layer.valueEnd + Number.EPSILON);
  if (
    Math.abs(range.openingAngle) === 360 &&
    values.length > 1 &&
    Math.abs(
      Math.abs(
        valueToNormalizedPosition(range, values[0]) -
          valueToNormalizedPosition(range, values.at(-1)!),
      ) - 1,
    ) < Number.EPSILON
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
