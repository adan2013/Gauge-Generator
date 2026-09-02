import {
  getEffectiveRadiusMm,
  getRadiusOffsetBounds,
} from "@/features/layers/core/range-mapped-layer-geometry";
import type { ValidationIssue } from "@/features/layers/core/layer";
import { getCanvasOffsetBounds } from "@/features/layers/core/canvas-offset-bounds";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type {
  CanvasDto,
  LabelLayerDto,
  RangeDto,
} from "@/features/project/project-dto/project-dto";
import { getRangeScaleValueBounds } from "@/features/ranges/scale-mapping/scale-mapping";
import { clamp } from "@/lib/geometry/geometry";

export const LABEL_MINIMUM_EFFECTIVE_RADIUS_MM = 0.5;

export function getLabelLayoutValidationIssues(
  layer: LabelLayerDto,
  canvas: CanvasDto,
  range: RangeDto,
): ValidationIssue[] {
  if (layer.layout.mode === "point") {
    const bounds = getCanvasOffsetBounds(canvas, range);
    const issues: ValidationIssue[] = [];
    if (layer.layout.offsetXMm < bounds.offsetX.min || layer.layout.offsetXMm > bounds.offsetX.max)
      issues.push({
        path: "layout.offsetXMm",
        code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
      });
    if (layer.layout.offsetYMm < bounds.offsetY.min || layer.layout.offsetYMm > bounds.offsetY.max)
      issues.push({
        path: "layout.offsetYMm",
        code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
      });
    return issues;
  }

  const issues: ValidationIssue[] = [];
  const effectiveRadiusMm = getEffectiveRadiusMm(layer.layout, range);
  const valueBounds = getRangeScaleValueBounds(range);
  if (effectiveRadiusMm < LABEL_MINIMUM_EFFECTIVE_RADIUS_MM)
    issues.push({
      path: "layout.radiusOffsetMm",
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  if (layer.layout.radiusOffsetMm > range.radius)
    issues.push({
      path: "layout.radiusOffsetMm",
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  if (layer.layout.valueStart < valueBounds.min || layer.layout.valueEnd > valueBounds.max)
    issues.push({
      path: "layout.valueStart",
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  if (layer.layout.valueStart > layer.layout.valueEnd)
    issues.push({
      path: "layout.valueStart",
      code: PROJECT_VALIDATION_CODES.valueStartAfterEnd,
    });
  else if (layer.layout.valueStart === layer.layout.valueEnd)
    issues.push({
      path: "layout.valueStart",
      code: PROJECT_VALIDATION_CODES.valueRangeMustHaveSpan,
    });
  return issues;
}

export function constrainLabelToRange(
  layer: LabelLayerDto,
  range: RangeDto,
  canvas: CanvasDto,
): LabelLayerDto {
  if (layer.layout.mode === "point") {
    const bounds = getCanvasOffsetBounds(canvas, range);
    return {
      ...layer,
      layout: {
        ...layer.layout,
        offsetXMm: clamp(layer.layout.offsetXMm, bounds.offsetX.min, bounds.offsetX.max),
        offsetYMm: clamp(layer.layout.offsetYMm, bounds.offsetY.min, bounds.offsetY.max),
      },
    };
  }

  const bounds = getRangeScaleValueBounds(range);
  let valueStart = clamp(layer.layout.valueStart, bounds.min, bounds.max);
  let valueEnd = clamp(layer.layout.valueEnd, bounds.min, bounds.max);
  if (valueStart >= valueEnd) {
    if (valueStart >= bounds.max) {
      valueStart = bounds.max - 1;
      valueEnd = bounds.max;
    } else valueEnd = valueStart + 1;
  }
  const radiusBounds = getLabelTextArcRadiusOffsetBounds(range);
  return {
    ...layer,
    layout: {
      ...layer.layout,
      radiusOffsetMm: clamp(
        layer.layout.radiusOffsetMm,
        radiusBounds.minRadiusOffsetMm,
        radiusBounds.maxRadiusOffsetMm,
      ),
      valueStart,
      valueEnd,
    },
  };
}

export function getLabelTextArcRadiusOffsetBounds(range: RangeDto) {
  return getRadiusOffsetBounds(range, LABEL_MINIMUM_EFFECTIVE_RADIUS_MM);
}
