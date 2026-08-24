import type { LayerDto, ProjectDto } from "@/features/project/project-dto/project-dto";
import { sanitizeFilename } from "@/features/project/project-file/project-filename";
import type { ProjectExportScope } from "./project-export-options";

export type ProjectExportTarget = {
  filename: string;
  layerIds?: ReadonlySet<string>;
  transparentBackground: boolean;
};

export function createProjectExportTargets(
  project: ProjectDto,
  scope: ProjectExportScope,
): ProjectExportTarget[] {
  if (scope === "combined") {
    return [
      {
        filename: sanitizeFilename(project.meta.title),
        transparentBackground: project.canvas.transparentBackground,
      },
    ];
  }

  return project.layers
    .filter((layer) => layer.visible)
    .map((layer, index) => createLayerTarget(layer, index));
}

function createLayerTarget(layer: LayerDto, index: number): ProjectExportTarget {
  return {
    filename: `${String(index + 1).padStart(2, "0")}-${sanitizeFilename(layer.name)}`,
    layerIds: new Set([layer.id]),
    transparentBackground: true,
  };
}
