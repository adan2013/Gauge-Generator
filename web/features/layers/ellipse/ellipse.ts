import type { RenderContext } from "@/features/layers/core/layer";
import { formatSvgNumber } from "@/features/layers/core/text-style/text-style-svg";
import {
  getPlanarShapeGeometry,
  PlanarShapeLayer,
} from "@/features/layers/planar-shape/planar-shape";
import type { EllipseLayerDto } from "@/features/project/project-dto/project-dto";

export class EllipseLayer extends PlanarShapeLayer<EllipseLayerDto> {
  constructor(dto: EllipseLayerDto) {
    super(dto);
  }

  toSvg(context: RenderContext): string {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range || !this.dto.visible) return "";
    const { center } = getPlanarShapeGeometry(this.dto, range);
    const transform = this.dto.geometry.rotationDegrees
      ? ` transform="rotate(${this.dto.geometry.rotationDegrees} ${formatSvgNumber(center.x)} ${formatSvgNumber(center.y)})"`
      : "";
    return `<ellipse cx="${formatSvgNumber(center.x)}" cy="${formatSvgNumber(center.y)}" rx="${formatSvgNumber(this.dto.geometry.widthMm / 2)}" ry="${formatSvgNumber(this.dto.geometry.heightMm / 2)}" fill="${this.dto.style.fillColor}" stroke="${this.dto.style.borderColor}" stroke-width="${formatSvgNumber(this.dto.style.borderWidthMm)}"${transform} />`;
  }
}
