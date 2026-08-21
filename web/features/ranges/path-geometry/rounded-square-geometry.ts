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

const PATH_ANGLE_TOLERANCE = 1e-9;

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
  const angleEnd = angleStart + openingAngle;
  const direction = Math.sign(openingAngle) || 1;
  const cornerRadius = radius * (cornerRadiusPercent / CORNER_RADIUS_PERCENT.max);
  const straightEdge = radius - cornerRadius;
  const edgeHalfAngle = (Math.atan2(straightEdge, radius) * 180) / Math.PI;
  const minimumAngle = Math.min(angleStart, angleEnd);
  const maximumAngle = Math.max(angleStart, angleEnd);
  const transitionAngles: number[] = [];
  const firstEdgeIndex = Math.floor(minimumAngle / 90) - 1;
  const lastEdgeIndex = Math.ceil(maximumAngle / 90) + 1;

  for (let edgeIndex = firstEdgeIndex; edgeIndex <= lastEdgeIndex; edgeIndex += 1) {
    const edgeCenterAngle = edgeIndex * 90;
    transitionAngles.push(edgeCenterAngle - edgeHalfAngle, edgeCenterAngle + edgeHalfAngle);
  }

  const internalAngles = transitionAngles
    .filter(
      (angle) =>
        angle > minimumAngle + PATH_ANGLE_TOLERANCE && angle < maximumAngle - PATH_ANGLE_TOLERANCE,
    )
    .sort((left, right) => direction * (left - right))
    .filter(
      (angle, index, angles) =>
        index === 0 || Math.abs(angle - angles[index - 1]) > PATH_ANGLE_TOLERANCE,
    );
  const angles = [angleStart, ...internalAngles, angleEnd];
  const start = pointOnRoundedSquare(
    centerX,
    centerY,
    radius,
    angleStart,
    cornerRadiusPercent,
  ).point;
  const commands = [`M ${format(start.x)} ${format(start.y)}`];

  for (let index = 1; index < angles.length; index += 1) {
    const previousAngle = angles[index - 1];
    const angle = angles[index];
    if (Math.abs(angle - previousAngle) <= PATH_ANGLE_TOLERANCE) continue;
    const end = pointOnRoundedSquare(centerX, centerY, radius, angle, cornerRadiusPercent).point;
    const midpoint = pointOnRoundedSquare(
      centerX,
      centerY,
      radius,
      (previousAngle + angle) / 2,
      cornerRadiusPercent,
    );
    const followsCorner =
      cornerRadius > PATH_ANGLE_TOLERANCE &&
      Math.abs(midpoint.normal.x) > PATH_ANGLE_TOLERANCE &&
      Math.abs(midpoint.normal.y) > PATH_ANGLE_TOLERANCE;
    commands.push(
      followsCorner
        ? `A ${format(cornerRadius)} ${format(cornerRadius)} 0 0 ${direction > 0 ? 1 : 0} ${format(end.x)} ${format(end.y)}`
        : `L ${format(end.x)} ${format(end.y)}`,
    );
  }

  return commands.join(" ");
}

function format(value: number): string {
  return Number(value.toFixed(3)).toString();
}
