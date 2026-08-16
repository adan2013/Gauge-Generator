"use client";

import { useTranslations } from "next-intl";
import { LayerHandles } from "@/features/layers/core/layer-handles/layer-handles";
import { TickScaleLayer } from "@/features/layers/tick-scale/tick-scale";
import type {
  CanvasDto,
  ProjectDto,
  TickScaleLayerDto,
} from "@/features/project/project-dto/project-dto";

type TickScaleEditingOverlayProps = {
  canvas: CanvasDto;
  layer: TickScaleLayerDto;
  project: ProjectDto;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  onLayerChange: (nextLayer: TickScaleLayerDto) => void;
};

export function TickScaleEditingOverlay({
  canvas,
  layer,
  onInteractionEnd,
  onInteractionStart,
  onLayerChange,
  project,
  snapping,
}: TickScaleEditingOverlayProps) {
  const t = useTranslations("Editor.tickScale");
  const model = new TickScaleLayer(layer);
  const context = {
    project,
    rangeById: new Map(project.ranges.map((range) => [range.id, range])),
    zoom: 1,
  };
  const handles = model.getHandles(context);

  return (
    <g aria-label={t("overlayAriaLabel")} data-testid="tick-scale-editing-overlay">
      <g dangerouslySetInnerHTML={{ __html: model.toEditingOverlay(context) }} />
      <LayerHandles
        canvas={canvas}
        getLabel={() =>
          t("handleValues.radiusOffset", { value: formatValue(layer.radiusOffsetMm) })
        }
        handles={handles.map((handle) => ({ ...handle, label: t("handles.radiusOffset") }))}
        onHandleChange={(handleId, input) =>
          onLayerChange(
            model.applyHandleDrag(
              handleId,
              {
                ...input,
                snapDistanceMm: snapping.enabled ? snapping.distanceMm : 1,
              },
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
