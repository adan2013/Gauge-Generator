import type {
  EditingOverlayContext,
  LayerHandle,
  PointerInput,
} from "@/features/layers/core/layer";
import { OVERLAY_INTEGER_INCREMENT } from "@/features/layers/core/layer";
import type { EditingOverlayPrimitive } from "@/features/layers/core/editing-overlay-geometry";
import type { RangeDto } from "@/features/project/project-dto/project-dto";
import { getRangeScaleEditingOverlay } from "@/features/ranges/path-geometry/range-scale-editing-overlay";
import {
  pointOnRoundedSquare,
  pointOnRoundedSquareNormalOffset,
  roundedSquareRadiusAtPoint,
} from "@/features/ranges/path-geometry/rounded-square-geometry";
import { getRangeScaleNormalOffsetEditingOverlay } from "@/features/ranges/path-geometry/range-scale-editing-overlay";
import { valueToNormalizedPosition } from "@/features/ranges/scale-mapping/scale-mapping";
import { clamp, snapDistanceMm } from "@/lib/geometry/geometry";

type RadiusOffsetLayer = { radiusOffsetMm: number };
type RangeScaleLayer = RadiusOffsetLayer & { valueEnd: number; valueStart: number };
export type RadiusOffsetBounds = { maxRadiusOffsetMm: number; minRadiusOffsetMm: number };

export function getEffectiveRadiusMm(layer: RadiusOffsetLayer, range: RangeDto): number {
  return range.radius + layer.radiusOffsetMm;
}

export function getRangeMappedLayerPathGeometry(layer: RangeScaleLayer, range: RangeDto) {
  const startPosition = valueToNormalizedPosition(range, layer.valueStart);
  const endPosition = valueToNormalizedPosition(range, layer.valueEnd);
  return {
    angleStart: range.angleStart + range.openingAngle * startPosition,
    openingAngle: range.openingAngle * (endPosition - startPosition),
    radius: getEffectiveRadiusMm(layer, range),
  };
}

export function getRadiusOffsetBounds(
  range: RangeDto,
  minimumEffectiveRadiusMm: number,
): RadiusOffsetBounds {
  return {
    minRadiusOffsetMm: -range.radius + minimumEffectiveRadiusMm,
    maxRadiusOffsetMm: range.radius,
  };
}

export function constrainRadiusOffsetMm(
  radiusOffsetMm: number,
  range: RangeDto,
  minimumEffectiveRadiusMm: number,
): number {
  const bounds = getRadiusOffsetBounds(range, minimumEffectiveRadiusMm);
  return clamp(radiusOffsetMm, bounds.minRadiusOffsetMm, bounds.maxRadiusOffsetMm);
}

export function getRangeMappedLayerEditingOverlay(
  layer: RangeScaleLayer,
  range: RangeDto,
): readonly EditingOverlayPrimitive[] {
  return getRangeScaleEditingOverlay({
    radius: getEffectiveRadiusMm(layer, range),
    range,
    valueEnd: layer.valueEnd,
    valueStart: layer.valueStart,
  });
}

export function getRangeMappedLayerRadiusHandle(
  layer: RadiusOffsetLayer,
  range: RangeDto,
): LayerHandle[] {
  const radius = getEffectiveRadiusMm(layer, range);
  if (radius <= 0) return [];
  return [
    {
      id: "radius-offset",
      kind: "radius",
      label: "radius-offset",
      point: pointOnRoundedSquare(
        range.centerX,
        range.centerY,
        radius,
        range.angleStart + range.openingAngle / 2,
        range.cornerRadiusPercent,
      ).point,
    },
  ];
}

export function getNormalOffsetRangeMappedLayerEditingOverlay(
  layer: RangeScaleLayer,
  range: RangeDto,
): readonly EditingOverlayPrimitive[] {
  return getRangeScaleNormalOffsetEditingOverlay({
    radiusOffsetMm: layer.radiusOffsetMm,
    range,
    valueEnd: layer.valueEnd,
    valueStart: layer.valueStart,
  });
}

export function getNormalOffsetRangeMappedLayerRadiusHandle(
  layer: RadiusOffsetLayer,
  range: RangeDto,
): LayerHandle[] {
  if (getEffectiveRadiusMm(layer, range) <= 0) return [];
  return [
    {
      id: "radius-offset",
      kind: "radius",
      label: "radius-offset",
      point: pointOnRoundedSquareNormalOffset(
        range.centerX,
        range.centerY,
        range.radius,
        range.angleStart + range.openingAngle / 2,
        range.cornerRadiusPercent,
        layer.radiusOffsetMm,
      ).point,
    },
  ];
}

export function applyRangeMappedLayerRadiusDrag<TLayer extends RadiusOffsetLayer>(
  layer: TLayer,
  handleId: string,
  pointer: PointerInput,
  range: RangeDto | undefined,
  bounds: RadiusOffsetBounds | undefined,
): TLayer {
  if (handleId !== "radius-offset" || !range || !bounds) return layer;
  const radius = roundedSquareRadiusAtPoint(
    range.centerX,
    range.centerY,
    pointer.point,
    range.cornerRadiusPercent,
  );
  const radiusOffsetMm = snapDistanceMm(
    radius - range.radius,
    pointer.snapDistanceMm ?? OVERLAY_INTEGER_INCREMENT,
  );
  return {
    ...layer,
    radiusOffsetMm: clamp(
      radiusOffsetMm,
      Math.ceil(bounds.minRadiusOffsetMm),
      Math.floor(bounds.maxRadiusOffsetMm),
    ),
  };
}

export function applyNormalOffsetRangeMappedLayerRadiusDrag<TLayer extends RadiusOffsetLayer>(
  layer: TLayer,
  handleId: string,
  pointer: PointerInput,
  range: RangeDto | undefined,
  bounds: RadiusOffsetBounds | undefined,
): TLayer {
  if (handleId !== "radius-offset" || !range || !bounds) return layer;
  const reference = pointOnRoundedSquare(
    range.centerX,
    range.centerY,
    range.radius,
    range.angleStart + range.openingAngle / 2,
    range.cornerRadiusPercent,
  );
  const radiusOffsetMm = snapDistanceMm(
    (pointer.point.x - reference.point.x) * reference.normal.x +
      (pointer.point.y - reference.point.y) * reference.normal.y,
    pointer.snapDistanceMm ?? OVERLAY_INTEGER_INCREMENT,
  );
  return {
    ...layer,
    radiusOffsetMm: clamp(
      radiusOffsetMm,
      Math.ceil(bounds.minRadiusOffsetMm),
      Math.floor(bounds.maxRadiusOffsetMm),
    ),
  };
}

export function getSourceRange<TLayer extends { rangeId: string }>(
  layer: TLayer,
  context: EditingOverlayContext,
): RangeDto | undefined {
  return context.rangeById.get(layer.rangeId);
}
