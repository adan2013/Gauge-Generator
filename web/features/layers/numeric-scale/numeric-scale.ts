import type {
  EditingOverlayContext,
  LayerHandle,
  PointerInput,
  RenderContext,
  ValidationIssue,
} from "@/features/layers/core/layer";
import { Layer } from "@/features/layers/core/layer";
import { getRangeMappedLayerValidationIssues } from "@/features/layers/core/range-layer-validation";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import {
  getScaleValues,
  valueToNormalizedPosition,
} from "@/features/ranges/scale-mapping/scale-mapping";
import type { NumericScaleLayerDto } from "@/features/project/project-dto/project-dto";
import { clamp, normalizeAngle, snapDistanceMm } from "@/lib/geometry/geometry";
import { getNumericScaleGeometryBounds } from "./numeric-scale-constraints";
import { getNumericScaleNumericPropertyDefinitions } from "./numeric-scale-properties";

export class NumericScaleLayer extends Layer<NumericScaleLayerDto> {
  constructor(dto: NumericScaleLayerDto) {
    super(dto);
  }

  getNumericPropertyDefinitions(context: RenderContext) {
    return getNumericScaleNumericPropertyDefinitions(
      this.dto,
      context.rangeById.get(this.dto.rangeId),
    );
  }

  validate(context: RenderContext): ValidationIssue[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [{ path: "rangeId", code: PROJECT_VALIDATION_CODES.missingRangeReference }];
    const issues = getRangeMappedLayerValidationIssues(this.dto, range);
    const radius = range.radius + this.dto.radiusOffsetMm;
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
    const radius = range.radius + this.dto.radiusOffsetMm;
    if (radius <= 0) return "";
    const weight = this.dto.bold ? ' font-weight="700"' : "";
    const style = `${this.dto.italic ? ' font-style="italic"' : ""}${this.dto.underline ? ' text-decoration="underline"' : ""}`;
    return getScaleValues(this.dto, range)
      .map((value) => {
        const angle =
          range.angleStart + range.openingAngle * valueToNormalizedPosition(range, value);
        const radians = (normalizeAngle(angle) * Math.PI) / 180;
        const x = range.centerX + Math.cos(radians) * radius;
        const y = range.centerY + Math.sin(radians) * radius;
        const transform = this.dto.rotated
          ? ` transform=\"rotate(${format(angle + 90)} ${format(x)} ${format(y)})\"`
          : "";
        return `<text x=\"${format(x)}\" y=\"${format(y)}\" fill=\"${this.dto.color}\" font-family=\"${this.dto.fontFamily}\" font-size=\"${format(this.dto.fontSizeMm)}\" text-anchor=\"middle\" dominant-baseline=\"middle\"${weight}${style}${transform}>${formatValue(value * this.dto.scaleMultiplier, this.dto.decimalPlaces)}</text>`;
      })
      .join("");
  }

  toEditingOverlay(): string {
    return "";
  }

  getHandles(context: EditingOverlayContext): LayerHandle[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [];
    const radius = range.radius + this.dto.radiusOffsetMm;
    return radius > 0
      ? [
          {
            id: "radius-offset",
            kind: "radius",
            label: "radius-offset",
            point: { x: range.centerX + radius, y: range.centerY },
          },
        ]
      : [];
  }

  applyHandleDrag(
    handleId: string,
    pointer: PointerInput,
    context: EditingOverlayContext,
  ): NumericScaleLayerDto {
    if (handleId !== "radius-offset") return this.dto;
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return this.dto;
    const radius = snapDistanceMm(
      Math.hypot(pointer.point.x - range.centerX, pointer.point.y - range.centerY),
      pointer.snapDistanceMm ?? 1,
    );
    const bounds = getNumericScaleGeometryBounds(this.dto, range);
    return {
      ...this.dto,
      radiusOffsetMm: clamp(
        radius - range.radius,
        bounds.minRadiusOffsetMm,
        bounds.maxRadiusOffsetMm,
      ),
    };
  }
}

function format(value: number): string {
  return Number(value.toFixed(3)).toString();
}
function formatValue(value: number, decimalPlaces: number): string {
  return value.toFixed(decimalPlaces);
}
