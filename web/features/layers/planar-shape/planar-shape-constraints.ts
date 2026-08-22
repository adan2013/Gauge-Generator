import type { ValidationIssue } from "@/features/layers/core/layer";
import { getCanvasOffsetBounds } from "@/features/layers/core/canvas-offset-bounds";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type {
  CanvasDto,
  PlanarShapeLayerDto,
  RangeDto,
} from "@/features/project/project-dto/project-dto";
import { clamp } from "@/lib/geometry/geometry";

export function getPlanarShapeCanvasBounds(canvas: CanvasDto) {
  return {
    widthMm: { max: canvas.widthMm * 2 },
    heightMm: { max: canvas.heightMm * 2 },
    borderWidthMm: { max: Math.min(canvas.widthMm, canvas.heightMm) / 2 },
  };
}

export function getPlanarShapeValidationIssues(
  layer: PlanarShapeLayerDto,
  canvas: CanvasDto,
  range: RangeDto,
): ValidationIssue[] {
  const bounds = getCanvasOffsetBounds(canvas, range);
  const canvasBounds = getPlanarShapeCanvasBounds(canvas);
  const issues: ValidationIssue[] = [];
  if (
    layer.geometry.offsetXMm < bounds.offsetX.min ||
    layer.geometry.offsetXMm > bounds.offsetX.max
  )
    issues.push({
      path: "geometry.offsetXMm",
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  if (
    layer.geometry.offsetYMm < bounds.offsetY.min ||
    layer.geometry.offsetYMm > bounds.offsetY.max
  )
    issues.push({
      path: "geometry.offsetYMm",
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  if (layer.geometry.widthMm > canvasBounds.widthMm.max)
    issues.push({
      path: "geometry.widthMm",
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  if (layer.geometry.heightMm > canvasBounds.heightMm.max)
    issues.push({
      path: "geometry.heightMm",
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
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
  const bounds = getCanvasOffsetBounds(canvas, range);
  const canvasBounds = getPlanarShapeCanvasBounds(canvas);
  return {
    ...layer,
    geometry: {
      ...layer.geometry,
      offsetXMm: clamp(layer.geometry.offsetXMm, bounds.offsetX.min, bounds.offsetX.max),
      offsetYMm: clamp(layer.geometry.offsetYMm, bounds.offsetY.min, bounds.offsetY.max),
      widthMm: Math.min(layer.geometry.widthMm, canvasBounds.widthMm.max),
      heightMm: Math.min(layer.geometry.heightMm, canvasBounds.heightMm.max),
    },
    style: {
      ...layer.style,
      borderWidthMm: Math.min(layer.style.borderWidthMm, canvasBounds.borderWidthMm.max),
    },
  };
}
