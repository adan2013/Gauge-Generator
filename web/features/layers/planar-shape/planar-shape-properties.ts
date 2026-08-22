import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import { getCanvasOffsetBounds } from "@/features/layers/core/canvas-offset-bounds";
import type {
  CanvasDto,
  PlanarShapeLayerDto,
  RangeDto,
  RectangleLayerDto,
} from "@/features/project/project-dto/project-dto";
import { getPlanarShapeCanvasBounds } from "./planar-shape-constraints";
import { PLANAR_SHAPE_LIMITS } from "./planar-shape-limits";

export type PlanarShapeNumericPropertyDefinition = NumericPropertyDefinition<
  | "offsetXMm"
  | "offsetYMm"
  | "widthMm"
  | "heightMm"
  | "rotationDegrees"
  | "borderWidthMm"
  | "cornerRadiusPercent"
> & {
  group: "position" | "size" | "appearance";
  labelKey:
    "offsetX" | "offsetY" | "width" | "height" | "rotation" | "borderWidth" | "cornerRadius";
  unit: "degrees" | "millimeters" | "percent";
};

export function getPlanarShapeNumericPropertyDefinitions(
  layer: PlanarShapeLayerDto,
  canvas?: CanvasDto,
  range?: RangeDto,
): readonly PlanarShapeNumericPropertyDefinition[] {
  const offsetBounds =
    canvas && range
      ? getCanvasOffsetBounds(canvas, range)
      : { offsetX: PLANAR_SHAPE_LIMITS.offsetMm, offsetY: PLANAR_SHAPE_LIMITS.offsetMm };
  const canvasBounds = canvas
    ? getPlanarShapeCanvasBounds(canvas)
    : {
        widthMm: { max: PLANAR_SHAPE_LIMITS.dimensionMm.max },
        heightMm: { max: PLANAR_SHAPE_LIMITS.dimensionMm.max },
        borderWidthMm: { max: PLANAR_SHAPE_LIMITS.borderWidthMm.max },
      };
  return [
    {
      key: "offsetXMm",
      group: "position",
      labelKey: "offsetX",
      min: offsetBounds.offsetX.min,
      max: offsetBounds.offsetX.max,
      snap: "distance",
      step: 0.1,
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
      step: 0.1,
      unit: "millimeters",
      value: layer.geometry.offsetYMm,
    },
    {
      key: "widthMm",
      group: "size",
      labelKey: "width",
      min: PLANAR_SHAPE_LIMITS.dimensionMm.min,
      max: canvasBounds.widthMm.max,
      snap: "distance",
      step: 0.1,
      unit: "millimeters",
      value: layer.geometry.widthMm,
    },
    {
      key: "heightMm",
      group: "size",
      labelKey: "height",
      min: PLANAR_SHAPE_LIMITS.dimensionMm.min,
      max: canvasBounds.heightMm.max,
      snap: "distance",
      step: 0.1,
      unit: "millimeters",
      value: layer.geometry.heightMm,
    },
    {
      integerOnly: true,
      key: "rotationDegrees",
      group: "position",
      labelKey: "rotation",
      min: PLANAR_SHAPE_LIMITS.rotationDegrees.min,
      max: PLANAR_SHAPE_LIMITS.rotationDegrees.max,
      snap: "angle",
      step: 1,
      unit: "degrees",
      value: layer.geometry.rotationDegrees,
    },
    {
      key: "borderWidthMm",
      group: "appearance",
      labelKey: "borderWidth",
      min: PLANAR_SHAPE_LIMITS.borderWidthMm.min,
      max: canvasBounds.borderWidthMm.max,
      snap: "none",
      step: 0.1,
      unit: "millimeters",
      value: layer.style.borderWidthMm,
    },
  ];
}

export function getRectangleNumericPropertyDefinitions(
  layer: RectangleLayerDto,
  canvas?: CanvasDto,
  range?: RangeDto,
): readonly PlanarShapeNumericPropertyDefinition[] {
  return [
    ...getPlanarShapeNumericPropertyDefinitions(layer, canvas, range),
    {
      key: "cornerRadiusPercent",
      group: "appearance",
      labelKey: "cornerRadius",
      min: PLANAR_SHAPE_LIMITS.cornerRadiusPercent.min,
      max: PLANAR_SHAPE_LIMITS.cornerRadiusPercent.max,
      snap: "none",
      step: 0.1,
      unit: "percent",
      value: layer.cornerRadiusPercent,
    },
  ];
}
