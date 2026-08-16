import { TickScaleLayer } from "@/features/layers/tick-scale/tick-scale";
import { NumericScaleLayer } from "@/features/layers/numeric-scale/numeric-scale";
import { constrainNumericScaleToRange } from "@/features/layers/numeric-scale/numeric-scale-constraints";
import { constrainTickScaleToRange } from "@/features/layers/tick-scale/tick-scale-constraints";
import {
  LAYER_TYPE,
  type LayerDto,
  type LayerType,
  type RangeDto,
} from "@/features/project/project-dto/project-dto";
import type { Layer } from "./layer";

type LayerDefinition = {
  constrainToRange: (layer: LayerDto, range: RangeDto) => LayerDto;
  createModel: (layer: LayerDto) => Layer;
};

const LAYER_DEFINITIONS = {
  [LAYER_TYPE.tickScale]: {
    constrainToRange: (layer, range) => constrainTickScaleToRange(layer as never, range),
    createModel: (layer) => new TickScaleLayer(layer as never),
  },
  [LAYER_TYPE.numericScale]: {
    constrainToRange: (layer, range) => constrainNumericScaleToRange(layer as never, range),
    createModel: (layer) => new NumericScaleLayer(layer as never),
  },
} satisfies Record<LayerType, LayerDefinition>;

export function createLayerModel(layer: LayerDto): Layer {
  return LAYER_DEFINITIONS[layer.type].createModel(layer);
}

export function constrainLayerToRange(layer: LayerDto, range: RangeDto): LayerDto {
  return LAYER_DEFINITIONS[layer.type].constrainToRange(layer, range);
}
