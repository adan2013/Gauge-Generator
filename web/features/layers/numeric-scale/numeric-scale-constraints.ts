import type { NumericScaleLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { clamp } from "@/lib/geometry/geometry";
import { constrainScaleSequenceToRange } from "@/features/ranges/scale-mapping/scale-sequence";
import {
  constrainRadiusOffsetMm,
  getEffectiveRadiusMm,
  getRadiusOffsetBounds,
} from "@/features/layers/core/range-mapped-layer-geometry";
import { TEXT_STYLE_LIMITS } from "@/features/layers/core/text-style/text-style-limits";

const MINIMUM_EFFECTIVE_RADIUS_MM = 0.5;

export function getNumericScaleGeometryBounds(layer: NumericScaleLayerDto, range: RangeDto) {
  const effectiveRadiusMm = getEffectiveRadiusMm(layer, range);
  return {
    ...getRadiusOffsetBounds(range, MINIMUM_EFFECTIVE_RADIUS_MM),
    maxFontSizeMm: Math.min(
      TEXT_STYLE_LIMITS.sizeMm.max,
      Math.max(MINIMUM_EFFECTIVE_RADIUS_MM, effectiveRadiusMm),
    ),
  };
}

/** Keeps labels valid when their source Range geometry or mapped values change. */
export function constrainNumericScaleToRange(
  layer: NumericScaleLayerDto,
  range: RangeDto,
): NumericScaleLayerDto {
  const constrainedSequence = constrainScaleSequenceToRange(layer, range);
  const radiusOffsetMm = constrainRadiusOffsetMm(
    layer.radiusOffsetMm,
    range,
    MINIMUM_EFFECTIVE_RADIUS_MM,
  );
  const effectiveRadiusMm = getEffectiveRadiusMm({ radiusOffsetMm }, range);
  return {
    ...constrainedSequence,
    radiusOffsetMm,
    textStyle: {
      ...layer.textStyle,
      sizeMm: clamp(
        layer.textStyle.sizeMm,
        MINIMUM_EFFECTIVE_RADIUS_MM,
        Math.min(TEXT_STYLE_LIMITS.sizeMm.max, effectiveRadiusMm),
      ),
    },
  };
}
