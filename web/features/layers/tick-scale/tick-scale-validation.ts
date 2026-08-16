import { getRangeMappedLayerValidationIssues } from "@/features/layers/core/range-layer-validation";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type {
  ProjectValidationIssue,
  RangeDto,
  TickScaleLayerDto,
} from "@/features/project/project-dto/project-dto";

export function getTickScaleValidationIssues(
  layer: TickScaleLayerDto,
  sourceRange: RangeDto,
): ProjectValidationIssue[] {
  const issues = getRangeMappedLayerValidationIssues(layer, sourceRange);
  const effectiveRadiusMm = sourceRange.radius + layer.radiusOffsetMm;
  if (layer.tickLengthMm > effectiveRadiusMm)
    issues.push({
      path: `layers.${layer.id}.tickLengthMm`,
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  if (layer.tickWidthMm > layer.tickLengthMm)
    issues.push({
      path: `layers.${layer.id}.tickWidthMm`,
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  return issues;
}
