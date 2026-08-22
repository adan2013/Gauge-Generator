import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import {
  getPlanarGeometryNumericPropertyDefinitions,
  type PlanarGeometryNumericPropertyDefinition,
} from "@/features/layers/planar-geometry/planar-geometry-properties";
import type { CanvasDto, IconLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { getIconCanvasBounds } from "./icon-constraints";
import { ICON_LIMITS } from "./icon-limits";

type IconStrokeWidthPropertyDefinition = NumericPropertyDefinition<"strokeWidthMm"> & {
  group: "appearance";
  labelKey: "strokeWidth";
  unit: "millimeters";
};

export type IconNumericPropertyDefinition =
  PlanarGeometryNumericPropertyDefinition | IconStrokeWidthPropertyDefinition;

export function getIconNumericPropertyDefinitions(
  layer: IconLayerDto,
  canvas?: CanvasDto,
  range?: RangeDto,
): readonly IconNumericPropertyDefinition[] {
  const canvasBounds = canvas
    ? getIconCanvasBounds(canvas)
    : { strokeWidthMm: { max: ICON_LIMITS.strokeWidthMm.max } };
  return [
    ...getPlanarGeometryNumericPropertyDefinitions(layer, canvas, range),
    {
      key: "strokeWidthMm",
      group: "appearance",
      labelKey: "strokeWidth",
      min: ICON_LIMITS.strokeWidthMm.min,
      max: canvasBounds.strokeWidthMm.max,
      snap: "none",
      step: 0.1,
      unit: "millimeters",
      value: layer.style.strokeWidthMm,
    },
  ];
}
