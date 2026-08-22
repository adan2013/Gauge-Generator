import { getCanvasOffsetBounds } from "@/features/layers/core/canvas-offset-bounds";
import type { EditingOverlayPrimitive } from "@/features/layers/core/editing-overlay-geometry";
import type {
  CanvasPointMm,
  EditingOverlayContext,
  LayerHandle,
  PointerInput,
  RenderContext,
  ValidationIssue,
} from "@/features/layers/core/layer";
import { Layer, OVERLAY_INTEGER_INCREMENT } from "@/features/layers/core/layer";
import { formatSvgNumber } from "@/features/layers/core/text-style/text-style-svg";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type { LineLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { clamp, normalizeAngle, snapAngleDegrees, snapDistanceMm } from "@/lib/geometry/geometry";
import { getLineCanvasBounds, getLineValidationIssues } from "./line-constraints";
import { LINE_LIMITS } from "./line-limits";

const ENDPOINT_HANDLE_OFFSET_MM = 4;

export type LineGeometry = {
  center: CanvasPointMm;
  direction: CanvasPointMm;
  start: CanvasPointMm;
  end: CanvasPointMm;
};

export class LineLayer extends Layer<LineLayerDto> {
  constructor(dto: LineLayerDto) {
    super(dto);
  }

  validate(context: RenderContext): ValidationIssue[] {
    const range = context.rangeById.get(this.dto.rangeId);
    return range
      ? getLineValidationIssues(this.dto, context.project.canvas, range)
      : [{ path: "rangeId", code: PROJECT_VALIDATION_CODES.missingRangeReference }];
  }

  toSvg(context: RenderContext): string {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range || !this.dto.visible) return "";
    const geometry = getLineGeometry(this.dto, range);
    return `<line x1="${formatSvgNumber(geometry.start.x)}" y1="${formatSvgNumber(geometry.start.y)}" x2="${formatSvgNumber(geometry.end.x)}" y2="${formatSvgNumber(geometry.end.y)}" fill="none" stroke="${this.dto.style.color}" stroke-width="${formatSvgNumber(this.dto.style.strokeWidthMm)}" stroke-linecap="${this.dto.style.roundedEnds ? "round" : "butt"}" />`;
  }

  getEditingOverlay(context: EditingOverlayContext): readonly EditingOverlayPrimitive[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [];
    const geometry = getLineGeometry(this.dto, range);
    return [
      {
        dasharray: "1 1",
        end: getStartHandlePoint(geometry),
        id: "line-start-handle-guide",
        kind: "line",
        start: geometry.start,
        strokeWidth: 0.35,
        tone: "accent",
      },
      {
        dasharray: "1 1",
        end: getEndHandlePoint(geometry),
        id: "line-end-handle-guide",
        kind: "line",
        start: geometry.end,
        strokeWidth: 0.35,
        tone: "accent",
      },
    ];
  }

  getHandles(context: EditingOverlayContext): LayerHandle[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [];
    const geometry = getLineGeometry(this.dto, range);
    return [
      { id: "position", kind: "move", label: "position", point: geometry.center },
      { id: "start", kind: "resize", label: "start", point: getStartHandlePoint(geometry) },
      { id: "end", kind: "resize", label: "end", point: getEndHandlePoint(geometry) },
    ];
  }

  applyHandleDrag(
    handleId: string,
    pointer: PointerInput,
    context: EditingOverlayContext,
  ): LineLayerDto {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return this.dto;
    const distanceIncrement = pointer.snapDistanceMm ?? OVERLAY_INTEGER_INCREMENT;
    if (handleId === "position") {
      const bounds = getCanvasOffsetBounds(context.project.canvas, range);
      return this.withGeometry({
        offsetXMm: clamp(
          snapDistanceMm(pointer.point.x - range.centerX, distanceIncrement),
          bounds.offsetX.min,
          bounds.offsetX.max,
        ),
        offsetYMm: clamp(
          snapDistanceMm(pointer.point.y - range.centerY, distanceIncrement),
          bounds.offsetY.min,
          bounds.offsetY.max,
        ),
      });
    }
    if (handleId !== "start" && handleId !== "end") return this.dto;

    const geometry = getLineGeometry(this.dto, range);
    const fixedPoint = handleId === "start" ? geometry.end : geometry.start;
    const rawVector =
      handleId === "start"
        ? { x: fixedPoint.x - pointer.point.x, y: fixedPoint.y - pointer.point.y }
        : { x: pointer.point.x - fixedPoint.x, y: pointer.point.y - fixedPoint.y };
    const rawHandleDistance = Math.hypot(rawVector.x, rawVector.y);
    const rawRotation =
      rawHandleDistance === 0
        ? this.dto.geometry.rotationDegrees
        : normalizeAngle((Math.atan2(rawVector.y, rawVector.x) * 180) / Math.PI);
    const rotationDegrees = normalizeAngle(
      Math.round(
        snapAngleDegrees(rawRotation, pointer.snapAngleDegrees ?? OVERLAY_INTEGER_INCREMENT),
      ),
    );
    const lengthMm = clamp(
      snapDistanceMm(rawHandleDistance - ENDPOINT_HANDLE_OFFSET_MM, distanceIncrement),
      LINE_LIMITS.lengthMm.min,
      getLineCanvasBounds(context.project.canvas).lengthMm.max,
    );
    const radians = (rotationDegrees * Math.PI) / 180;
    const direction = { x: Math.cos(radians), y: Math.sin(radians) };
    const center =
      handleId === "start"
        ? {
            x: fixedPoint.x - (direction.x * lengthMm) / 2,
            y: fixedPoint.y - (direction.y * lengthMm) / 2,
          }
        : {
            x: fixedPoint.x + (direction.x * lengthMm) / 2,
            y: fixedPoint.y + (direction.y * lengthMm) / 2,
          };
    const offsetBounds = getCanvasOffsetBounds(context.project.canvas, range);
    return this.withGeometry({
      lengthMm,
      rotationDegrees,
      offsetXMm: clamp(
        snapLineOffsetMm(center.x - range.centerX),
        offsetBounds.offsetX.min,
        offsetBounds.offsetX.max,
      ),
      offsetYMm: clamp(
        snapLineOffsetMm(center.y - range.centerY),
        offsetBounds.offsetY.min,
        offsetBounds.offsetY.max,
      ),
    });
  }

  private withGeometry(change: Partial<LineLayerDto["geometry"]>): LineLayerDto {
    return { ...this.dto, geometry: { ...this.dto.geometry, ...change } };
  }
}

function getStartHandlePoint(geometry: LineGeometry): CanvasPointMm {
  return addScaled(geometry.start, geometry.direction, -ENDPOINT_HANDLE_OFFSET_MM);
}

function getEndHandlePoint(geometry: LineGeometry): CanvasPointMm {
  return addScaled(geometry.end, geometry.direction, ENDPOINT_HANDLE_OFFSET_MM);
}

function addScaled(point: CanvasPointMm, direction: CanvasPointMm, scale: number): CanvasPointMm {
  return { x: point.x + direction.x * scale, y: point.y + direction.y * scale };
}

function snapLineOffsetMm(value: number): number {
  return Number(snapDistanceMm(value, LINE_LIMITS.offsetMm.step).toFixed(1));
}

export function getLineGeometry(layer: LineLayerDto, range: RangeDto): LineGeometry {
  const radians = (layer.geometry.rotationDegrees * Math.PI) / 180;
  const direction = { x: Math.cos(radians), y: Math.sin(radians) };
  const center = {
    x: range.centerX + layer.geometry.offsetXMm,
    y: range.centerY + layer.geometry.offsetYMm,
  };
  const halfLength = layer.geometry.lengthMm / 2;
  return {
    center,
    direction,
    start: {
      x: center.x - direction.x * halfLength,
      y: center.y - direction.y * halfLength,
    },
    end: {
      x: center.x + direction.x * halfLength,
      y: center.y + direction.y * halfLength,
    },
  };
}
