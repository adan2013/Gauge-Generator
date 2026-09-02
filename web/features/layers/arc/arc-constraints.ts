import {
  constrainRadiusOffsetMm,
  getEffectiveRadiusMm,
  getRadiusOffsetBounds,
} from "@/features/layers/core/range-mapped-layer-geometry";
import type { ArcLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { constrainScaleIntervalToRange } from "@/features/ranges/scale-mapping/scale-sequence";
import { clamp } from "@/lib/geometry/geometry";
import { ARC_LIMITS, getArcStrokeWidthMaximum } from "./arc-limits";

const MINIMUM_EFFECTIVE_RADIUS_MM = ARC_LIMITS.strokeWidthMm.min / 2;

export function getArcGeometryBounds(layer: ArcLayerDto, range: RangeDto) {
  const effectiveRadiusMm = getEffectiveRadiusMm(layer, range);
  return {
    ...getRadiusOffsetBounds(range, MINIMUM_EFFECTIVE_RADIUS_MM),
    maxStrokeWidthMm: Math.max(
      ARC_LIMITS.strokeWidthMm.min,
      getArcStrokeWidthMaximum(effectiveRadiusMm),
    ),
  };
}

/** Keeps Arc geometry and its value interval valid after its source Range changes. */
export function constrainArcToRange(layer: ArcLayerDto, range: RangeDto): ArcLayerDto {
  const interval = constrainScaleIntervalToRange(layer, range, ARC_LIMITS.minimumValueSpan);
  const radiusOffsetMm = constrainRadiusOffsetMm(
    layer.radiusOffsetMm,
    range,
    MINIMUM_EFFECTIVE_RADIUS_MM,
  );
  const effectiveRadiusMm = getEffectiveRadiusMm({ radiusOffsetMm }, range);
  return {
    ...interval,
    radiusOffsetMm,
    strokeWidthMm: clamp(
      layer.strokeWidthMm,
      ARC_LIMITS.strokeWidthMm.min,
      getArcStrokeWidthMaximum(effectiveRadiusMm),
    ),
  };
}
