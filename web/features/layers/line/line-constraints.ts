import type { ValidationIssue } from "@/features/layers/core/layer";
import { getCanvasOffsetBounds } from "@/features/layers/core/canvas-offset-bounds";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type { CanvasDto, LineLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { clamp } from "@/lib/geometry/geometry";

export function getLineCanvasBounds(canvas: CanvasDto) {
  return {
    lengthMm: { max: canvas.widthMm * 2 },
    strokeWidthMm: { max: Math.min(canvas.widthMm, canvas.heightMm) / 2 },
  };
}

export function getLineValidationIssues(
  layer: LineLayerDto,
  canvas: CanvasDto,
  range: RangeDto,
): ValidationIssue[] {
  const offsetBounds = getCanvasOffsetBounds(canvas, range);
  const canvasBounds = getLineCanvasBounds(canvas);
  const issues: ValidationIssue[] = [];
  if (
    layer.geometry.offsetXMm < offsetBounds.offsetX.min ||
    layer.geometry.offsetXMm > offsetBounds.offsetX.max
  )
    issues.push({
      path: "geometry.offsetXMm",
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  if (
    layer.geometry.offsetYMm < offsetBounds.offsetY.min ||
    layer.geometry.offsetYMm > offsetBounds.offsetY.max
  )
    issues.push({
      path: "geometry.offsetYMm",
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  if (layer.geometry.lengthMm > canvasBounds.lengthMm.max)
    issues.push({
      path: "geometry.lengthMm",
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  if (layer.style.strokeWidthMm > canvasBounds.strokeWidthMm.max)
    issues.push({
      path: "style.strokeWidthMm",
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  return issues;
}

export function constrainLineToCanvas(
  layer: LineLayerDto,
  range: RangeDto,
  canvas: CanvasDto,
): LineLayerDto {
  const offsetBounds = getCanvasOffsetBounds(canvas, range);
  const canvasBounds = getLineCanvasBounds(canvas);
  return {
    ...layer,
    geometry: {
      ...layer.geometry,
      offsetXMm: clamp(
        layer.geometry.offsetXMm,
        offsetBounds.offsetX.min,
        offsetBounds.offsetX.max,
      ),
      offsetYMm: clamp(
        layer.geometry.offsetYMm,
        offsetBounds.offsetY.min,
        offsetBounds.offsetY.max,
      ),
      lengthMm: Math.min(layer.geometry.lengthMm, canvasBounds.lengthMm.max),
    },
    style: {
      ...layer.style,
      strokeWidthMm: Math.min(layer.style.strokeWidthMm, canvasBounds.strokeWidthMm.max),
    },
  };
}
