import { createLayerModel } from "@/features/layers/core/layer-registry";
import type { LayerDto, ProjectDto } from "@/features/project/project-dto/project-dto";

type LayerThumbnailProps = {
  layer: LayerDto;
  project: ProjectDto;
};

export function LayerThumbnail({ layer, project }: LayerThumbnailProps) {
  const model = createLayerModel(layer);
  const svg = model.toSvg({
    project,
    rangeById: new Map(project.ranges.map((range) => [range.id, range])),
  });

  return (
    <svg
      aria-hidden="true"
      className="size-8 shrink-0 rounded border border-border bg-surface-subtle"
      data-testid={`layer-thumbnail-${layer.id}`}
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${project.canvas.widthMm} ${project.canvas.heightMm}`}
    >
      <g dangerouslySetInnerHTML={{ __html: svg }} />
    </svg>
  );
}
