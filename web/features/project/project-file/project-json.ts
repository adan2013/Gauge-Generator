import { validateProject } from "@/features/project/project-dto/project-validation";
import type { ProjectDto } from "@/features/project/project-dto/project-dto";

export type ProjectJsonParseResult = { success: true; project: ProjectDto } | { success: false };

export function parseProjectJson(source: string): ProjectJsonParseResult {
  try {
    const result = validateProject(JSON.parse(source));
    return result.data ? { success: true, project: result.data } : { success: false };
  } catch {
    return { success: false };
  }
}

export function serializeProjectJson(project: ProjectDto): string {
  const result = validateProject(project);
  if (!result.data) throw new Error("Cannot serialize an invalid project.");
  return `${JSON.stringify(result.data, null, 2)}\n`;
}
