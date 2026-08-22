import type { ValidationIssue } from "@/features/layers/core/layer";
import { constrainPlanarGeometryToCanvas } from "@/features/layers/planar-geometry/planar-geometry-constraints";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type { CanvasDto, IconLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";

export function getIconCanvasBounds(canvas: CanvasDto) {
  const shorterSide = Math.min(canvas.widthMm, canvas.heightMm);
  return {
    strokeWidthMm: { max: shorterSide / 2 },
  };
}

export function getIconValidationIssues(layer: IconLayerDto, canvas: CanvasDto): ValidationIssue[] {
  const canvasBounds = getIconCanvasBounds(canvas);
  const issues: ValidationIssue[] = [];
  if (layer.style.strokeWidthMm > canvasBounds.strokeWidthMm.max)
    issues.push({
      path: "style.strokeWidthMm",
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  return issues;
}

export function constrainIconToCanvas(
  layer: IconLayerDto,
  range: RangeDto,
  canvas: CanvasDto,
): IconLayerDto {
  const constrained = constrainPlanarGeometryToCanvas(layer, range, canvas);
  const canvasBounds = getIconCanvasBounds(canvas);
  return {
    ...constrained,
    style: {
      ...constrained.style,
      strokeWidthMm: Math.min(constrained.style.strokeWidthMm, canvasBounds.strokeWidthMm.max),
    },
  };
}
