import type { ReactNode } from "react";
import { NumericScaleEditingOverlay } from "@/features/layers/numeric-scale/numeric-scale-editing-overlay/numeric-scale-editing-overlay";
import { TickScaleEditingOverlay } from "@/features/layers/tick-scale/tick-scale-editing-overlay/tick-scale-editing-overlay";
import {
  LAYER_TYPE,
  type CanvasDto,
  type LayerDto,
  type LayerType,
  type NumericScaleLayerDto,
  type ProjectDto,
  type TickScaleLayerDto,
} from "@/features/project/project-dto/project-dto";

type LayerEditingOverlayProps = {
  canvas: CanvasDto;
  layer: LayerDto;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  onLayerChange: (layer: LayerDto) => void;
  project: ProjectDto;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

const LAYER_EDITING_OVERLAYS = {
  [LAYER_TYPE.tickScale]: (props) => (
    <TickScaleEditingOverlay {...props} layer={props.layer as TickScaleLayerDto} />
  ),
  [LAYER_TYPE.numericScale]: (props) => (
    <NumericScaleEditingOverlay {...props} layer={props.layer as NumericScaleLayerDto} />
  ),
} satisfies Record<LayerType, (props: LayerEditingOverlayProps) => ReactNode>;

export function LayerEditingOverlay(props: LayerEditingOverlayProps) {
  const Overlay = LAYER_EDITING_OVERLAYS[props.layer.type];
  return <Overlay {...props} />;
}
