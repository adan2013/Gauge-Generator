"use client";

import { useTranslations } from "next-intl";
import { EditingOverlayGeometry } from "@/features/layers/core/editing-overlay-geometry/editing-overlay-geometry";
import { OVERLAY_INTEGER_INCREMENT } from "@/features/layers/core/layer";
import { LayerHandles } from "@/features/layers/core/layer-handles/layer-handles";
import { LabelLayer } from "@/features/layers/label/label";
import type {
  CanvasDto,
  LabelLayerDto,
  ProjectDto,
} from "@/features/project/project-dto/project-dto";

type LabelEditingOverlayProps = {
  canvas: CanvasDto;
  displayScale: number;
  layer: LabelLayerDto;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  onLayerChange: (layer: LabelLayerDto) => void;
  project: ProjectDto;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function LabelEditingOverlay({
  canvas,
  displayScale,
  layer,
  onInteractionEnd,
  onInteractionStart,
  onLayerChange,
  project,
  snapping,
}: LabelEditingOverlayProps) {
  const t = useTranslations("Editor.label");
  const model = new LabelLayer(layer);
  const context = {
    project,
    rangeById: new Map(project.ranges.map((range) => [range.id, range])),
  };
  const getHandleValue = (handleId: string) => {
    if (layer.layout.mode === "text-arc")
      return t("handleValues.radiusOffset", { value: layer.layout.radiusOffsetMm });
    return handleId === "position"
      ? t("handleValues.position", {
          x: layer.layout.offsetXMm,
          y: layer.layout.offsetYMm,
        })
      : t("handleValues.rotation", { value: layer.layout.rotationDegrees });
  };
  return (
    <g aria-label={t("overlayAriaLabel")} data-testid="label-editing-overlay">
      <EditingOverlayGeometry
        displayScale={displayScale}
        primitives={model.getEditingOverlay(context)}
      />
      <LayerHandles
        canvas={canvas}
        displayScale={displayScale}
        getLabel={(handle) => getHandleValue(handle.id)}
        handles={model.getHandles(context).map((handle) => ({
          ...handle,
          label: t(`handles.${handle.id}`),
        }))}
        onHandleChange={(handleId, input) =>
          onLayerChange(
            model.applyHandleDrag(
              handleId,
              {
                ...input,
                snapAngleDegrees: snapping.enabled
                  ? snapping.angleDegrees
                  : OVERLAY_INTEGER_INCREMENT,
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
