import type { RangeDto } from "@/features/project/project-dto/project-dto";
import type { EditingOverlayPrimitive } from "@/features/layers/core/editing-overlay-geometry";
import {
  roundedSquareNormalOffsetPathData,
  roundedSquarePathData,
} from "@/features/ranges/path-geometry/rounded-square-geometry";
import { valueToNormalizedPosition } from "@/features/ranges/scale-mapping/scale-mapping";
import { clamp } from "@/lib/geometry/geometry";

type RangeScaleEditingOverlayOptions = {
  radius: number;
  range: RangeDto;
  valueEnd: number;
  valueStart: number;
};

type RangeScaleNormalOffsetEditingOverlayOptions = Omit<
  RangeScaleEditingOverlayOptions,
  "radius"
> & { radiusOffsetMm: number };

const POSITION_TOLERANCE = 1e-9;

export function getRangeScaleEditingOverlay({
  radius,
  range,
  valueEnd,
  valueStart,
}: RangeScaleEditingOverlayOptions): readonly EditingOverlayPrimitive[] {
  return getEditingOverlaySegments({
    range,
    valueEnd,
    valueStart,
    getPathData: (positionStart, positionEnd) =>
      roundedSquarePathData({
        angleStart: range.angleStart + range.openingAngle * positionStart,
        centerX: range.centerX,
        centerY: range.centerY,
        cornerRadiusPercent: range.cornerRadiusPercent,
        openingAngle: range.openingAngle * (positionEnd - positionStart),
        radius,
      }),
    valid: radius > 0,
  });
}

export function getRangeScaleNormalOffsetEditingOverlay({
  radiusOffsetMm,
  range,
  valueEnd,
  valueStart,
}: RangeScaleNormalOffsetEditingOverlayOptions): readonly EditingOverlayPrimitive[] {
  return getEditingOverlaySegments({
    range,
    valueEnd,
    valueStart,
    getPathData: (positionStart, positionEnd) =>
      roundedSquareNormalOffsetPathData({
        angleStart: range.angleStart + range.openingAngle * positionStart,
        centerX: range.centerX,
        centerY: range.centerY,
        cornerRadiusPercent: range.cornerRadiusPercent,
        openingAngle: range.openingAngle * (positionEnd - positionStart),
        radius: range.radius,
        offsetMm: radiusOffsetMm,
      }),
    valid: range.radius + radiusOffsetMm > 0,
  });
}

function getEditingOverlaySegments({
  getPathData,
  range,
  valid,
  valueEnd,
  valueStart,
}: Omit<RangeScaleEditingOverlayOptions, "radius"> & {
  getPathData: (positionStart: number, positionEnd: number) => string;
  valid: boolean;
}): readonly EditingOverlayPrimitive[] {
  if (!valid) return [];
  const mappedPositions = [
    clamp(valueToNormalizedPosition(range, valueStart), 0, 1),
    clamp(valueToNormalizedPosition(range, valueEnd), 0, 1),
  ];
  const activeStart = Math.min(...mappedPositions);
  const activeEnd = Math.max(...mappedPositions);
  const inactiveSegments = [
    activeStart > POSITION_TOLERANCE ? [0, activeStart] : undefined,
    activeEnd < 1 - POSITION_TOLERANCE ? [activeEnd, 1] : undefined,
  ].filter((segment): segment is [number, number] => segment !== undefined);

  return [
    ...inactiveSegments.map(([positionStart, positionEnd], index) =>
      getPath({
        id: `scale-overlay-inactive-${index}`,
        positionEnd,
        positionStart,
        getPathData,
        segment: "inactive",
      }),
    ),
    getPath({
      id: "scale-overlay-active",
      positionEnd: activeEnd,
      positionStart: activeStart,
      getPathData,
      segment: "active",
    }),
  ];
}

function getPath({
  id,
  getPathData,
  positionEnd,
  positionStart,
  segment,
}: {
  getPathData: (positionStart: number, positionEnd: number) => string;
  id: string;
  positionEnd: number;
  positionStart: number;
  segment: "active" | "inactive";
}): EditingOverlayPrimitive {
  const commands = getPathData(positionStart, positionEnd);

  return {
    d: commands,
    dasharray: "1.5 1.5",
    id,
    kind: "path",
    segment,
    strokeWidth: 0.4,
    tone: segment === "active" ? "accent" : "muted",
  };
}
