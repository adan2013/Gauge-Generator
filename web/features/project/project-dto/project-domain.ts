import { Range } from "@/features/ranges/range/range";
import type { LayerDto, ProjectDto } from "./project-dto";

export type ProjectDomain = {
  project: Omit<ProjectDto, "layers" | "ranges">;
  layers: LayerDto[];
  ranges: Range[];
};

export function toDomainProject(project: ProjectDto): ProjectDomain {
  const { layers, ranges, ...projectData } = project;
  return { project: projectData, layers, ranges: ranges.map((range) => new Range(range)) };
}

export function fromDomainProject(domain: ProjectDomain): ProjectDto {
  return {
    ...domain.project,
    layers: domain.layers,
    ranges: domain.ranges.map((range) => range.toDto()),
  };
}
