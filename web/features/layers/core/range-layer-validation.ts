import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type { ProjectValidationIssue, RangeDto } from "@/features/project/project-dto/project-dto";

type RangeMappedLayer = {
  id: string;
  radiusOffsetMm: number;
  valueEnd: number;
  valueStart: number;
  valueStep: number;
};

export function getRangeMappedLayerValidationIssues(
  layer: RangeMappedLayer,
  sourceRange: RangeDto,
): ProjectValidationIssue[] {
  const issues: ProjectValidationIssue[] = [];
  const effectiveRadiusMm = sourceRange.radius + layer.radiusOffsetMm;
  if (effectiveRadiusMm <= 0)
    issues.push({
      path: `layers.${layer.id}.radiusOffsetMm`,
      code: PROJECT_VALIDATION_CODES.valueMustBePositive,
    });
  if (layer.radiusOffsetMm > sourceRange.radius)
    issues.push({
      path: `layers.${layer.id}.radiusOffsetMm`,
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  const values =
    sourceRange.scaleDefinition.mode === "custom"
      ? sourceRange.scaleDefinition.points.map((point) => point.value)
      : [sourceRange.scaleDefinition.start, sourceRange.scaleDefinition.end];
  if (layer.valueStart < Math.min(...values) || layer.valueEnd > Math.max(...values))
    issues.push({
      path: `layers.${layer.id}`,
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  if (layer.valueStart > layer.valueEnd)
    issues.push({
      path: `layers.${layer.id}.valueStart`,
      code: PROJECT_VALIDATION_CODES.valueStartAfterEnd,
    });
  if (Math.floor((layer.valueEnd - layer.valueStart) / layer.valueStep) + 1 > 200)
    issues.push({
      path: `layers.${layer.id}.valueStep`,
      code: PROJECT_VALIDATION_CODES.tooManyGeneratedItems,
    });
  return issues;
}
