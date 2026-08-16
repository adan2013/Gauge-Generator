import { getNumericScaleValidationIssues } from "@/features/layers/numeric-scale/numeric-scale-validation";
import { getTickScaleValidationIssues } from "@/features/layers/tick-scale/tick-scale-validation";
import {
  type LayerDto,
  type LayerType,
  type ProjectValidationIssue,
  type RangeDto,
} from "@/features/project/project-dto/project-dto";
import { LAYER_TYPE } from "@/features/project/project-dto/layer-type";

const LAYER_PROJECT_VALIDATORS = {
  [LAYER_TYPE.tickScale]: (layer, range) => getTickScaleValidationIssues(layer as never, range),
  [LAYER_TYPE.numericScale]: (layer, range) =>
    getNumericScaleValidationIssues(layer as never, range),
} satisfies Record<LayerType, (layer: LayerDto, range: RangeDto) => ProjectValidationIssue[]>;

export function getLayerProjectValidationIssues(
  layer: LayerDto,
  sourceRange: RangeDto,
): ProjectValidationIssue[] {
  return LAYER_PROJECT_VALIDATORS[layer.type](layer, sourceRange);
}
