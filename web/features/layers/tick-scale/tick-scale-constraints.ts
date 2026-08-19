import type { RangeDto, TickScaleLayerDto } from "@/features/project/project-dto/project-dto";
import { clamp } from "@/lib/geometry/geometry";
import { constrainScaleSequenceToRange } from "@/features/ranges/scale-mapping/scale-sequence";
import { TICK_SCALE_LIMITS } from "./tick-scale-limits";

const minimumEffectiveRadiusMm = TICK_SCALE_LIMITS.tickLengthMm.min;

export function getTickScaleGeometryBounds(layer: TickScaleLayerDto, range: RangeDto) {
  const minRadiusOffsetMm = -range.radius + minimumEffectiveRadiusMm;
  const maxRadiusOffsetMm = range.radius;
  const effectiveRadiusMm = range.radius + layer.radiusOffsetMm;
  return {
    minRadiusOffsetMm,
    maxRadiusOffsetMm,
    maxTickLengthMm: Math.min(
      TICK_SCALE_LIMITS.tickLengthMm.max,
      Math.max(minimumEffectiveRadiusMm, effectiveRadiusMm),
    ),
    maxTickWidthMm: Math.min(TICK_SCALE_LIMITS.tickWidthMm.max, layer.tickLengthMm),
  };
}

/** Keeps a Tick Scale proportional and valid after its Range geometry changes. */
export function constrainTickScaleToRange(
  layer: TickScaleLayerDto,
  range: RangeDto,
): TickScaleLayerDto {
  const constrainedSequence = constrainScaleSequenceToRange(layer, range);
  const radiusOffsetMm = clamp(
    layer.radiusOffsetMm,
    -range.radius + minimumEffectiveRadiusMm,
    range.radius,
  );
  const effectiveRadiusMm = range.radius + radiusOffsetMm;
  const tickLengthMm = clamp(
    layer.tickLengthMm,
    minimumEffectiveRadiusMm,
    Math.min(TICK_SCALE_LIMITS.tickLengthMm.max, effectiveRadiusMm),
  );
  return {
    ...constrainedSequence,
    radiusOffsetMm,
    tickLengthMm,
    tickWidthMm: clamp(
      layer.tickWidthMm,
      TICK_SCALE_LIMITS.tickWidthMm.min,
      Math.min(TICK_SCALE_LIMITS.tickWidthMm.max, tickLengthMm),
    ),
  };
}
