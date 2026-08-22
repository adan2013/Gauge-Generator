import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import { getPlanarGeometryNumericPropertyDefinitions } from "@/features/layers/planar-geometry/planar-geometry-properties";
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
  const canvasBounds = canvas
    ? getPlanarShapeCanvasBounds(canvas)
    : { borderWidthMm: { max: PLANAR_SHAPE_LIMITS.borderWidthMm.max } };
  return [
    ...getPlanarGeometryNumericPropertyDefinitions(layer, canvas, range),
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
