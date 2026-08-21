"use client";

import { useTranslations } from "next-intl";
import { EditingOverlayGeometry } from "@/features/layers/core/editing-overlay-geometry/editing-overlay-geometry";
import { OVERLAY_INTEGER_INCREMENT } from "@/features/layers/core/layer";
import { LayerHandles } from "@/features/layers/core/layer-handles/layer-handles";
import { NeedleLayer } from "@/features/layers/needle/needle";
import type {
  CanvasDto,
  NeedleLayerDto,
  ProjectDto,
} from "@/features/project/project-dto/project-dto";

type NeedleEditingOverlayProps = {
  canvas: CanvasDto;
  displayScale: number;
  layer: NeedleLayerDto;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  onLayerChange: (layer: NeedleLayerDto) => void;
  project: ProjectDto;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function NeedleEditingOverlay(props: NeedleEditingOverlayProps) {
  const t = useTranslations("Editor.needle");
  const model = new NeedleLayer(props.layer);
  const context = {
    project: props.project,
    rangeById: new Map(props.project.ranges.map((range) => [range.id, range])),
  };
  const values: Record<string, string> = {
    value: t("handleValues.value", { value: props.layer.value }),
    length: t("handleValues.length", { value: props.layer.shaft.lengthMm }),
    "tail-length": t("handleValues.tailLength", { value: props.layer.shaft.tailLengthMm }),
  };
  return (
    <g aria-label={t("overlayAriaLabel")} data-testid="needle-editing-overlay">
      <EditingOverlayGeometry
        displayScale={props.displayScale}
        primitives={model.getEditingOverlay(context)}
      />
      <LayerHandles
        canvas={props.canvas}
        displayScale={props.displayScale}
        getLabel={(handle) => values[handle.id] ?? handle.label}
        handles={model.getHandles(context).map((handle) => ({
          ...handle,
          label: t(`handles.${handle.id}`),
        }))}
        onHandleChange={(handleId, input) =>
          props.onLayerChange(
            model.applyHandleDrag(
              handleId,
              {
                ...input,
                snapAngleDegrees: props.snapping.enabled
                  ? props.snapping.angleDegrees
                  : OVERLAY_INTEGER_INCREMENT,
                snapDistanceMm: props.snapping.enabled
                  ? props.snapping.distanceMm
                  : OVERLAY_INTEGER_INCREMENT,
              },
              context,
            ),
          )
        }
        onInteractionEnd={props.onInteractionEnd}
        onInteractionStart={props.onInteractionStart}
      />
    </g>
  );
}
