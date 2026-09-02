import type { RenderContext } from "@/features/layers/core/layer";
import { formatSvgNumber } from "@/features/layers/core/text-style/text-style-svg";
import { getPlanarGeometry } from "@/features/layers/planar-geometry/planar-geometry";
import { PlanarShapeLayer } from "@/features/layers/planar-shape/planar-shape";
import type { RectangleLayerDto } from "@/features/project/project-dto/project-dto";

export class RectangleLayer extends PlanarShapeLayer<RectangleLayerDto> {
  constructor(dto: RectangleLayerDto) {
    super(dto);
  }

  toSvg(context: RenderContext): string {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range || !this.dto.visible) return "";
    const { center } = getPlanarGeometry(this.dto, range);
    const radiusMm =
      (Math.min(this.dto.geometry.widthMm, this.dto.geometry.heightMm) *
        this.dto.cornerRadiusPercent) /
      100;
    const transform = this.dto.geometry.rotationDegrees
      ? ` transform="rotate(${this.dto.geometry.rotationDegrees} ${formatSvgNumber(center.x)} ${formatSvgNumber(center.y)})"`
      : "";
    return `<rect x="${formatSvgNumber(center.x - this.dto.geometry.widthMm / 2)}" y="${formatSvgNumber(center.y - this.dto.geometry.heightMm / 2)}" width="${formatSvgNumber(this.dto.geometry.widthMm)}" height="${formatSvgNumber(this.dto.geometry.heightMm)}" rx="${formatSvgNumber(radiusMm)}" fill="${this.dto.style.fillColor}" stroke="${this.dto.style.borderColor}" stroke-width="${formatSvgNumber(this.dto.style.borderWidthMm)}"${transform} />`;
  }
}
