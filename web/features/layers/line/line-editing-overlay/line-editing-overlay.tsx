"use client";

import { useTranslations } from "next-intl";
import { EditingOverlayGeometry } from "@/features/layers/core/editing-overlay-geometry/editing-overlay-geometry";
import { LayerHandles } from "@/features/layers/core/layer-handles/layer-handles";
import { OVERLAY_INTEGER_INCREMENT } from "@/features/layers/core/layer";
import { LineLayer } from "@/features/layers/line/line";
import type {
  CanvasDto,
  LineLayerDto,
  ProjectDto,
} from "@/features/project/project-dto/project-dto";

type LineEditingOverlayProps = {
  canvas: CanvasDto;
  displayScale: number;
  layer: LineLayerDto;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  onLayerChange: (layer: LineLayerDto) => void;
  project: ProjectDto;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function LineEditingOverlay(props: LineEditingOverlayProps) {
  const t = useTranslations("Editor.line");
  const model = new LineLayer(props.layer);
  const context = {
    project: props.project,
    rangeById: new Map(props.project.ranges.map((range) => [range.id, range])),
  };
  const positionValue = t("handleValues.position", {
    x: formatValue(props.layer.geometry.offsetXMm),
    y: formatValue(props.layer.geometry.offsetYMm),
  });
  return (
    <g aria-label={t("overlayAriaLabel")} data-testid="line-editing-overlay">
      <EditingOverlayGeometry
        displayScale={props.displayScale}
        primitives={model.getEditingOverlay(context)}
      />
      <LayerHandles
        canvas={props.canvas}
        displayScale={props.displayScale}
        getLabel={(handle) => (handle.id === "position" ? positionValue : null)}
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

function formatValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
