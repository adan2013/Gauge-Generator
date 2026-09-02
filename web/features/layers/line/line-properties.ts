import { getCanvasOffsetBounds } from "@/features/layers/core/canvas-offset-bounds";
import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import type { CanvasDto, LineLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { getLineCanvasBounds } from "./line-constraints";
import { LINE_LIMITS } from "./line-limits";

export type LineNumericPropertyDefinition = NumericPropertyDefinition<
  "offsetXMm" | "offsetYMm" | "lengthMm" | "rotationDegrees" | "strokeWidthMm"
> & {
  group: "position" | "geometry" | "appearance";
  labelKey: "offsetX" | "offsetY" | "length" | "rotation" | "strokeWidth";
  unit: "degrees" | "millimeters";
};

export function getLineNumericPropertyDefinitions(
  layer: LineLayerDto,
  canvas?: CanvasDto,
  range?: RangeDto,
): readonly LineNumericPropertyDefinition[] {
  const offsetBounds =
    canvas && range
      ? getCanvasOffsetBounds(canvas, range)
      : { offsetX: LINE_LIMITS.offsetMm, offsetY: LINE_LIMITS.offsetMm };
  const canvasBounds = canvas
    ? getLineCanvasBounds(canvas)
    : {
        lengthMm: { max: LINE_LIMITS.lengthMm.max },
        strokeWidthMm: { max: LINE_LIMITS.strokeWidthMm.max },
      };
  return [
    {
      key: "offsetXMm",
      group: "position",
      labelKey: "offsetX",
      min: offsetBounds.offsetX.min,
      max: offsetBounds.offsetX.max,
      snap: "distance",
      step: LINE_LIMITS.offsetMm.step,
      unit: "millimeters",
      value: layer.geometry.offsetXMm,
    },
    {
      key: "offsetYMm",
      group: "position",
      labelKey: "offsetY",
      min: offsetBounds.offsetY.min,
      max: offsetBounds.offsetY.max,
      snap: "distance",
      step: LINE_LIMITS.offsetMm.step,
      unit: "millimeters",
      value: layer.geometry.offsetYMm,
    },
    {
      key: "lengthMm",
      group: "geometry",
      labelKey: "length",
      min: LINE_LIMITS.lengthMm.min,
      max: canvasBounds.lengthMm.max,
      snap: "distance",
      step: 0.1,
      unit: "millimeters",
      value: layer.geometry.lengthMm,
    },
    {
      integerOnly: true,
      key: "rotationDegrees",
      group: "geometry",
      labelKey: "rotation",
      min: LINE_LIMITS.rotationDegrees.min,
      max: LINE_LIMITS.rotationDegrees.max,
      snap: "angle",
      step: 1,
      unit: "degrees",
      value: layer.geometry.rotationDegrees,
    },
    {
      key: "strokeWidthMm",
      group: "appearance",
      labelKey: "strokeWidth",
      min: LINE_LIMITS.strokeWidthMm.min,
      max: canvasBounds.strokeWidthMm.max,
      snap: "none",
      step: 0.1,
      unit: "millimeters",
      value: layer.style.strokeWidthMm,
    },
  ];
}
