import type { ValidationIssue } from "@/features/layers/core/layer";
import {
  constrainPlanarGeometryToCanvas,
  getPlanarGeometryCanvasBounds,
  getPlanarGeometryValidationIssues,
} from "@/features/layers/planar-geometry/planar-geometry-constraints";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type {
  CanvasDto,
  PlanarShapeLayerDto,
  RangeDto,
} from "@/features/project/project-dto/project-dto";

export function getPlanarShapeCanvasBounds(canvas: CanvasDto) {
  return {
    ...getPlanarGeometryCanvasBounds(canvas),
    borderWidthMm: { max: Math.min(canvas.widthMm, canvas.heightMm) / 2 },
  };
}

export function getPlanarShapeValidationIssues(
  layer: PlanarShapeLayerDto,
  canvas: CanvasDto,
  range: RangeDto,
): ValidationIssue[] {
  const issues = getPlanarGeometryValidationIssues(layer, canvas, range);
  const canvasBounds = getPlanarShapeCanvasBounds(canvas);
  if (layer.style.borderWidthMm > canvasBounds.borderWidthMm.max)
    issues.push({
      path: "style.borderWidthMm",
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  return issues;
}

export function constrainPlanarShapeToCanvas<TLayer extends PlanarShapeLayerDto>(
  layer: TLayer,
  range: RangeDto,
  canvas: CanvasDto,
): TLayer {
  const canvasBounds = getPlanarShapeCanvasBounds(canvas);
  const constrained = constrainPlanarGeometryToCanvas(layer, range, canvas);
  return {
    ...constrained,
    style: {
      ...constrained.style,
      borderWidthMm: Math.min(layer.style.borderWidthMm, canvasBounds.borderWidthMm.max),
    },
  };
}
