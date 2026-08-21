import type {
  EditingOverlayContext,
  LayerHandle,
  PointerInput,
  RenderContext,
  ValidationIssue,
} from "@/features/layers/core/layer";
import { OVERLAY_INTEGER_INCREMENT, Layer } from "@/features/layers/core/layer";
import type { EditingOverlayPrimitive } from "@/features/layers/core/editing-overlay-geometry";
import {
  applyRangeMappedLayerRadiusDrag,
  getEffectiveRadiusMm,
  getRangeMappedLayerPathGeometry,
} from "@/features/layers/core/range-mapped-layer-geometry";
import {
  escapeXml,
  formatSvgNumber,
  getTextStyleSvgAttributes,
} from "@/features/layers/core/text-style/text-style-svg";
import {
  getLabelLayoutValidationIssues,
  getLabelTextArcRadiusOffsetBounds,
} from "@/features/layers/label/label-constraints";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type { LabelLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { getRangeScaleEditingOverlay } from "@/features/ranges/path-geometry/range-scale-editing-overlay";
import {
  pointOnRoundedSquare,
  roundedSquarePathData,
} from "@/features/ranges/path-geometry/rounded-square-geometry";
import { clamp, normalizeAngle, snapAngleDegrees, snapDistanceMm } from "@/lib/geometry/geometry";

const ROTATION_HANDLE_DISTANCE_MIN_MM = 10;

export class LabelLayer extends Layer<LabelLayerDto> {
  constructor(dto: LabelLayerDto) {
    super(dto);
  }

  validate(context: RenderContext): ValidationIssue[] {
    const range = context.rangeById.get(this.dto.rangeId);
    return range
      ? getLabelLayoutValidationIssues(this.dto, range)
      : [{ path: "rangeId", code: PROJECT_VALIDATION_CODES.missingRangeReference }];
  }

  toSvg(context: RenderContext): string {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range || !this.dto.visible) return "";
    return this.dto.layout.mode === "point"
      ? renderPointLabel(this.dto, range)
      : renderTextArcLabel(this.dto, range);
  }

  getEditingOverlay(context: EditingOverlayContext): readonly EditingOverlayPrimitive[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [];
    if (this.dto.layout.mode === "text-arc")
      return getRangeScaleEditingOverlay({
        radius: getEffectiveRadiusMm(this.dto.layout, range),
        range,
        valueEnd: this.dto.layout.valueEnd,
        valueStart: this.dto.layout.valueStart,
      });
    const point = getPointLabelPoint(this.dto.layout, range);
    const rotationPoint = getRotationHandlePoint(
      this.dto.layout.rotationDegrees,
      this.dto.textStyle.sizeMm,
      point,
    );
    return [
      {
        dasharray: "1.5 1.5",
        end: point,
        id: "label-position-guide",
        kind: "line",
        start: { x: range.centerX, y: range.centerY },
        strokeWidth: 0.35,
        tone: "muted",
      },
      {
        dasharray: "1 1",
        end: rotationPoint,
        id: "label-rotation-guide",
        kind: "line",
        start: point,
        strokeWidth: 0.35,
        tone: "accent",
      },
    ];
  }

  getHandles(context: EditingOverlayContext): LayerHandle[] {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return [];
    if (this.dto.layout.mode === "text-arc") {
      const geometry = getTextArcGeometry(this.dto.layout, range);
      if (geometry.radius <= 0) return [];
      return [
        {
          id: "radius-offset",
          kind: "radius",
          label: "radius-offset",
          point: pointOnRoundedSquare(
            range.centerX,
            range.centerY,
            geometry.radius,
            geometry.angleStart + geometry.openingAngle / 2,
            range.cornerRadiusPercent,
          ).point,
        },
      ];
    }
    const point = getPointLabelPoint(this.dto.layout, range);
    return [
      { id: "position", kind: "move", label: "position", point },
      {
        id: "rotation",
        kind: "rotation",
        label: "rotation",
        point: getRotationHandlePoint(
          this.dto.layout.rotationDegrees,
          this.dto.textStyle.sizeMm,
          point,
        ),
      },
    ];
  }

  applyHandleDrag(
    handleId: string,
    pointer: PointerInput,
    context: EditingOverlayContext,
  ): LabelLayerDto {
    const range = context.rangeById.get(this.dto.rangeId);
    if (!range) return this.dto;
    if (this.dto.layout.mode === "text-arc") {
      const layout = applyRangeMappedLayerRadiusDrag(
        this.dto.layout,
        handleId,
        pointer,
        range,
        getLabelTextArcRadiusOffsetBounds(range),
      );
      return layout === this.dto.layout ? this.dto : { ...this.dto, layout };
    }
    if (handleId === "position") {
      const increment = pointer.snapDistanceMm ?? OVERLAY_INTEGER_INCREMENT;
      const offsetX = snapDistanceMm(pointer.point.x - range.centerX, increment);
      const offsetY = snapDistanceMm(pointer.point.y - range.centerY, increment);
      return {
        ...this.dto,
        layout: {
          ...this.dto.layout,
          offsetXMm: clamp(Math.round(offsetX), -range.radius, range.radius),
          offsetYMm: clamp(Math.round(offsetY), -range.radius, range.radius),
        },
      };
    }
    if (handleId === "rotation") {
      const point = getPointLabelPoint(this.dto.layout, range);
      const rawAngle =
        (Math.atan2(pointer.point.y - point.y, pointer.point.x - point.x) * 180) / Math.PI + 90;
      return {
        ...this.dto,
        layout: {
          ...this.dto.layout,
          rotationDegrees: normalizeAngle(
            Math.round(
              snapAngleDegrees(rawAngle, pointer.snapAngleDegrees ?? OVERLAY_INTEGER_INCREMENT),
            ),
          ),
        },
      };
    }
    return this.dto;
  }
}

export function getPointLabelPoint(
  layout: Extract<LabelLayerDto["layout"], { mode: "point" }>,
  range: RangeDto,
) {
  return {
    x: range.centerX + layout.offsetXMm,
    y: range.centerY + layout.offsetYMm,
  };
}

function renderPointLabel(layer: LabelLayerDto, range: RangeDto): string {
  if (layer.layout.mode !== "point") return "";
  const point = getPointLabelPoint(layer.layout, range);
  const transform = layer.layout.rotationDegrees
    ? ` transform="rotate(${layer.layout.rotationDegrees} ${formatSvgNumber(point.x)} ${formatSvgNumber(point.y)})"`
    : "";
  return `<text x="${formatSvgNumber(point.x)}" y="${formatSvgNumber(point.y)}" ${getTextStyleSvgAttributes(layer.textStyle)} text-anchor="middle" dominant-baseline="middle"${transform}>${escapeXml(layer.text)}</text>`;
}

function renderTextArcLabel(layer: LabelLayerDto, range: RangeDto): string {
  if (layer.layout.mode !== "text-arc") return "";
  const geometry = getTextArcGeometry(layer.layout, range);
  if (geometry.radius <= 0) return "";
  const pathId = `label-text-path-${layer.id}`;
  const path = roundedSquarePathData({
    angleStart: geometry.angleStart,
    centerX: range.centerX,
    centerY: range.centerY,
    cornerRadiusPercent: range.cornerRadiusPercent,
    openingAngle: geometry.openingAngle,
    radius: geometry.radius,
  });
  const alignment = {
    start: { anchor: "start", offset: "0%" },
    center: { anchor: "middle", offset: "50%" },
    end: { anchor: "end", offset: "100%" },
  }[layer.layout.alignment];
  return `<defs><path id="${pathId}" d="${path}" /></defs><text ${getTextStyleSvgAttributes(layer.textStyle)} dominant-baseline="middle"><textPath href="#${pathId}" startOffset="${alignment.offset}" text-anchor="${alignment.anchor}">${escapeXml(layer.text)}</textPath></text>`;
}

function getTextArcGeometry(
  layout: Extract<LabelLayerDto["layout"], { mode: "text-arc" }>,
  range: RangeDto,
) {
  const geometry = getRangeMappedLayerPathGeometry(layout, range);
  return {
    angleStart:
      layout.direction === "forward"
        ? geometry.angleStart
        : geometry.angleStart + geometry.openingAngle,
    openingAngle: layout.direction === "forward" ? geometry.openingAngle : -geometry.openingAngle,
    radius: geometry.radius,
  };
}

function getRotationHandlePoint(
  rotationDegrees: number,
  textSizeMm: number,
  point: { x: number; y: number },
) {
  const distance = Math.max(ROTATION_HANDLE_DISTANCE_MIN_MM, textSizeMm * 1.5);
  const radians = ((rotationDegrees - 90) * Math.PI) / 180;
  return {
    x: point.x + Math.cos(radians) * distance,
    y: point.y + Math.sin(radians) * distance,
  };
}
