import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type { ValidationIssue } from "@/features/layers/core/layer";
import {
  getRangeScaleValueBounds,
  getScaleItemCount,
} from "@/features/ranges/scale-mapping/scale-mapping";
import type { LayerDto, RangeDto } from "@/features/project/project-dto/project-dto";

type RangeMappedLayer = Pick<LayerDto, "radiusOffsetMm" | "valueEnd" | "valueStart" | "valueStep">;

export function getRangeMappedLayerValidationIssues(
  layer: RangeMappedLayer,
  sourceRange: RangeDto,
): ValidationIssue[] {
  const effectiveRadiusMm = sourceRange.radius + layer.radiusOffsetMm;
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
  if (getScaleItemCount(layer) > 200)
    issues.push({
      path: "valueStep",
      code: PROJECT_VALIDATION_CODES.tooManyGeneratedItems,
    });
  return issues;
}
