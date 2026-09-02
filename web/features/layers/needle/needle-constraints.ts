import type { NeedleLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { getRangeScaleValueBounds } from "@/features/ranges/scale-mapping/scale-mapping";
import { clamp } from "@/lib/geometry/geometry";
import { NEEDLE_LIMITS } from "./needle-limits";

export function getNeedleGeometryBounds(layer: NeedleLayerDto, range: RangeDto) {
  return {
    maxLengthMm: Math.min(NEEDLE_LIMITS.lengthMm.max, range.radius * 2),
    maxTailLengthMm: Math.min(NEEDLE_LIMITS.tailLengthMm.max, range.radius),
    maxWidthMm: Math.min(NEEDLE_LIMITS.widthMm.max, layer.shaft.lengthMm),
    maxHubRadiusMm: Math.min(NEEDLE_LIMITS.hubRadiusMm.max, range.radius),
  };
}

/** Keeps Needle value and physical geometry valid after its source Range changes. */
export function constrainNeedleToRange(layer: NeedleLayerDto, range: RangeDto): NeedleLayerDto {
  const valueBounds = getRangeScaleValueBounds(range);
  const bounds = getNeedleGeometryBounds(layer, range);
  const lengthMm = clamp(layer.shaft.lengthMm, NEEDLE_LIMITS.lengthMm.min, bounds.maxLengthMm);
  return {
    ...layer,
    value: clamp(layer.value, valueBounds.min, valueBounds.max),
    shaft: {
      ...layer.shaft,
      lengthMm,
      tailLengthMm: clamp(
        layer.shaft.tailLengthMm,
        NEEDLE_LIMITS.tailLengthMm.min,
        bounds.maxTailLengthMm,
      ),
      widthMm: clamp(
        layer.shaft.widthMm,
        NEEDLE_LIMITS.widthMm.min,
        Math.min(NEEDLE_LIMITS.widthMm.max, lengthMm),
      ),
    },
    hub: {
      ...layer.hub,
      radiusMm: clamp(layer.hub.radiusMm, NEEDLE_LIMITS.hubRadiusMm.min, bounds.maxHubRadiusMm),
    },
  };
}
