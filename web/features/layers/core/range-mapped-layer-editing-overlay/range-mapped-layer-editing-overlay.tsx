"use client";

import { EditingOverlayGeometry } from "@/features/layers/core/editing-overlay-geometry/editing-overlay-geometry";
import type { Layer, LayerHandle } from "@/features/layers/core/layer";
import { OVERLAY_INTEGER_INCREMENT } from "@/features/layers/core/layer";
import { LayerHandles } from "@/features/layers/core/layer-handles/layer-handles";
import type { CanvasDto, LayerDto, ProjectDto } from "@/features/project/project-dto/project-dto";

export type RangeMappedLayerEditingOverlayBaseProps<TLayer extends LayerDto> = {
  canvas: CanvasDto;
  displayScale: number;
  layer: TLayer;
  project: ProjectDto;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  onLayerChange: (nextLayer: TLayer) => void;
};

type RangeMappedLayerEditingOverlayProps<TLayer extends LayerDto> = Omit<
  RangeMappedLayerEditingOverlayBaseProps<TLayer>,
  "layer"
> & {
  ariaLabel: string;
  getHandleLabel: (handle: LayerHandle) => string;
  getValueLabel: (handle: LayerHandle) => string;
  model: Layer<TLayer>;
  testId: string;
};

export function RangeMappedLayerEditingOverlay<TLayer extends LayerDto>({
  ariaLabel,
  canvas,
  displayScale,
  getHandleLabel,
  getValueLabel,
  model,
  onInteractionEnd,
  onInteractionStart,
  onLayerChange,
  project,
  snapping,
  testId,
}: RangeMappedLayerEditingOverlayProps<TLayer>) {
  const context = {
    project,
    rangeById: new Map(project.ranges.map((range) => [range.id, range])),
  };

  return (
    <g aria-label={ariaLabel} data-testid={testId}>
      <EditingOverlayGeometry
        displayScale={displayScale}
        primitives={model.getEditingOverlay(context)}
      />
      <LayerHandles
        canvas={canvas}
        displayScale={displayScale}
        getLabel={getValueLabel}
        handles={model
          .getHandles(context)
          .map((handle) => ({ ...handle, label: getHandleLabel(handle) }))}
        onHandleChange={(handleId, input) =>
          onLayerChange(
            model.applyHandleDrag(
              handleId,
              {
                ...input,
                snapDistanceMm: snapping.enabled ? snapping.distanceMm : OVERLAY_INTEGER_INCREMENT,
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

export function formatOverlayValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
