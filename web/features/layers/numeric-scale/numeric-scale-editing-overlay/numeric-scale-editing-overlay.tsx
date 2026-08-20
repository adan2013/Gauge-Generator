"use client";

import { useTranslations } from "next-intl";
import {
  formatOverlayValue,
  RangeMappedLayerEditingOverlay,
  type RangeMappedLayerEditingOverlayBaseProps,
} from "@/features/layers/core/range-mapped-layer-editing-overlay/range-mapped-layer-editing-overlay";
import { NumericScaleLayer } from "@/features/layers/numeric-scale/numeric-scale";
import type { NumericScaleLayerDto } from "@/features/project/project-dto/project-dto";

type NumericScaleEditingOverlayProps =
  RangeMappedLayerEditingOverlayBaseProps<NumericScaleLayerDto>;

export function NumericScaleEditingOverlay({
  canvas,
  displayScale,
  layer,
  onInteractionEnd,
  onInteractionStart,
  onLayerChange,
  project,
  snapping,
}: NumericScaleEditingOverlayProps) {
  const t = useTranslations("Editor.numericScale");

  return (
    <RangeMappedLayerEditingOverlay
      ariaLabel={t("overlayAriaLabel")}
      canvas={canvas}
      displayScale={displayScale}
      getHandleLabel={() => t("handles.radiusOffset")}
      getValueLabel={() =>
        t("handleValues.radiusOffset", { value: formatOverlayValue(layer.radiusOffsetMm) })
      }
      model={new NumericScaleLayer(layer)}
      onInteractionEnd={onInteractionEnd}
      onInteractionStart={onInteractionStart}
      onLayerChange={onLayerChange}
      project={project}
      snapping={snapping}
      testId="numeric-scale-editing-overlay"
    />
  );
}
