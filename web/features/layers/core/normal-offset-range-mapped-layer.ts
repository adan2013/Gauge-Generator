import type {
  EditingOverlayContext,
  LayerHandle,
  PointerInput,
} from "@/features/layers/core/layer";
import {
  applyNormalOffsetRangeMappedLayerRadiusDrag,
  getNormalOffsetRangeMappedLayerEditingOverlay,
  getNormalOffsetRangeMappedLayerRadiusHandle,
  getSourceRange,
} from "@/features/layers/core/range-mapped-layer-geometry";
import { RangeMappedLayer } from "@/features/layers/core/range-mapped-layer";
import type { LayerDto } from "@/features/project/project-dto/project-dto";

type NormalOffsetRangeMappedLayerDto = LayerDto & {
  radiusOffsetMm: number;
  valueEnd: number;
  valueStart: number;
};

export abstract class NormalOffsetRangeMappedLayer<
  TDto extends NormalOffsetRangeMappedLayerDto,
> extends RangeMappedLayer<TDto> {
  getEditingOverlay(context: EditingOverlayContext) {
    const range = getSourceRange(this.dto, context);
    return range ? getNormalOffsetRangeMappedLayerEditingOverlay(this.dto, range) : [];
  }

  getHandles(context: EditingOverlayContext): LayerHandle[] {
    const range = getSourceRange(this.dto, context);
    return range ? getNormalOffsetRangeMappedLayerRadiusHandle(this.dto, range) : [];
  }

  applyHandleDrag(handleId: string, pointer: PointerInput, context: EditingOverlayContext): TDto {
    const range = getSourceRange(this.dto, context);
    return applyNormalOffsetRangeMappedLayerRadiusDrag(
      this.dto,
      handleId,
      pointer,
      range,
      range ? this.getRadiusOffsetBounds(range) : undefined,
    );
  }
}
