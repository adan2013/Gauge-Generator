import type { RenderContext, ValidationIssue } from "@/features/layers/core/layer";
import { getRangeMappedLayerValidationIssues } from "@/features/layers/core/range-layer-validation";
import { getEffectiveRadiusMm } from "@/features/layers/core/range-mapped-layer-geometry";
import { RangeMappedLayer } from "@/features/layers/core/range-mapped-layer";
import { pointOnRoundedSquare } from "@/features/ranges/path-geometry/rounded-square-geometry";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import { getScaleDistribution } from "@/features/ranges/scale-mapping/scale-sequence";
import type { NumericScaleLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { getNumericScaleGeometryBounds } from "./numeric-scale-constraints";

export class NumericScaleLayer extends RangeMappedLayer<NumericScaleLayerDto> {
  constructor(dto: NumericScaleLayerDto) {
    super(dto);
  }

  validate(context: RenderContext): ValidationIssue[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [{ path: "rangeId", code: PROJECT_VALIDATION_CODES.missingRangeReference }];
    const issues = getRangeMappedLayerValidationIssues(this.dto, range);
    const radius = getEffectiveRadiusMm(this.dto, range);
    if (this.dto.fontSizeMm > radius)
      issues.push({
        path: "fontSizeMm",
        code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
      });
    return issues;
  }

  toSvg(context: RenderContext): string {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range || !this.dto.visible) return "";
    const radius = getEffectiveRadiusMm(this.dto, range);
    if (radius <= 0) return "";
    const weight = this.dto.bold ? ' font-weight="700"' : "";
    const style = `${this.dto.italic ? ' font-style="italic"' : ""}${this.dto.underline ? ' text-decoration="underline"' : ""}`;
    return getScaleDistribution(this.dto, range)
      .map(({ angle, value }) => {
        const placement = pointOnRoundedSquare(
          range.centerX,
          range.centerY,
          radius,
          angle,
          range.cornerRadiusPercent,
        );
        const { x, y } = placement.point;
        const transform = this.dto.rotated
          ? ` transform=\"rotate(${format(normalAngle(placement.normal) + 90)} ${format(x)} ${format(y)})\"`
          : "";
        return `<text x=\"${format(x)}\" y=\"${format(y)}\" fill=\"${this.dto.color}\" font-family=\"${this.dto.fontFamily}\" font-size=\"${format(this.dto.fontSizeMm)}\" text-anchor=\"middle\" dominant-baseline=\"middle\"${weight}${style}${transform}>${formatValue(value * this.dto.scaleMultiplier, this.dto.decimalPlaces)}</text>`;
      })
      .join("");
  }

  protected getRadiusOffsetBounds(range: RangeDto) {
    return getNumericScaleGeometryBounds(this.dto, range);
  }
}

function format(value: number): string {
  return Number(value.toFixed(3)).toString();
}
function normalAngle(normal: { x: number; y: number }): number {
  return (Math.atan2(normal.y, normal.x) * 180) / Math.PI;
}
function formatValue(value: number, decimalPlaces: number): string {
  return value.toFixed(decimalPlaces);
}
