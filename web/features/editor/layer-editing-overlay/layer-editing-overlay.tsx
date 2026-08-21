import { NumericScaleEditingOverlay } from "@/features/layers/numeric-scale/numeric-scale-editing-overlay/numeric-scale-editing-overlay";
import { TickScaleEditingOverlay } from "@/features/layers/tick-scale/tick-scale-editing-overlay/tick-scale-editing-overlay";
import { LabelEditingOverlay } from "@/features/layers/label/label-editing-overlay/label-editing-overlay";
import { ArcEditingOverlay } from "@/features/layers/arc/arc-editing-overlay/arc-editing-overlay";
import { NeedleEditingOverlay } from "@/features/layers/needle/needle-editing-overlay/needle-editing-overlay";
import {
  LAYER_TYPE,
  type CanvasDto,
  type LayerDto,
  type ProjectDto,
} from "@/features/project/project-dto/project-dto";

type LayerEditingOverlayProps = {
  canvas: CanvasDto;
  displayScale: number;
  layer: LayerDto;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  onLayerChange: (layer: LayerDto) => void;
  project: ProjectDto;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

export function LayerEditingOverlay(props: LayerEditingOverlayProps) {
  switch (props.layer.type) {
    case LAYER_TYPE.tickScale:
      return <TickScaleEditingOverlay {...props} layer={props.layer} />;
    case LAYER_TYPE.numericScale:
      return <NumericScaleEditingOverlay {...props} layer={props.layer} />;
    case LAYER_TYPE.label:
      return <LabelEditingOverlay {...props} layer={props.layer} />;
    case LAYER_TYPE.arc:
      return <ArcEditingOverlay {...props} layer={props.layer} />;
    case LAYER_TYPE.needle:
      return <NeedleEditingOverlay {...props} layer={props.layer} />;
    default:
      return assertNever(props.layer);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unsupported layer: ${JSON.stringify(value)}`);
}
