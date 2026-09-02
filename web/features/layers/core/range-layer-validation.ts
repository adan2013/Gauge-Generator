import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type { ValidationIssue } from "@/features/layers/core/layer";
import { MAX_GENERATED_SCALE_ITEMS } from "@/features/ranges/scale-mapping/scale-constants";
import { getRangeScaleValueBounds } from "@/features/ranges/scale-mapping/scale-mapping";
import { getScaleItemCount } from "@/features/ranges/scale-mapping/scale-sequence";
import type { RangeDto } from "@/features/project/project-dto/project-dto";
import { getEffectiveRadiusMm } from "@/features/layers/core/range-mapped-layer-geometry";

type RangeMappedLayer = {
  radiusOffsetMm: number;
  valueEnd: number;
  valueStart: number;
  valueStep: number;
};

type RangeMappedIntervalLayer = Omit<RangeMappedLayer, "valueStep">;

export function getRangeMappedIntervalValidationIssues(
  layer: RangeMappedIntervalLayer,
  sourceRange: RangeDto,
  requireSpan = false,
): ValidationIssue[] {
  const effectiveRadiusMm = getEffectiveRadiusMm(layer, sourceRange);
  const issues: ValidationIssue[] = [];
  if (effectiveRadiusMm <= 0)
    issues.push({
      path: "radiusOffsetMm",
      code: PROJECT_VALIDATION_CODES.valueMustBePositive,
    });
  if (layer.radiusOffsetMm > sourceRange.radius)
    issues.push({
      path: "radiusOffsetMm",
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  const valueBounds = getRangeScaleValueBounds(sourceRange);
  if (layer.valueStart < valueBounds.min || layer.valueEnd > valueBounds.max)
    issues.push({
      path: "valueStart",
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  if (layer.valueStart > layer.valueEnd)
    issues.push({
      path: "valueStart",
      code: PROJECT_VALIDATION_CODES.valueStartAfterEnd,
    });
  else if (requireSpan && layer.valueStart === layer.valueEnd)
    issues.push({
      path: "valueStart",
      code: PROJECT_VALIDATION_CODES.valueRangeMustHaveSpan,
    });
  return issues;
}

export function getRangeMappedLayerValidationIssues(
  layer: RangeMappedLayer,
  sourceRange: RangeDto,
): ValidationIssue[] {
  const issues = getRangeMappedIntervalValidationIssues(layer, sourceRange);
  if (getScaleItemCount(layer) > MAX_GENERATED_SCALE_ITEMS)
    issues.push({
      path: "valueStep",
      code: PROJECT_VALIDATION_CODES.tooManyGeneratedItems,
    });
  return issues;
}
