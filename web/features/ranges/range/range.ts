import type {
  CanvasPointMm,
  LayerHandle,
  PointerInput,
  RenderContext,
  ValidationIssue,
} from "@/features/layers/core/layer";
import { OVERLAY_INTEGER_INCREMENT } from "@/features/layers/core/layer";
import type { EditingOverlayPrimitive } from "@/features/layers/core/editing-overlay-geometry";
import {
  getRangeRadiusMaximum,
  type CanvasDto,
  type RangeDto,
} from "@/features/project/project-dto/project-dto";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import {
  pointOnRoundedSquare,
  roundedSquareRadiusAtPoint,
} from "@/features/ranges/path-geometry/rounded-square-geometry";
import { roundedSquarePathData } from "@/features/ranges/path-geometry/rounded-square-geometry";
import { clamp, normalizeAngle, snapAngleDegrees, snapDistanceMm } from "@/lib/geometry/geometry";

export class Range {
  constructor(private readonly dto: RangeDto) {}

  get id() {
    return this.dto.id;
  }
  get name() {
    return this.dto.name;
  }
  get center(): CanvasPointMm {
    return { x: this.dto.centerX, y: this.dto.centerY };
  }
  toDto(): RangeDto {
    return this.dto;
  }

  getHandles(): LayerHandle[] {
    const endAngle = this.dto.angleStart + this.dto.openingAngle;
    return [
      { id: "center", kind: "move", label: "center", point: this.center },
      {
        id: "radius",
        kind: "radius",
        label: "radius",
        point: pointOnRoundedSquare(
          this.dto.centerX,
          this.dto.centerY,
          this.dto.radius,
          this.dto.angleStart + this.dto.openingAngle / 2,
          this.dto.cornerRadiusPercent,
        ).point,
      },
      {
        id: "angle-start",
        kind: "angle-start",
        label: "angle-start",
        point: pointOnRoundedSquare(
          this.dto.centerX,
          this.dto.centerY,
          this.dto.radius,
          this.dto.angleStart,
          this.dto.cornerRadiusPercent,
        ).point,
      },
      {
        id: "angle-end",
        kind: "angle-end",
        label: "angle-end",
        point: pointOnRoundedSquare(
          this.dto.centerX,
          this.dto.centerY,
          this.dto.radius,
          endAngle,
          this.dto.cornerRadiusPercent,
        ).point,
      },
    ];
  }

  getEditingOverlay(): readonly EditingOverlayPrimitive[] {
    const handles = this.getHandles();
    const start = handles.find((handle) => handle.id === "angle-start")!.point;
    const end = handles.find((handle) => handle.id === "angle-end")!.point;
    const radius = handles.find((handle) => handle.id === "radius")!.point;

    return [
      {
        d: roundedSquarePathData({
          angleStart: this.dto.angleStart,
          centerX: this.dto.centerX,
          centerY: this.dto.centerY,
          cornerRadiusPercent: this.dto.cornerRadiusPercent,
          openingAngle: this.dto.openingAngle,
          radius: this.dto.radius,
        }),
        dasharray: "2 2",
        id: "range-overlay-arc",
        kind: "path",
        strokeWidth: 0.6,
        tone: "accent",
      },
      {
        dasharray: "1.5 1.5",
        end: start,
        id: "range-start-angle-guide",
        kind: "line",
        start: this.center,
        strokeWidth: 0.4,
        tone: "muted",
      },
      {
        dasharray: "1.5 1.5",
        end,
        id: "range-opening-angle-guide",
        kind: "line",
        start: this.center,
        strokeWidth: 0.4,
        tone: "muted",
      },
      {
        dasharray: "0.6 1.2",
        end: radius,
        id: "range-radius-guide",
        kind: "line",
        start: this.center,
        strokeWidth: 0.5,
        tone: "accent",
      },
    ];
  }

  applyHandleDrag(handleId: string, pointer: PointerInput, canvas: CanvasDto): RangeDto {
    const { point } = pointer;
    const distanceIncrement = pointer.snapDistanceMm ?? OVERLAY_INTEGER_INCREMENT;
    const angleIncrement = pointer.snapAngleDegrees ?? OVERLAY_INTEGER_INCREMENT;
    if (handleId === "center") {
      return {
        ...this.dto,
        centerX: clamp(snapDistanceMm(point.x, distanceIncrement), 0, canvas.widthMm),
        centerY: clamp(snapDistanceMm(point.y, distanceIncrement), 0, canvas.heightMm),
      };
    }
    if (handleId === "radius") {
      return {
        ...this.dto,
        radius: clamp(
          snapDistanceMm(
            roundedSquareRadiusAtPoint(
              this.dto.centerX,
              this.dto.centerY,
              point,
              this.dto.cornerRadiusPercent,
            ),
            distanceIncrement,
          ),
          5,
          getRangeRadiusMaximum(canvas),
        ),
      };
    }
    if (handleId === "angle-start") {
      return {
        ...this.dto,
        angleStart: normalizeAngle(
          snapAngleDegrees(angleFromPoint(this.center, point), angleIncrement),
        ),
      };
    }
    if (handleId === "angle-end") {
      const unsignedDifference = normalizeAngle(
        angleFromPoint(this.center, point) - this.dto.angleStart,
      );
      const openingAngle =
        this.dto.openingAngle < 0
          ? unsignedDifference === 0
            ? 0
            : unsignedDifference - 360
          : unsignedDifference;
      return { ...this.dto, openingAngle: snapAngleDegrees(openingAngle, angleIncrement) };
    }
    return this.dto;
  }

  validate(context: Pick<RenderContext, "project">): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    if (this.dto.centerX > context.project.canvas.widthMm)
      issues.push({ path: "centerX", code: PROJECT_VALIDATION_CODES.rangeCenterOutsideCanvas });
    if (this.dto.centerY > context.project.canvas.heightMm)
      issues.push({ path: "centerY", code: PROJECT_VALIDATION_CODES.rangeCenterOutsideCanvas });
    if (this.dto.radius > getRangeRadiusMaximum(context.project.canvas))
      issues.push({ path: "radius", code: PROJECT_VALIDATION_CODES.rangeRadiusOutsideCanvasLimit });
    const scale = this.dto.scaleDefinition;
    if (scale.mode !== "custom" && scale.start >= scale.end)
      issues.push({
        path: "scaleDefinition",
        code: PROJECT_VALIDATION_CODES.scaleBoundsNotAscending,
      });
    if (scale.mode === "custom") {
      if (scale.points[0]?.position !== 0)
        issues.push({
          path: "scaleDefinition.points.0.position",
          code: PROJECT_VALIDATION_CODES.customScaleEndpointsInvalid,
        });
      if (scale.points.at(-1)?.position !== 1)
        issues.push({
          path: `scaleDefinition.points.${scale.points.length - 1}.position`,
          code: PROJECT_VALIDATION_CODES.customScaleEndpointsInvalid,
        });
      for (let index = 1; index < scale.points.length; index += 1) {
        const previous = scale.points[index - 1];
        const point = scale.points[index];
        if (point.value <= previous.value || point.position <= previous.position)
          issues.push({
            path: `scaleDefinition.points.${index}`,
            code: PROJECT_VALIDATION_CODES.customScaleNotMonotonic,
          });
      }
    }
    return issues;
  }
}

function angleFromPoint(center: CanvasPointMm, point: CanvasPointMm): number {
  return normalizeAngle((Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI);
}
