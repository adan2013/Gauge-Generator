import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import type { NeedleLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { getRangeScaleValueBounds } from "@/features/ranges/scale-mapping/scale-mapping";
import { getNeedleGeometryBounds } from "./needle-constraints";
import { NEEDLE_LIMITS } from "./needle-limits";

export type NeedleNumericPropertyDefinition = NumericPropertyDefinition<
  "value" | "lengthMm" | "tailLengthMm" | "widthMm" | "hubRadiusMm"
> & {
  group: "value" | "shaft" | "hub";
  labelKey: "value" | "length" | "tailLength" | "width" | "hubRadius";
  unit: "millimeters" | "none";
};

export function getNeedleNumericPropertyDefinitions(
  layer: NeedleLayerDto,
  range: RangeDto | undefined,
): readonly NeedleNumericPropertyDefinition[] {
  const valueBounds = range
    ? getRangeScaleValueBounds(range)
    : { min: -1_000_000_000, max: 1_000_000_000 };
  const geometry = range ? getNeedleGeometryBounds(layer, range) : undefined;
  return [
    {
      integerOnly: true,
      key: "value",
      group: "value",
      labelKey: "value",
      max: valueBounds.max,
      min: valueBounds.min,
      snap: "none",
      step: 1,
      unit: "none",
      value: layer.value,
    },
    {
      key: "lengthMm",
      group: "shaft",
      labelKey: "length",
      max: geometry?.maxLengthMm ?? NEEDLE_LIMITS.lengthMm.max,
      min: NEEDLE_LIMITS.lengthMm.min,
      snap: "distance",
      step: 0.1,
      unit: "millimeters",
      value: layer.shaft.lengthMm,
    },
    {
      key: "tailLengthMm",
      group: "shaft",
      labelKey: "tailLength",
      max: geometry?.maxTailLengthMm ?? NEEDLE_LIMITS.tailLengthMm.max,
      min: NEEDLE_LIMITS.tailLengthMm.min,
      snap: "distance",
      step: 0.1,
      unit: "millimeters",
      value: layer.shaft.tailLengthMm,
    },
    {
      key: "widthMm",
      group: "shaft",
      labelKey: "width",
      max: geometry?.maxWidthMm ?? NEEDLE_LIMITS.widthMm.max,
      min: NEEDLE_LIMITS.widthMm.min,
      snap: "none",
      step: 0.1,
      unit: "millimeters",
      value: layer.shaft.widthMm,
    },
    {
      key: "hubRadiusMm",
      group: "hub",
      labelKey: "hubRadius",
      max: geometry?.maxHubRadiusMm ?? NEEDLE_LIMITS.hubRadiusMm.max,
      min: NEEDLE_LIMITS.hubRadiusMm.min,
      snap: "distance",
      step: 0.1,
      unit: "millimeters",
      value: layer.hub.radiusMm,
    },
  ];
}
