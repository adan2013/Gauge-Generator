import { createLayerModel } from "@/features/layers/core/layer-registry";
import { Range } from "@/features/ranges/range/range";
import { PROJECT_VALIDATION_CODES, type ProjectValidationCode } from "./project-validation-codes";
import { ProjectSchema, type ProjectDto } from "./project-dto";

export type ProjectValidationIssue = { path: string; code: ProjectValidationCode };

function withObjectPath(
  collection: "layers" | "ranges",
  id: string,
  path: string,
): ProjectValidationIssue["path"] {
  return `${collection}.${id}${path ? `.${path}` : ""}`;
}

export function validateProject(project: unknown): {
  data?: ProjectDto;
  issues: ProjectValidationIssue[];
} {
  const parsed = ProjectSchema.safeParse(project);
  if (!parsed.success) {
    return {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        code: PROJECT_VALIDATION_CODES.invalidSchema,
      })),
    };
  }

  const { data } = parsed;
  const issues: ProjectValidationIssue[] = [];
  const ids = [...data.ranges.map((range) => range.id), ...data.layers.map((layer) => layer.id)];
  if (new Set(ids).size !== ids.length)
    issues.push({ path: "", code: PROJECT_VALIDATION_CODES.duplicateObjectId });

  const rangeById = new Map(data.ranges.map((range) => [range.id, range]));
  const context = { project: data, rangeById };
  for (const range of data.ranges) {
    for (const issue of new Range(range).validate(context))
      issues.push({
        ...issue,
        path: withObjectPath("ranges", range.id, issue.path),
      });
  }
  for (const layer of data.layers) {
    for (const issue of createLayerModel(layer).validate(context))
      issues.push({
        ...issue,
        path: withObjectPath("layers", layer.id, issue.path),
      });
  }

  return issues.length > 0 ? { issues } : { data, issues: [] };
}
