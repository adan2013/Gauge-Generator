import type { NumericScaleLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { clamp } from "@/lib/geometry/geometry";
import { getRangeScaleValueBounds } from "@/features/ranges/scale-mapping/scale-mapping";
import { NUMERIC_SCALE_LIMITS } from "./numeric-scale-limits";

const MINIMUM_EFFECTIVE_RADIUS_MM = 0.5;

export function getNumericScaleGeometryBounds(layer: NumericScaleLayerDto, range: RangeDto) {
  const effectiveRadiusMm = range.radius + layer.radiusOffsetMm;
  return {
    minRadiusOffsetMm: -range.radius + MINIMUM_EFFECTIVE_RADIUS_MM,
    maxRadiusOffsetMm: range.radius,
    maxFontSizeMm: Math.min(
      NUMERIC_SCALE_LIMITS.fontSizeMm.max,
      Math.max(MINIMUM_EFFECTIVE_RADIUS_MM, effectiveRadiusMm),
    ),
  };
}

/** Keeps labels valid when their source Range geometry or mapped values change. */
export function constrainNumericScaleToRange(
  layer: NumericScaleLayerDto,
  range: RangeDto,
): NumericScaleLayerDto {
  const values = getRangeScaleValueBounds(range);
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
    fontSizeMm: clamp(
      layer.fontSizeMm,
      MINIMUM_EFFECTIVE_RADIUS_MM,
      Math.min(NUMERIC_SCALE_LIMITS.fontSizeMm.max, effectiveRadiusMm),
    ),
  };
}
