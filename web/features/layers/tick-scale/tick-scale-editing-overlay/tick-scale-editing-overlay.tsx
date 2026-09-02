"use client";

import { useTranslations } from "next-intl";
import {
  formatOverlayValue,
  RangeMappedLayerEditingOverlay,
  type RangeMappedLayerEditingOverlayBaseProps,
} from "@/features/layers/core/range-mapped-layer-editing-overlay/range-mapped-layer-editing-overlay";
import { TickScaleLayer } from "@/features/layers/tick-scale/tick-scale";
import type { TickScaleLayerDto } from "@/features/project/project-dto/project-dto";

type TickScaleEditingOverlayProps = RangeMappedLayerEditingOverlayBaseProps<TickScaleLayerDto>;

export function TickScaleEditingOverlay({
  canvas,
  displayScale,
  layer,
  onInteractionEnd,
  onInteractionStart,
  onLayerChange,
  project,
  snapping,
}: TickScaleEditingOverlayProps) {
  const t = useTranslations("Editor.tickScale");

  return (
    <RangeMappedLayerEditingOverlay
      ariaLabel={t("overlayAriaLabel")}
      canvas={canvas}
      displayScale={displayScale}
      getHandleLabel={() => t("handles.radiusOffset")}
      getValueLabel={() =>
        t("handleValues.radiusOffset", { value: formatOverlayValue(layer.radiusOffsetMm) })
      }
      model={new TickScaleLayer(layer)}
      onInteractionEnd={onInteractionEnd}
      onInteractionStart={onInteractionStart}
      onLayerChange={onLayerChange}
      project={project}
      snapping={snapping}
      testId="tick-scale-editing-overlay"
    />
  );
}
