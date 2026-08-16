"use client";

import { useTranslations } from "next-intl";
import { LayerHandles } from "@/features/layers/core/layer-handles/layer-handles";
import { NumericScaleLayer } from "@/features/layers/numeric-scale/numeric-scale";
import type {
  CanvasDto,
  NumericScaleLayerDto,
  ProjectDto,
} from "@/features/project/project-dto/project-dto";

type NumericScaleEditingOverlayProps = {
  canvas: CanvasDto;
  layer: NumericScaleLayerDto;
  project: ProjectDto;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  onLayerChange: (nextLayer: NumericScaleLayerDto) => void;
};

export function NumericScaleEditingOverlay({
  canvas,
  layer,
  onInteractionEnd,
  onInteractionStart,
  onLayerChange,
  project,
  snapping,
}: NumericScaleEditingOverlayProps) {
  const t = useTranslations("Editor.numericScale");
  const model = new NumericScaleLayer(layer);
  const context = {
    project,
    rangeById: new Map(project.ranges.map((range) => [range.id, range])),
    zoom: 1,
  };

  return (
    <g aria-label={t("overlayAriaLabel")} data-testid="numeric-scale-editing-overlay">
      <LayerHandles
        canvas={canvas}
        getLabel={() =>
          t("handleValues.radiusOffset", { value: formatValue(layer.radiusOffsetMm) })
        }
        handles={model
          .getHandles(context)
          .map((handle) => ({ ...handle, label: t("handles.radiusOffset") }))}
        onHandleChange={(handleId, input) =>
          onLayerChange(
            model.applyHandleDrag(
              handleId,
              { ...input, snapDistanceMm: snapping.enabled ? snapping.distanceMm : 1 },
              context,
            ),
          )
        }
        onInteractionEnd={onInteractionEnd}
        onInteractionStart={onInteractionStart}
      />
    </g>
  );
}

function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
