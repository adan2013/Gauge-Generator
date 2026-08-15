import type { CanvasPointMm, NumericPropertyDefinition, RenderContext, ValidationIssue } from "@/features/layers/core/layer";
import { CANVAS_DIMENSION_MAX_MM, type CanvasDto, type RangeDto } from "@/features/project/project-dto/project-dto";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";

export class Range {
  constructor(private readonly dto: RangeDto) {}

  get id() { return this.dto.id; }
  get name() { return this.dto.name; }
  get center(): CanvasPointMm { return { x: this.dto.centerX, y: this.dto.centerY }; }
  toDto(): RangeDto { return this.dto; }

  /** Domain-owned limits let the editor render controls without hardcoding them. */
  getNumericPropertyDefinitions(canvas: CanvasDto): Record<"centerX" | "centerY" | "radius" | "openingAngle", NumericPropertyDefinition> {
    return {
      centerX: { min: 0, max: canvas.widthMm, step: 1 },
      centerY: { min: 0, max: canvas.heightMm, step: 1 },
      radius: { min: 0.1, max: Math.max(CANVAS_DIMENSION_MAX_MM, this.dto.radius), step: 1 },
      openingAngle: { min: -360, max: 360, step: 1 },
    };
  }

  validate(context: Pick<RenderContext, "project">): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    if (this.dto.centerX > context.project.canvas.widthMm) issues.push({ path: "centerX", code: PROJECT_VALIDATION_CODES.rangeCenterOutsideCanvas });
    if (this.dto.centerY > context.project.canvas.heightMm) issues.push({ path: "centerY", code: PROJECT_VALIDATION_CODES.rangeCenterOutsideCanvas });
    return issues;
  }
}
