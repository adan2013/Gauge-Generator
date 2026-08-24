import { createLayerModel } from "@/features/layers/core/layer-registry";
import { escapeXml } from "@/features/layers/core/text-style/text-style-svg";
import type { SvgIconDefinition } from "@/features/layers/icon/lucide-icon-resources";
import type { ProjectDto } from "@/features/project/project-dto/project-dto";

export type RenderedProjectLayer = {
  id: string;
  name: string;
  svg: string;
};

type ProjectRenderOptions = {
  layerIds?: ReadonlySet<string>;
  transparentBackground?: boolean;
};

export function getProjectIconNames(project: ProjectDto, layerIds?: ReadonlySet<string>): string[] {
  return project.layers.flatMap((layer) =>
    layer.type === "icon" && (!layerIds || layerIds.has(layer.id)) ? [layer.icon.name] : [],
  );
}

export function renderProjectLayers(
  project: ProjectDto,
  iconDefinitions: ReadonlyMap<string, SvgIconDefinition>,
  layerIds?: ReadonlySet<string>,
): RenderedProjectLayer[] {
  const renderContext = {
    iconDefinitions,
    project,
    rangeById: new Map(project.ranges.map((range) => [range.id, range])),
  };

  return project.layers
    .filter((layer) => layer.visible && (!layerIds || layerIds.has(layer.id)))
    .toReversed()
    .map((layer) => ({
      id: layer.id,
      name: layer.name,
      svg: createLayerModel(layer).toSvg(renderContext),
    }))
    .filter((layer) => layer.svg.length > 0);
}

export function renderProjectSvgContent(
  project: ProjectDto,
  iconDefinitions: ReadonlyMap<string, SvgIconDefinition>,
  options: ProjectRenderOptions = {},
): string {
  const transparentBackground =
    options.transparentBackground ?? project.canvas.transparentBackground;
  const background = transparentBackground
    ? ""
    : `<rect width="${project.canvas.widthMm}" height="${project.canvas.heightMm}" fill="${project.canvas.background}" />`;
  const layers = renderProjectLayers(project, iconDefinitions, options.layerIds)
    .map(
      (layer) =>
        `<g data-layer-id="${escapeXml(layer.id)}" data-layer-name="${escapeXml(layer.name)}">${layer.svg}</g>`,
    )
    .join("");
  return `${background}${layers}`;
}

export function renderProjectSvgDocument(
  project: ProjectDto,
  iconDefinitions: ReadonlyMap<string, SvgIconDefinition>,
  options: ProjectRenderOptions = {},
): string {
  const { heightMm, widthMm } = project.canvas;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${heightMm}mm" viewBox="0 0 ${widthMm} ${heightMm}">`,
    `<title>${escapeXml(project.meta.title)}</title>`,
    renderProjectSvgContent(project, iconDefinitions, options),
    "</svg>",
  ].join("");
}
