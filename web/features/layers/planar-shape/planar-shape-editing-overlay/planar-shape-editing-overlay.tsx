"use client";

import { useTranslations } from "next-intl";
import { EditingOverlayGeometry } from "@/features/layers/core/editing-overlay-geometry/editing-overlay-geometry";
import { OVERLAY_INTEGER_INCREMENT } from "@/features/layers/core/layer";
import { LayerHandles } from "@/features/layers/core/layer-handles/layer-handles";
import { EllipseLayer } from "@/features/layers/ellipse/ellipse";
import { RectangleLayer } from "@/features/layers/rectangle/rectangle";
import type {
  CanvasDto,
  PlanarShapeLayerDto,
  ProjectDto,
} from "@/features/project/project-dto/project-dto";

type PlanarShapeEditingOverlayProps = {
  canvas: CanvasDto;
  displayScale: number;
  layer: PlanarShapeLayerDto;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  onLayerChange: (layer: PlanarShapeLayerDto) => void;
  project: ProjectDto;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function PlanarShapeEditingOverlay(props: PlanarShapeEditingOverlayProps) {
  const t = useTranslations("Editor.shape");
  const model =
    props.layer.type === "ellipse"
      ? new EllipseLayer(props.layer)
      : new RectangleLayer(props.layer);
  const context = {
    project: props.project,
    rangeById: new Map(props.project.ranges.map((range) => [range.id, range])),
  };
  const values: Record<string, string> = {
    position: t("handleValues.position", {
      x: formatValue(props.layer.geometry.offsetXMm),
      y: formatValue(props.layer.geometry.offsetYMm),
    }),
    rotation: t("handleValues.rotation", { value: props.layer.geometry.rotationDegrees }),
    size: t("handleValues.size", {
      width: formatValue(props.layer.geometry.widthMm),
      height: formatValue(props.layer.geometry.heightMm),
    }),
  };
  return (
    <g aria-label={t("overlayAriaLabel")} data-testid={`${props.layer.type}-editing-overlay`}>
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

function formatValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
