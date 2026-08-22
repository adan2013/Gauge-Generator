import { TickScaleLayer } from "@/features/layers/tick-scale/tick-scale";
import { NumericScaleLayer } from "@/features/layers/numeric-scale/numeric-scale";
import { LabelLayer } from "@/features/layers/label/label";
import { ArcLayer } from "@/features/layers/arc/arc";
import { NeedleLayer } from "@/features/layers/needle/needle";
import { EllipseLayer } from "@/features/layers/ellipse/ellipse";
import { RectangleLayer } from "@/features/layers/rectangle/rectangle";
import { LineLayer } from "@/features/layers/line/line";
import { constrainArcToRange } from "@/features/layers/arc/arc-constraints";
import { constrainNeedleToRange } from "@/features/layers/needle/needle-constraints";
import { constrainLabelToRange } from "@/features/layers/label/label-constraints";
import { constrainNumericScaleToRange } from "@/features/layers/numeric-scale/numeric-scale-constraints";
import { constrainTickScaleToRange } from "@/features/layers/tick-scale/tick-scale-constraints";
import { constrainPlanarShapeToCanvas } from "@/features/layers/planar-shape/planar-shape-constraints";
import { constrainLineToCanvas } from "@/features/layers/line/line-constraints";
import {
  LAYER_TYPE,
  type LayerDto,
  type ProjectDto,
  type RangeDto,
} from "@/features/project/project-dto/project-dto";
import type { Layer } from "./layer";

export function createLayerModel(layer: LayerDto): Layer {
  switch (layer.type) {
    case LAYER_TYPE.tickScale:
      return new TickScaleLayer(layer);
    case LAYER_TYPE.numericScale:
      return new NumericScaleLayer(layer);
    case LAYER_TYPE.label:
      return new LabelLayer(layer);
    case LAYER_TYPE.arc:
      return new ArcLayer(layer);
    case LAYER_TYPE.needle:
      return new NeedleLayer(layer);
    case LAYER_TYPE.ellipse:
      return new EllipseLayer(layer);
    case LAYER_TYPE.rectangle:
      return new RectangleLayer(layer);
    case LAYER_TYPE.line:
      return new LineLayer(layer);
    default:
      return assertNever(layer);
  }
}

export function constrainProjectLayersToRanges(project: ProjectDto): ProjectDto {
  const rangeById = new Map(project.ranges.map((range) => [range.id, range]));
  return {
    ...project,
    layers: project.layers.map((layer) => {
      const range = rangeById.get(layer.rangeId);
      return range ? constrainLayerToRange(layer, range, project.canvas) : layer;
    }),
  };
}

function constrainLayerToRange(
  layer: LayerDto,
  range: RangeDto,
  canvas: ProjectDto["canvas"],
): LayerDto {
  switch (layer.type) {
    case LAYER_TYPE.tickScale:
      return constrainTickScaleToRange(layer, range);
    case LAYER_TYPE.numericScale:
      return constrainNumericScaleToRange(layer, range);
    case LAYER_TYPE.label:
      return constrainLabelToRange(layer, range, canvas);
    case LAYER_TYPE.arc:
      return constrainArcToRange(layer, range);
    case LAYER_TYPE.needle:
      return constrainNeedleToRange(layer, range);
    case LAYER_TYPE.ellipse:
    case LAYER_TYPE.rectangle:
      return constrainPlanarShapeToCanvas(layer, range, canvas);
    case LAYER_TYPE.line:
      return constrainLineToCanvas(layer, range, canvas);
    default:
      return assertNever(layer);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unsupported layer: ${JSON.stringify(value)}`);
}
