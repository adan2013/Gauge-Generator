import { TickScaleLayer } from "@/features/layers/tick-scale/tick-scale";
import { NumericScaleLayer } from "@/features/layers/numeric-scale/numeric-scale";
import { constrainNumericScaleToRange } from "@/features/layers/numeric-scale/numeric-scale-constraints";
import { constrainTickScaleToRange } from "@/features/layers/tick-scale/tick-scale-constraints";
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
      return range ? constrainLayerToRange(layer, range) : layer;
    }),
  };
}

function constrainLayerToRange(layer: LayerDto, range: RangeDto): LayerDto {
  switch (layer.type) {
    case LAYER_TYPE.tickScale:
      return constrainTickScaleToRange(layer, range);
    case LAYER_TYPE.numericScale:
      return constrainNumericScaleToRange(layer, range);
    default:
      return assertNever(layer);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unsupported layer: ${JSON.stringify(value)}`);
}
