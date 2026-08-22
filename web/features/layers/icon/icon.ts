import type { RenderContext, ValidationIssue } from "@/features/layers/core/layer";
import {
  getPlanarGeometry,
  PlanarGeometryLayer,
  type PlanarGeometry,
} from "@/features/layers/planar-geometry/planar-geometry";
import { escapeXml, formatSvgNumber } from "@/features/layers/core/text-style/text-style-svg";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type { IconLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { getIconValidationIssues } from "./icon-constraints";
import { isLucideIconName, type SvgIconDefinition } from "./lucide-icon-resources";

export type IconGeometry = PlanarGeometry;

export class IconLayer extends PlanarGeometryLayer<IconLayerDto> {
  constructor(dto: IconLayerDto) {
    super(dto);
  }

  protected override getValidationIssues(
    context: RenderContext,
    range: RangeDto,
  ): ValidationIssue[] {
    const issues: ValidationIssue[] = super.getValidationIssues(context, range);
    issues.push(...getIconValidationIssues(this.dto, context.project.canvas));
    if (!isLucideIconName(this.dto.icon.name))
      issues.unshift({ path: "icon.name", code: PROJECT_VALIDATION_CODES.invalidSchema });
    return issues;
  }

  toSvg(context: RenderContext): string {
    const range = context.rangeById.get(this.dto.rangeId);
    const definition = context.iconDefinitions?.get(this.dto.icon.name);
    if (!range || !definition || !this.dto.visible) return "";
    return renderIcon(this.dto, range, definition);
  }
}

export function getIconGeometry(layer: IconLayerDto, range: RangeDto): IconGeometry {
  return getPlanarGeometry(layer, range);
}

function renderIcon(layer: IconLayerDto, range: RangeDto, definition: SvgIconDefinition): string {
  const geometry = getIconGeometry(layer, range);
  const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = definition.viewBox;
  const scaleX = layer.geometry.widthMm / viewBoxWidth;
  const scaleY = layer.geometry.heightMm / viewBoxHeight;
  const strokeScale = Math.sqrt(scaleX * scaleY);
  const transform = [
    `translate(${formatSvgNumber(geometry.center.x)} ${formatSvgNumber(geometry.center.y)})`,
    layer.geometry.rotationDegrees ? `rotate(${layer.geometry.rotationDegrees})` : "",
    `scale(${formatSvgNumber(scaleX)} ${formatSvgNumber(scaleY)})`,
    `translate(${formatSvgNumber(-(viewBoxX + viewBoxWidth / 2))} ${formatSvgNumber(-(viewBoxY + viewBoxHeight / 2))})`,
  ]
    .filter(Boolean)
    .join(" ");
  const nodes = definition.nodes.map(renderSvgIconNode).join("");
  return `<g transform="${transform}" color="${layer.style.color}" fill="none" stroke="currentColor" stroke-width="${formatSvgNumber(layer.style.strokeWidthMm / strokeScale)}" stroke-linecap="round" stroke-linejoin="round">${nodes}</g>`;
}

function renderSvgIconNode([tag, attributes]: SvgIconDefinition["nodes"][number]): string {
  const serializedAttributes = Object.entries(attributes)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `${name}="${escapeXml(value)}"`)
    .join(" ");
  return `<${tag}${serializedAttributes ? ` ${serializedAttributes}` : ""} />`;
}
