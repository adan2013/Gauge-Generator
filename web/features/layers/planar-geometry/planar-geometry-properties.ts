import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import { getCanvasOffsetBounds } from "@/features/layers/core/canvas-offset-bounds";
import type {
  CanvasDto,
  PlanarGeometryLayerDto,
  RangeDto,
} from "@/features/project/project-dto/project-dto";
import { getPlanarGeometryCanvasBounds } from "./planar-geometry-constraints";
import { PLANAR_GEOMETRY_LIMITS } from "./planar-geometry-limits";

export type PlanarGeometryNumericPropertyDefinition = NumericPropertyDefinition<
  "offsetXMm" | "offsetYMm" | "widthMm" | "heightMm" | "rotationDegrees"
> & {
  group: "position" | "size";
  labelKey: "offsetX" | "offsetY" | "width" | "height" | "rotation";
  unit: "degrees" | "millimeters";
};

export function getPlanarGeometryNumericPropertyDefinitions(
  layer: PlanarGeometryLayerDto,
  canvas?: CanvasDto,
  range?: RangeDto,
): readonly PlanarGeometryNumericPropertyDefinition[] {
  const offsetBounds =
    canvas && range
      ? getCanvasOffsetBounds(canvas, range)
      : { offsetX: PLANAR_GEOMETRY_LIMITS.offsetMm, offsetY: PLANAR_GEOMETRY_LIMITS.offsetMm };
  const canvasBounds = canvas
    ? getPlanarGeometryCanvasBounds(canvas)
    : {
        widthMm: { max: PLANAR_GEOMETRY_LIMITS.dimensionMm.max },
        heightMm: { max: PLANAR_GEOMETRY_LIMITS.dimensionMm.max },
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
      min: PLANAR_GEOMETRY_LIMITS.dimensionMm.min,
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
      min: PLANAR_GEOMETRY_LIMITS.dimensionMm.min,
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
      min: PLANAR_GEOMETRY_LIMITS.rotationDegrees.min,
      max: PLANAR_GEOMETRY_LIMITS.rotationDegrees.max,
      snap: "angle",
      step: 1,
      unit: "degrees",
      value: layer.geometry.rotationDegrees,
    },
  ];
}
