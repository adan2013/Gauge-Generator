import type { RenderContext, ValidationIssue } from "@/features/layers/core/layer";
import { getRangeMappedLayerValidationIssues } from "@/features/layers/core/range-layer-validation";
import { getEffectiveRadiusMm } from "@/features/layers/core/range-mapped-layer-geometry";
import { NormalOffsetRangeMappedLayer } from "@/features/layers/core/normal-offset-range-mapped-layer";
import { pointOnRoundedSquareNormalOffset } from "@/features/ranges/path-geometry/rounded-square-geometry";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import { getScaleDistribution } from "@/features/ranges/scale-mapping/scale-sequence";
import type { NumericScaleLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { getNumericScaleGeometryBounds } from "./numeric-scale-constraints";
import {
  formatSvgNumber,
  getTextStyleSvgAttributes,
} from "@/features/layers/core/text-style/text-style-svg";

export class NumericScaleLayer extends NormalOffsetRangeMappedLayer<NumericScaleLayerDto> {
  constructor(dto: NumericScaleLayerDto) {
    super(dto);
  }

  validate(context: RenderContext): ValidationIssue[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [{ path: "rangeId", code: PROJECT_VALIDATION_CODES.missingRangeReference }];
    const issues = getRangeMappedLayerValidationIssues(this.dto, range);
    const radius = getEffectiveRadiusMm(this.dto, range);
    if (this.dto.textStyle.sizeMm > radius)
      issues.push({
        path: "textStyle.sizeMm",
        code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
      });
    return issues;
  }

  toSvg(context: RenderContext): string {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range || !this.dto.visible) return "";
    const radius = getEffectiveRadiusMm(this.dto, range);
    if (radius <= 0) return "";
    const textStyle = getTextStyleSvgAttributes(this.dto.textStyle);
    return getScaleDistribution(this.dto, range)
      .map(({ angle, value }) => {
        const placement = pointOnRoundedSquareNormalOffset(
          range.centerX,
          range.centerY,
          range.radius,
          angle,
          range.cornerRadiusPercent,
          this.dto.radiusOffsetMm,
        );
        const { x, y } = placement.point;
        const transform = this.dto.rotated
          ? ` transform=\"rotate(${formatSvgNumber(normalAngle(placement.normal) + 90)} ${formatSvgNumber(x)} ${formatSvgNumber(y)})\"`
          : "";
        return `<text x=\"${formatSvgNumber(x)}\" y=\"${formatSvgNumber(y)}\" ${textStyle} text-anchor=\"middle\" dominant-baseline=\"middle\"${transform}>${formatValue(value * this.dto.scaleMultiplier, this.dto.decimalPlaces)}</text>`;
      })
      .join("");
  }

  protected getRadiusOffsetBounds(range: RangeDto) {
    return getNumericScaleGeometryBounds(this.dto, range);
  }
}

function normalAngle(normal: { x: number; y: number }): number {
  return (Math.atan2(normal.y, normal.x) * 180) / Math.PI;
}
function formatValue(value: number, decimalPlaces: number): string {
  return value.toFixed(decimalPlaces);
}
