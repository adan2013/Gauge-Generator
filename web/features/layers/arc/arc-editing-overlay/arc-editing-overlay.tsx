"use client";

import { useTranslations } from "next-intl";
import {
  formatOverlayValue,
  RangeMappedLayerEditingOverlay,
  type RangeMappedLayerEditingOverlayBaseProps,
} from "@/features/layers/core/range-mapped-layer-editing-overlay/range-mapped-layer-editing-overlay";
import { ArcLayer } from "@/features/layers/arc/arc";
import type { ArcLayerDto } from "@/features/project/project-dto/project-dto";

type ArcEditingOverlayProps = RangeMappedLayerEditingOverlayBaseProps<ArcLayerDto>;

export function ArcEditingOverlay({
  canvas,
  displayScale,
  layer,
  onInteractionEnd,
  onInteractionStart,
  onLayerChange,
  project,
  snapping,
}: ArcEditingOverlayProps) {
  const t = useTranslations("Editor.arc");

  return (
    <RangeMappedLayerEditingOverlay
      ariaLabel={t("overlayAriaLabel")}
      canvas={canvas}
      displayScale={displayScale}
      getHandleLabel={() => t("handles.radiusOffset")}
      getValueLabel={() =>
        t("handleValues.radiusOffset", { value: formatOverlayValue(layer.radiusOffsetMm) })
      }
      model={new ArcLayer(layer)}
      onInteractionEnd={onInteractionEnd}
      onInteractionStart={onInteractionStart}
      onLayerChange={onLayerChange}
      project={project}
      snapping={snapping}
      testId="arc-editing-overlay"
    />
  );
}
