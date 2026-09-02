import type { RangeDto, TickScaleLayerDto } from "@/features/project/project-dto/project-dto";
import { clamp } from "@/lib/geometry/geometry";
import { constrainScaleSequenceToRange } from "@/features/ranges/scale-mapping/scale-sequence";
import {
  constrainRadiusOffsetMm,
  getEffectiveRadiusMm,
  getRadiusOffsetBounds,
} from "@/features/layers/core/range-mapped-layer-geometry";
import { TICK_SCALE_LIMITS } from "./tick-scale-limits";

const minimumEffectiveRadiusMm = TICK_SCALE_LIMITS.tickLengthMm.min;

export function getTickScaleGeometryBounds(layer: TickScaleLayerDto, range: RangeDto) {
  const radiusOffsetBounds = getRadiusOffsetBounds(range, minimumEffectiveRadiusMm);
  const effectiveRadiusMm = getEffectiveRadiusMm(layer, range);
  return {
    ...radiusOffsetBounds,
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
  const radiusOffsetMm = constrainRadiusOffsetMm(
    layer.radiusOffsetMm,
    range,
    minimumEffectiveRadiusMm,
  );
  const effectiveRadiusMm = getEffectiveRadiusMm({ radiusOffsetMm }, range);
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
