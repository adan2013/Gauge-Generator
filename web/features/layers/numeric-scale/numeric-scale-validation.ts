import { getRangeMappedLayerValidationIssues } from "@/features/layers/core/range-layer-validation";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type {
  NumericScaleLayerDto,
  ProjectValidationIssue,
  RangeDto,
} from "@/features/project/project-dto/project-dto";

export function getNumericScaleValidationIssues(
  layer: NumericScaleLayerDto,
  sourceRange: RangeDto,
): ProjectValidationIssue[] {
  const issues = getRangeMappedLayerValidationIssues(layer, sourceRange);
  if (layer.fontSizeMm > sourceRange.radius + layer.radiusOffsetMm)
    issues.push({
      path: `layers.${layer.id}.fontSizeMm`,
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  return issues;
}
