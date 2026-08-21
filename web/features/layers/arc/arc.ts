import type { RenderContext, ValidationIssue } from "@/features/layers/core/layer";
import {
  getEffectiveRadiusMm,
  getRangeMappedLayerPathGeometry,
} from "@/features/layers/core/range-mapped-layer-geometry";
import { RangeMappedLayer } from "@/features/layers/core/range-mapped-layer";
import { getRangeMappedIntervalValidationIssues } from "@/features/layers/core/range-layer-validation";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type { ArcLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { roundedSquarePathData } from "@/features/ranges/path-geometry/rounded-square-geometry";
import { formatSvgNumber } from "@/features/layers/core/text-style/text-style-svg";
import { getArcGeometryBounds } from "./arc-constraints";
import { getArcStrokeWidthMaximum } from "./arc-limits";

export class ArcLayer extends RangeMappedLayer<ArcLayerDto> {
  constructor(dto: ArcLayerDto) {
    super(dto);
  }

  validate(context: RenderContext): ValidationIssue[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [{ path: "rangeId", code: PROJECT_VALIDATION_CODES.missingRangeReference }];
    const issues = getRangeMappedIntervalValidationIssues(this.dto, range, true);
    if (this.dto.strokeWidthMm > getArcStrokeWidthMaximum(getEffectiveRadiusMm(this.dto, range)))
      issues.push({
        path: "strokeWidthMm",
        code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
      });
    return issues;
  }

  toSvg(context: RenderContext): string {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range || !this.dto.visible) return "";
    const geometry = getRangeMappedLayerPathGeometry(this.dto, range);
    if (geometry.radius <= 0 || geometry.openingAngle === 0) return "";
    const path = roundedSquarePathData({
      angleStart: geometry.angleStart,
      centerX: range.centerX,
      centerY: range.centerY,
      cornerRadiusPercent: range.cornerRadiusPercent,
      openingAngle: geometry.openingAngle,
      radius: geometry.radius,
    });
    return `<path d="${path}" fill="none" stroke="${this.dto.color}" stroke-width="${formatSvgNumber(this.dto.strokeWidthMm)}" stroke-linecap="${this.dto.roundedEnds ? "round" : "butt"}" stroke-linejoin="round" />`;
  }

  protected getRadiusOffsetBounds(range: RangeDto) {
    return getArcGeometryBounds(this.dto, range);
  }
}
