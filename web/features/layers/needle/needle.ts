import type {
  CanvasPointMm,
  EditingOverlayContext,
  LayerHandle,
  PointerInput,
  RenderContext,
  ValidationIssue,
} from "@/features/layers/core/layer";
import { OVERLAY_INTEGER_INCREMENT, Layer } from "@/features/layers/core/layer";
import type { EditingOverlayPrimitive } from "@/features/layers/core/editing-overlay-geometry";
import { formatSvgNumber } from "@/features/layers/core/text-style/text-style-svg";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type { NeedleLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import {
  pointOnRoundedSquare,
  roundedSquarePathData,
} from "@/features/ranges/path-geometry/rounded-square-geometry";
import {
  getRangeScaleValueBounds,
  normalizedPositionToValue,
  valueToNormalizedPosition,
} from "@/features/ranges/scale-mapping/scale-mapping";
import { clamp, normalizeAngle, snapAngleDegrees, snapDistanceMm } from "@/lib/geometry/geometry";
import { getNeedleGeometryBounds } from "./needle-constraints";
import { NEEDLE_LIMITS } from "./needle-limits";

const VALUE_HANDLE_RADIUS_OFFSET_MM = 6;
const DIMENSION_HANDLE_OFFSET_MM = 4;

export type NeedleGeometry = {
  angle: number;
  center: CanvasPointMm;
  direction: CanvasPointMm;
  perpendicular: CanvasPointMm;
  tail: CanvasPointMm;
  tip: CanvasPointMm;
  valueHandle: CanvasPointMm;
};

export class NeedleLayer extends Layer<NeedleLayerDto> {
  constructor(dto: NeedleLayerDto) {
    super(dto);
  }

  validate(context: RenderContext): ValidationIssue[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [{ path: "rangeId", code: PROJECT_VALIDATION_CODES.missingRangeReference }];
    const issues: ValidationIssue[] = [];
    const valueBounds = getRangeScaleValueBounds(range);
    const geometryBounds = getNeedleGeometryBounds(this.dto, range);
    if (this.dto.value < valueBounds.min || this.dto.value > valueBounds.max)
      issues.push({ path: "value", code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange });
    if (this.dto.shaft.lengthMm > geometryBounds.maxLengthMm)
      issues.push({
        path: "shaft.lengthMm",
        code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
      });
    if (this.dto.shaft.tailLengthMm > geometryBounds.maxTailLengthMm)
      issues.push({
        path: "shaft.tailLengthMm",
        code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
      });
    if (this.dto.shaft.widthMm > this.dto.shaft.lengthMm)
      issues.push({
        path: "shaft.widthMm",
        code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
      });
    if (this.dto.hub.radiusMm > geometryBounds.maxHubRadiusMm)
      issues.push({
        path: "hub.radiusMm",
        code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
      });
    return issues;
  }

  toSvg(context: RenderContext): string {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range || !this.dto.visible) return "";
    const geometry = getNeedleGeometry(this.dto, range);
    const body = renderNeedleBody(this.dto, geometry);
    if (!this.dto.hub.visible) return body;
    const hub = `<circle cx="${formatSvgNumber(geometry.center.x)}" cy="${formatSvgNumber(geometry.center.y)}" r="${formatSvgNumber(this.dto.hub.radiusMm)}" fill="${this.dto.hub.color}" />`;
    return this.dto.hub.placement === "behind" ? hub + body : body + hub;
  }

  getEditingOverlay(context: EditingOverlayContext): readonly EditingOverlayPrimitive[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [];
    const geometry = getNeedleGeometry(this.dto, range);
    return [
      {
        d: roundedSquarePathData({
          angleStart: range.angleStart,
          centerX: range.centerX,
          centerY: range.centerY,
          cornerRadiusPercent: range.cornerRadiusPercent,
          openingAngle: range.openingAngle,
          radius: range.radius + VALUE_HANDLE_RADIUS_OFFSET_MM,
        }),
        dasharray: "1.5 1.5",
        id: "needle-value-path",
        kind: "path",
        strokeWidth: 0.4,
        tone: "muted",
      },
      {
        dasharray: "1.5 1.5",
        end: geometry.valueHandle,
        id: "needle-value-guide",
        kind: "line",
        start: getLengthHandlePoint(geometry),
        strokeWidth: 0.4,
        tone: "accent",
      },
    ];
  }

  getHandles(context: EditingOverlayContext): LayerHandle[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [];
    const geometry = getNeedleGeometry(this.dto, range);
    return [
      { id: "value", kind: "value", label: "value", point: geometry.valueHandle },
      {
        id: "length",
        kind: "length",
        label: "length",
        point: getLengthHandlePoint(geometry),
      },
      {
        id: "tail-length",
        kind: "length",
        label: "tail-length",
        point: getTailLengthHandlePoint(geometry),
      },
    ];
  }

  applyHandleDrag(
    handleId: string,
    pointer: PointerInput,
    context: EditingOverlayContext,
  ): NeedleLayerDto {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return this.dto;
    if (handleId === "value") return this.applyValueDrag(pointer, range);
    const geometry = getNeedleGeometry(this.dto, range);
    const projection =
      (pointer.point.x - geometry.center.x) * geometry.direction.x +
      (pointer.point.y - geometry.center.y) * geometry.direction.y;
    const distanceIncrement = pointer.snapDistanceMm ?? OVERLAY_INTEGER_INCREMENT;
    const bounds = getNeedleGeometryBounds(this.dto, range);
    if (handleId === "length") {
      const lengthMm = clamp(
        snapDistanceMm(projection - DIMENSION_HANDLE_OFFSET_MM, distanceIncrement),
        NEEDLE_LIMITS.lengthMm.min,
        bounds.maxLengthMm,
      );
      return {
        ...this.dto,
        shaft: {
          ...this.dto.shaft,
          lengthMm,
          widthMm: Math.min(this.dto.shaft.widthMm, lengthMm),
        },
      };
    }
    if (handleId === "tail-length")
      return {
        ...this.dto,
        shaft: {
          ...this.dto.shaft,
          tailLengthMm: clamp(
            snapDistanceMm(-projection - DIMENSION_HANDLE_OFFSET_MM, distanceIncrement),
            NEEDLE_LIMITS.tailLengthMm.min,
            bounds.maxTailLengthMm,
          ),
        },
      };
    return this.dto;
  }

  private applyValueDrag(pointer: PointerInput, range: RangeDto): NeedleLayerDto {
    const rawAngle = normalizeAngle(
      (Math.atan2(pointer.point.y - range.centerY, pointer.point.x - range.centerX) * 180) /
        Math.PI,
    );
    const angle = normalizeAngle(
      snapAngleDegrees(rawAngle, pointer.snapAngleDegrees ?? OVERLAY_INTEGER_INCREMENT),
    );
    const position = angleToRangePosition(angle, range.angleStart, range.openingAngle);
    const bounds = getRangeScaleValueBounds(range);
    return {
      ...this.dto,
      value: clamp(Math.round(normalizedPositionToValue(range, position)), bounds.min, bounds.max),
    };
  }
}

export function getNeedleGeometry(layer: NeedleLayerDto, range: RangeDto): NeedleGeometry {
  const position = valueToNormalizedPosition(range, layer.value);
  const angle = range.angleStart + range.openingAngle * position;
  const radians = (angle * Math.PI) / 180;
  const direction = { x: Math.cos(radians), y: Math.sin(radians) };
  const perpendicular = { x: -direction.y, y: direction.x };
  const center = { x: range.centerX, y: range.centerY };
  return {
    angle,
    center,
    direction,
    perpendicular,
    tip: addScaled(center, direction, layer.shaft.lengthMm),
    tail: addScaled(center, direction, -layer.shaft.tailLengthMm),
    valueHandle: pointOnRoundedSquare(
      range.centerX,
      range.centerY,
      range.radius + VALUE_HANDLE_RADIUS_OFFSET_MM,
      angle,
      range.cornerRadiusPercent,
    ).point,
  };
}

export function angleToRangePosition(
  angle: number,
  angleStart: number,
  openingAngle: number,
): number {
  if (openingAngle === 0) return 0;
  const span = Math.abs(openingAngle);
  const directedDelta =
    openingAngle > 0 ? normalizeAngle(angle - angleStart) : normalizeAngle(angleStart - angle);
  if (span >= 360 || directedDelta <= span) return clamp(directedDelta / span, 0, 1);
  const distanceToStart = 360 - directedDelta;
  const distanceToEnd = directedDelta - span;
  return distanceToStart <= distanceToEnd ? 0 : 1;
}

function renderNeedleBody(layer: NeedleLayerDto, geometry: NeedleGeometry): string {
  const tail =
    layer.shaft.tailLengthMm > 0
      ? `<line x1="${formatSvgNumber(geometry.tail.x)}" y1="${formatSvgNumber(geometry.tail.y)}" x2="${formatSvgNumber(geometry.center.x)}" y2="${formatSvgNumber(geometry.center.y)}" stroke="${layer.shaft.tailColor}" stroke-width="${formatSvgNumber(layer.shaft.widthMm)}" stroke-linecap="butt" />`
      : "";
  if (layer.shaft.tipStyle === "arrowhead") return tail + renderArrowheadShaft(layer, geometry);
  if (layer.shaft.tipStyle === "pointed") {
    const halfWidth = layer.shaft.widthMm / 2;
    const left = addScaled(geometry.center, geometry.perpendicular, halfWidth);
    const right = addScaled(geometry.center, geometry.perpendicular, -halfWidth);
    return `${tail}<path d="M ${formatPoint(left)} L ${formatPoint(geometry.tip)} L ${formatPoint(right)} Z" fill="${layer.shaft.color}" />`;
  }
  if (layer.shaft.tipStyle === "tapered-rounded")
    return tail + renderTaperedRoundedShaft(layer, geometry);
  return `${tail}<line x1="${formatSvgNumber(geometry.center.x)}" y1="${formatSvgNumber(geometry.center.y)}" x2="${formatSvgNumber(geometry.tip.x)}" y2="${formatSvgNumber(geometry.tip.y)}" stroke="${layer.shaft.color}" stroke-width="${formatSvgNumber(layer.shaft.widthMm)}" stroke-linecap="${layer.shaft.tipStyle === "rounded" ? "round" : "butt"}" />`;
}

function renderArrowheadShaft(layer: NeedleLayerDto, geometry: NeedleGeometry): string {
  const halfWidth = layer.shaft.widthMm / 2;
  const headLength = Math.min(layer.shaft.lengthMm, Math.max(layer.shaft.widthMm * 1.5, 0.5));
  const headBase = addScaled(geometry.tip, geometry.direction, -headLength);
  const points = [
    addScaled(geometry.center, geometry.perpendicular, halfWidth),
    addScaled(headBase, geometry.perpendicular, halfWidth),
    geometry.tip,
    addScaled(headBase, geometry.perpendicular, -halfWidth),
    addScaled(geometry.center, geometry.perpendicular, -halfWidth),
  ];
  return `<path d="M ${points.map(formatPoint).join(" L ")} Z" fill="${layer.shaft.color}" />`;
}

function renderTaperedRoundedShaft(layer: NeedleLayerDto, geometry: NeedleGeometry): string {
  const halfWidth = layer.shaft.widthMm / 2;
  const tipRadius = Math.min(layer.shaft.widthMm * 0.2, layer.shaft.lengthMm / 2);
  const capCenter = addScaled(geometry.tip, geometry.direction, -tipRadius);
  const capLeft = addScaled(capCenter, geometry.perpendicular, tipRadius);
  const capRight = addScaled(capCenter, geometry.perpendicular, -tipRadius);
  const halfCircleControlOffset = (4 / 3) * tipRadius;
  const controlLeft = addScaled(capLeft, geometry.direction, halfCircleControlOffset);
  const controlRight = addScaled(capRight, geometry.direction, halfCircleControlOffset);
  const shaftLeft = addScaled(geometry.center, geometry.perpendicular, halfWidth);
  const shaftRight = addScaled(geometry.center, geometry.perpendicular, -halfWidth);
  return `<path d="M ${formatPoint(shaftLeft)} L ${formatPoint(capLeft)} C ${formatPoint(controlLeft)} ${formatPoint(controlRight)} ${formatPoint(capRight)} L ${formatPoint(shaftRight)} Z" fill="${layer.shaft.color}" />`;
}

function addScaled(point: CanvasPointMm, direction: CanvasPointMm, scale: number): CanvasPointMm {
  return { x: point.x + direction.x * scale, y: point.y + direction.y * scale };
}

function getLengthHandlePoint(geometry: NeedleGeometry): CanvasPointMm {
  return addScaled(geometry.tip, geometry.direction, DIMENSION_HANDLE_OFFSET_MM);
}

function getTailLengthHandlePoint(geometry: NeedleGeometry): CanvasPointMm {
  return addScaled(geometry.tail, geometry.direction, -DIMENSION_HANDLE_OFFSET_MM);
}

function formatPoint(point: CanvasPointMm): string {
  return `${formatSvgNumber(point.x)} ${formatSvgNumber(point.y)}`;
}
