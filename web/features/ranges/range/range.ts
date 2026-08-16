import type {
  CanvasPointMm,
  LayerHandle,
  PointerInput,
  RenderContext,
  ValidationIssue,
} from "@/features/layers/core/layer";
import {
  getRangeRadiusMaximum,
  type CanvasDto,
  type RangeDto,
} from "@/features/project/project-dto/project-dto";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
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
        point: pointAtAngle(
          this.center,
          this.dto.radius,
          this.dto.angleStart + this.dto.openingAngle / 2,
        ),
      },
      {
        id: "angle-start",
        kind: "angle-start",
        label: "angle-start",
        point: pointAtAngle(this.center, this.dto.radius, this.dto.angleStart),
      },
      {
        id: "angle-end",
        kind: "angle-end",
        label: "angle-end",
        point: pointAtAngle(this.center, this.dto.radius, endAngle),
      },
    ];
  }

  applyHandleDrag(handleId: string, pointer: PointerInput, canvas: CanvasDto): RangeDto {
    const { point } = pointer;
    const distanceIncrement = pointer.snapDistanceMm ?? 1;
    const angleIncrement = pointer.snapAngleDegrees ?? 1;
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
          snapDistanceMm(distance(this.center, point), distanceIncrement),
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
    if (scale.mode !== "custom" && scale.start === scale.end)
      issues.push({ path: "scaleDefinition", code: PROJECT_VALIDATION_CODES.scaleStartEqualsEnd });
    if (scale.mode === "custom") {
      for (let index = 1; index < scale.points.length; index += 1) {
        const previous = scale.points[index - 1];
        const point = scale.points[index];
        if (point.value <= previous.value || point.position < previous.position)
          issues.push({
            path: `scaleDefinition.points.${index}`,
            code: PROJECT_VALIDATION_CODES.customScaleNotMonotonic,
          });
      }
    }
    return issues;
  }
}

function pointAtAngle(center: CanvasPointMm, radius: number, angle: number): CanvasPointMm {
  const radians = (angle * Math.PI) / 180;
  return { x: center.x + radius * Math.cos(radians), y: center.y + radius * Math.sin(radians) };
}

function angleFromPoint(center: CanvasPointMm, point: CanvasPointMm): number {
  return normalizeAngle((Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI);
}

function distance(first: CanvasPointMm, second: CanvasPointMm): number {
  return Math.hypot(second.x - first.x, second.y - first.y);
}
