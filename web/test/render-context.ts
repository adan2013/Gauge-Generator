import type { EditingOverlayContext, RenderContext } from "@/features/layers/core/layer";
import { createProject } from "@/features/project/factories/project-factories";
import type { ProjectDto } from "@/features/project/project-dto/project-dto";

export function createRenderContext(project: ProjectDto = createProject()): RenderContext {
  return { project, rangeById: new Map(project.ranges.map((range) => [range.id, range])) };
}

export function createEditingOverlayContext(
  project: ProjectDto = createProject(),
  zoom = 1,
): EditingOverlayContext {
  return { ...createRenderContext(project), zoom };
}
