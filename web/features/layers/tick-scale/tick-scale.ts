import {
  type CanvasPointMm,
  type EditingOverlayContext,
  Layer,
  type LayerHandle,
  type PointerInput,
  type RenderContext,
  type ValidationIssue,
} from "@/features/layers/core/layer";
import { getRangeMappedLayerValidationIssues } from "@/features/layers/core/range-layer-validation";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import {
  getScaleValues,
  valueToNormalizedPosition,
} from "@/features/ranges/scale-mapping/scale-mapping";
import type { TickScaleLayerDto } from "@/features/project/project-dto/project-dto";
import { clamp, normalizeAngle, snapDistanceMm } from "@/lib/geometry/geometry";
import { getTickScaleGeometryBounds } from "./tick-scale-constraints";
import { getTickScaleNumericPropertyDefinitions } from "./tick-scale-properties";

export class TickScaleLayer extends Layer<TickScaleLayerDto> {
  constructor(dto: TickScaleLayerDto) {
    super(dto);
  }

  getNumericPropertyDefinitions(context: RenderContext) {
    return getTickScaleNumericPropertyDefinitions(
      this.dto,
      context.rangeById.get(this.dto.rangeId),
    );
  }

  validate(context: RenderContext): ValidationIssue[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [{ path: "rangeId", code: PROJECT_VALIDATION_CODES.missingRangeReference }];
    const issues = getRangeMappedLayerValidationIssues(this.dto, range);
    const effectiveRadiusMm = range.radius + this.dto.radiusOffsetMm;
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
    const radius = range.radius + this.dto.radiusOffsetMm;
    if (radius <= 0) return "";
    return getScaleValues(this.dto, range)
      .map((value) => {
        const angle =
          range.angleStart + range.openingAngle * valueToNormalizedPosition(range, value);
        const outer = pointOnRoundedSquare(
          range.centerX,
          range.centerY,
          radius,
          angle,
          this.dto.cornerRadiusPercent,
        );
        const inner = {
          x: outer.point.x - outer.normal.x * this.dto.tickLengthMm,
          y: outer.point.y - outer.normal.y * this.dto.tickLengthMm,
        };
        return `<line x1="${formatNumber(inner.x)}" y1="${formatNumber(inner.y)}" x2="${formatNumber(outer.point.x)}" y2="${formatNumber(outer.point.y)}" stroke="${this.dto.color}" stroke-width="${formatNumber(this.dto.tickWidthMm)}" stroke-linecap="round" />`;
      })
      .join("");
  }

  toEditingOverlay(context: EditingOverlayContext): string {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return "";
    const radius = range.radius + this.dto.radiusOffsetMm;
    if (radius <= 0) return "";
    const pointCount = Math.max(2, Math.ceil(Math.abs(range.openingAngle) / 8));
    const commands = Array.from({ length: pointCount }, (_, index) => {
      const angle = range.angleStart + (range.openingAngle * index) / (pointCount - 1);
      const point = pointOnRoundedSquare(
        range.centerX,
        range.centerY,
        radius,
        angle,
        this.dto.cornerRadiusPercent,
      ).point;
      return `${index === 0 ? "M" : "L"} ${formatNumber(point.x)} ${formatNumber(point.y)}`;
    }).join(" ");
    return `<path d="${commands}" fill="none" stroke="#C62828" stroke-width="0.4" stroke-dasharray="1.5 1.5" />`;
  }

  getHandles(context: EditingOverlayContext): LayerHandle[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [];
    const radius = range.radius + this.dto.radiusOffsetMm;
    if (radius <= 0) return [];
    return [
      {
        id: "radius-offset",
        kind: "radius",
        label: "radius-offset",
        point: pointOnRoundedSquare(
          range.centerX,
          range.centerY,
          radius,
          range.angleStart + range.openingAngle / 2,
          this.dto.cornerRadiusPercent,
        ).point,
      },
    ];
  }

  applyHandleDrag(
    handleId: string,
    pointer: PointerInput,
    context: EditingOverlayContext,
  ): TickScaleLayerDto {
    if (handleId !== "radius-offset") return this.dto;
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return this.dto;
    const distance = Math.hypot(pointer.point.x - range.centerX, pointer.point.y - range.centerY);
    const increment = pointer.snapDistanceMm ?? 1;
    const radius = Math.max(0.2, snapDistanceMm(distance, increment));
    return {
      ...this.dto,
      radiusOffsetMm: clamp(
        radius - range.radius,
        getTickScaleGeometryBounds(this.dto, range).minRadiusOffsetMm,
        getTickScaleGeometryBounds(this.dto, range).maxRadiusOffsetMm,
      ),
    };
  }
}

function pointOnRoundedSquare(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
  cornerRadiusPercent: number,
): { normal: CanvasPointMm; point: CanvasPointMm } {
  const radians = (normalizeAngle(angle) * Math.PI) / 180;
  const direction = { x: Math.cos(radians), y: Math.sin(radians) };
  const cornerRadius = radius * (cornerRadiusPercent / 50);
  const straightEdge = radius - cornerRadius;
  const absoluteX = Math.abs(direction.x);
  const absoluteY = Math.abs(direction.y);

  if (absoluteX === 0 || absoluteY / absoluteX <= straightEdge / radius) {
    const distance = radius / Math.max(absoluteX, Number.EPSILON);
    return {
      point: { x: centerX + direction.x * distance, y: centerY + direction.y * distance },
      normal: { x: Math.sign(direction.x), y: 0 },
    };
  }
  if (absoluteX / absoluteY <= straightEdge / radius) {
    const distance = radius / Math.max(absoluteY, Number.EPSILON);
    return {
      point: { x: centerX + direction.x * distance, y: centerY + direction.y * distance },
      normal: { x: 0, y: Math.sign(direction.y) },
    };
  }

  const cornerCenter = {
    x: Math.sign(direction.x) * straightEdge,
    y: Math.sign(direction.y) * straightEdge,
  };
  const projection = cornerCenter.x * direction.x + cornerCenter.y * direction.y;
  const discriminant = projection ** 2 - (straightEdge ** 2 * 2 - cornerRadius ** 2);
  const distance = projection + Math.sqrt(Math.max(0, discriminant));
  const point = { x: centerX + direction.x * distance, y: centerY + direction.y * distance };
  const normal = {
    x: (point.x - centerX - cornerCenter.x) / cornerRadius,
    y: (point.y - centerY - cornerCenter.y) / cornerRadius,
  };
  return { point, normal };
}

function formatNumber(value: number): string {
  return Number(value.toFixed(3)).toString();
}
