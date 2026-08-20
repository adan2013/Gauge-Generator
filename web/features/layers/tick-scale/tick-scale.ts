import { type RenderContext, type ValidationIssue } from "@/features/layers/core/layer";
import { getRangeMappedLayerValidationIssues } from "@/features/layers/core/range-layer-validation";
import { getEffectiveRadiusMm } from "@/features/layers/core/range-mapped-layer-geometry";
import { RangeMappedLayer } from "@/features/layers/core/range-mapped-layer";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import { pointOnRoundedSquare } from "@/features/ranges/path-geometry/rounded-square-geometry";
import { getScaleDistribution } from "@/features/ranges/scale-mapping/scale-sequence";
import type { RangeDto, TickScaleLayerDto } from "@/features/project/project-dto/project-dto";
import { getTickScaleGeometryBounds } from "./tick-scale-constraints";

export class TickScaleLayer extends RangeMappedLayer<TickScaleLayerDto> {
  constructor(dto: TickScaleLayerDto) {
    super(dto);
  }

  validate(context: RenderContext): ValidationIssue[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [{ path: "rangeId", code: PROJECT_VALIDATION_CODES.missingRangeReference }];
    const issues = getRangeMappedLayerValidationIssues(this.dto, range);
    const effectiveRadiusMm = getEffectiveRadiusMm(this.dto, range);
    if (this.dto.tickLengthMm > effectiveRadiusMm)
      issues.push({
        path: "tickLengthMm",
        code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
      });
    if (this.dto.tickWidthMm > this.dto.tickLengthMm)
      issues.push({
        path: "tickWidthMm",
        code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
      });
    return issues;
  }

  toSvg(context: RenderContext): string {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range || !this.dto.visible) return "";
    const radius = getEffectiveRadiusMm(this.dto, range);
    if (radius <= 0) return "";
    return getScaleDistribution(this.dto, range)
      .map(({ angle }) => {
        const outer = pointOnRoundedSquare(
          range.centerX,
          range.centerY,
          radius,
          angle,
          range.cornerRadiusPercent,
        );
        const inner = {
          x: outer.point.x - outer.normal.x * this.dto.tickLengthMm,
          y: outer.point.y - outer.normal.y * this.dto.tickLengthMm,
        };
        return `<line x1="${formatNumber(inner.x)}" y1="${formatNumber(inner.y)}" x2="${formatNumber(outer.point.x)}" y2="${formatNumber(outer.point.y)}" stroke="${this.dto.color}" stroke-width="${formatNumber(this.dto.tickWidthMm)}" stroke-linecap="round" />`;
      })
      .join("");
  }

  protected getRadiusOffsetBounds(range: RangeDto) {
    return getTickScaleGeometryBounds(this.dto, range);
  }
}

function formatNumber(value: number): string {
  return Number(value.toFixed(3)).toString();
}
