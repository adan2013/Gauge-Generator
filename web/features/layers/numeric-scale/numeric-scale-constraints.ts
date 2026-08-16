import type { NumericScaleLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { clamp } from "@/lib/geometry/geometry";
import { getScaleValueBounds } from "@/features/layers/tick-scale/tick-scale-constraints";

const MINIMUM_EFFECTIVE_RADIUS_MM = 0.5;
export const MAX_NUMERIC_SCALE_LABELS = 200;

export function getNumericScaleGeometryBounds(layer: NumericScaleLayerDto, range: RangeDto) {
  const effectiveRadiusMm = range.radius + layer.radiusOffsetMm;
  return {
    minRadiusOffsetMm: -range.radius + MINIMUM_EFFECTIVE_RADIUS_MM,
    maxRadiusOffsetMm: range.radius,
    maxFontSizeMm: Math.max(MINIMUM_EFFECTIVE_RADIUS_MM, effectiveRadiusMm),
  };
}

export function getNumericScaleLabelCount(layer: NumericScaleLayerDto): number {
  return Math.floor((layer.valueEnd - layer.valueStart) / layer.valueStep) + 1;
}

export function getNumericScaleValues(layer: NumericScaleLayerDto, range: RangeDto): number[] {
  const count = Math.min(getNumericScaleLabelCount(layer), MAX_NUMERIC_SCALE_LABELS + 1);
  const values = Array.from(
    { length: Math.max(0, count) },
    (_, index) => layer.valueStart + layer.valueStep * index,
  ).filter((value) => value <= layer.valueEnd + Number.EPSILON);
  if (Math.abs(range.openingAngle) === 360 && values.length > 1) {
    const bounds = getScaleValueBounds(range);
    if (
      Math.abs(values[0] - bounds.min) < Number.EPSILON &&
      Math.abs(values.at(-1)! - bounds.max) < Number.EPSILON
    )
      values.pop();
  }
  return values;
}

/** Keeps labels valid when their source Range geometry or mapped values change. */
export function constrainNumericScaleToRange(
  layer: NumericScaleLayerDto,
  range: RangeDto,
): NumericScaleLayerDto {
  const values = getScaleValueBounds(range);
  const valueStart = clamp(layer.valueStart, values.min, values.max);
  const valueEnd = clamp(layer.valueEnd, valueStart, values.max);
  const radiusOffsetMm = clamp(
    layer.radiusOffsetMm,
    -range.radius + MINIMUM_EFFECTIVE_RADIUS_MM,
    range.radius,
  );
  const effectiveRadiusMm = range.radius + radiusOffsetMm;
  return {
    ...layer,
    valueStart,
    valueEnd,
    radiusOffsetMm,
    fontSizeMm: clamp(layer.fontSizeMm, MINIMUM_EFFECTIVE_RADIUS_MM, effectiveRadiusMm),
  };
}
