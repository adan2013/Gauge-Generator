import type {
  CanvasPointMm,
  EditingOverlayContext,
  LayerHandle,
  PointerInput,
  RenderContext,
  ValidationIssue,
} from "@/features/layers/core/layer";
import { Layer, OVERLAY_INTEGER_INCREMENT } from "@/features/layers/core/layer";
import type { EditingOverlayPrimitive } from "@/features/layers/core/editing-overlay-geometry";
import { getCanvasOffsetBounds } from "@/features/layers/core/canvas-offset-bounds";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type { PlanarGeometryLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { clamp, normalizeAngle, snapAngleDegrees, snapDistanceMm } from "@/lib/geometry/geometry";
import {
  getPlanarGeometryCanvasBounds,
  getPlanarGeometryValidationIssues,
} from "./planar-geometry-constraints";
import { PLANAR_GEOMETRY_LIMITS } from "./planar-geometry-limits";

const ROTATION_HANDLE_DISTANCE_MM = 12;

export type PlanarGeometry = {
  center: CanvasPointMm;
  localX: CanvasPointMm;
  localY: CanvasPointMm;
  rotationHandle: CanvasPointMm;
  rotationGuideStart: CanvasPointMm;
  sizeHandle: CanvasPointMm;
};

export abstract class PlanarGeometryLayer<TDto extends PlanarGeometryLayerDto> extends Layer<TDto> {
  validate(context: RenderContext): ValidationIssue[] {
    const range = context.rangeById.get(this.dto.rangeId);
    return range
      ? this.getValidationIssues(context, range)
      : [{ path: "rangeId", code: PROJECT_VALIDATION_CODES.missingRangeReference }];
  }

  protected getValidationIssues(context: RenderContext, range: RangeDto): ValidationIssue[] {
    return getPlanarGeometryValidationIssues(this.dto, context.project.canvas, range);
  }

  getEditingOverlay(context: EditingOverlayContext): readonly EditingOverlayPrimitive[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [];
    const geometry = getPlanarGeometry(this.dto, range);
    return [
      {
        dasharray: "1 1",
        end: geometry.rotationHandle,
        id: "planar-rotation-guide",
        kind: "line",
        start: geometry.rotationGuideStart,
        strokeWidth: 0.35,
        tone: "accent",
      },
    ];
  }

  getHandles(context: EditingOverlayContext): LayerHandle[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [];
    const geometry = getPlanarGeometry(this.dto, range);
    return [
      { id: "position", kind: "move", label: "position", point: geometry.center },
      { id: "rotation", kind: "rotation", label: "rotation", point: geometry.rotationHandle },
      { id: "size", kind: "resize", label: "size", point: geometry.sizeHandle },
    ];
  }

  applyHandleDrag(handleId: string, pointer: PointerInput, context: EditingOverlayContext): TDto {
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
    const geometry = getPlanarGeometry(this.dto, range);
    if (handleId === "rotation") {
      const rawAngle =
        (Math.atan2(pointer.point.y - geometry.center.y, pointer.point.x - geometry.center.x) *
          180) /
          Math.PI +
        90;
      return this.withGeometry({
        rotationDegrees: normalizeAngle(
          Math.round(
            snapAngleDegrees(rawAngle, pointer.snapAngleDegrees ?? OVERLAY_INTEGER_INCREMENT),
          ),
        ),
      });
    }
    if (handleId === "size") {
      const canvasBounds = getPlanarGeometryCanvasBounds(context.project.canvas);
      const delta = {
        x: pointer.point.x - geometry.center.x,
        y: pointer.point.y - geometry.center.y,
      };
      const widthMm = snapDistanceMm(
        2 * (delta.x * geometry.localX.x + delta.y * geometry.localX.y),
        distanceIncrement,
      );
      const heightMm = snapDistanceMm(
        2 * (delta.x * geometry.localY.x + delta.y * geometry.localY.y),
        distanceIncrement,
      );
      return this.withGeometry({
        widthMm: clamp(widthMm, PLANAR_GEOMETRY_LIMITS.dimensionMm.min, canvasBounds.widthMm.max),
        heightMm: clamp(
          heightMm,
          PLANAR_GEOMETRY_LIMITS.dimensionMm.min,
          canvasBounds.heightMm.max,
        ),
      });
    }
    return this.dto;
  }

  private withGeometry(change: Partial<PlanarGeometryLayerDto["geometry"]>): TDto {
    return { ...this.dto, geometry: { ...this.dto.geometry, ...change } } as TDto;
  }
}

export function getPlanarGeometry(layer: PlanarGeometryLayerDto, range: RangeDto): PlanarGeometry {
  const radians = (layer.geometry.rotationDegrees * Math.PI) / 180;
  const localX = { x: Math.cos(radians), y: Math.sin(radians) };
  const localY = { x: -Math.sin(radians), y: Math.cos(radians) };
  const center = {
    x: range.centerX + layer.geometry.offsetXMm,
    y: range.centerY + layer.geometry.offsetYMm,
  };
  const rotationGuideStart = center;
  return {
    center,
    localX,
    localY,
    rotationGuideStart,
    rotationHandle: addScaled(center, localY, -ROTATION_HANDLE_DISTANCE_MM),
    sizeHandle: addScaled(
      addScaled(center, localX, layer.geometry.widthMm / 2),
      localY,
      layer.geometry.heightMm / 2,
    ),
  };
}

function addScaled(point: CanvasPointMm, direction: CanvasPointMm, scale: number): CanvasPointMm {
  return { x: point.x + direction.x * scale, y: point.y + direction.y * scale };
}
