import type { CanvasPointMm } from "@/features/layers/core/layer";
import { CORNER_RADIUS_PERCENT } from "@/features/ranges/path-geometry/corner-radius-percent";
import { normalizeAngle } from "@/lib/geometry/geometry";

export type RoundedSquarePoint = {
  normal: CanvasPointMm;
  point: CanvasPointMm;
};

type RoundedSquarePathOptions = {
  angleStart: number;
  centerX: number;
  centerY: number;
  cornerRadiusPercent: number;
  openingAngle: number;
  radius: number;
};

const MAX_PATH_SEGMENT_ANGLE_DEGREES = 8;

export function pointOnRoundedSquare(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
  cornerRadiusPercent: number,
): RoundedSquarePoint {
  const radians = (normalizeAngle(angle) * Math.PI) / 180;
  const direction = { x: Math.cos(radians), y: Math.sin(radians) };
  const cornerRadius = radius * (cornerRadiusPercent / CORNER_RADIUS_PERCENT.max);
  const straightEdge = radius - cornerRadius;
  const absoluteX = Math.abs(direction.x);
  const absoluteY = Math.abs(direction.y);

  if (absoluteX === 0 || absoluteY / absoluteX <= straightEdge / radius) {
    const distance = radius / Math.max(absoluteX, Number.EPSILON);
    return {
      point: { x: centerX + direction.x * distance, y: centerY + direction.y * distance },
      normal: { x: Math.sign(direction.x), y: 0 },
    };
  }
  if (absoluteX / absoluteY <= straightEdge / radius) {
    const distance = radius / Math.max(absoluteY, Number.EPSILON);
    return {
      point: { x: centerX + direction.x * distance, y: centerY + direction.y * distance },
      normal: { x: 0, y: Math.sign(direction.y) },
    };
  }

  const cornerCenter = {
    x: Math.sign(direction.x) * straightEdge,
    y: Math.sign(direction.y) * straightEdge,
  };
  const projection = cornerCenter.x * direction.x + cornerCenter.y * direction.y;
  const discriminant = projection ** 2 - (straightEdge ** 2 * 2 - cornerRadius ** 2);
  const distance = projection + Math.sqrt(Math.max(0, discriminant));
  const point = { x: centerX + direction.x * distance, y: centerY + direction.y * distance };
  const normal = {
    x: (point.x - centerX - cornerCenter.x) / cornerRadius,
    y: (point.y - centerY - cornerCenter.y) / cornerRadius,
  };
  return { point, normal };
}

export function roundedSquareRadiusAtPoint(
  centerX: number,
  centerY: number,
  point: CanvasPointMm,
  cornerRadiusPercent: number,
): number {
  const offset = { x: point.x - centerX, y: point.y - centerY };
  const distance = Math.hypot(offset.x, offset.y);
  if (distance === 0) return 0;
  const angle = (Math.atan2(offset.y, offset.x) * 180) / Math.PI;
  const unitBoundary = pointOnRoundedSquare(0, 0, 1, angle, cornerRadiusPercent).point;
  return distance / Math.hypot(unitBoundary.x, unitBoundary.y);
}

export function roundedSquarePathData({
  angleStart,
  centerX,
  centerY,
  cornerRadiusPercent,
  openingAngle,
  radius,
}: RoundedSquarePathOptions): string {
  const pointCount = Math.max(
    2,
    Math.ceil(Math.abs(openingAngle) / MAX_PATH_SEGMENT_ANGLE_DEGREES) + 1,
  );
  return Array.from({ length: pointCount }, (_, index) => {
    const angle = angleStart + openingAngle * (index / (pointCount - 1));
    const point = pointOnRoundedSquare(centerX, centerY, radius, angle, cornerRadiusPercent).point;
    return `${index === 0 ? "M" : "L"} ${format(point.x)} ${format(point.y)}`;
  }).join(" ");
}

function format(value: number): string {
  return Number(value.toFixed(3)).toString();
}
