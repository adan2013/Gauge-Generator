import type {
  EditingOverlayContext,
  LayerHandle,
  PointerInput,
} from "@/features/layers/core/layer";
import { Layer } from "@/features/layers/core/layer";
import {
  applyRangeMappedLayerRadiusDrag,
  getRangeMappedLayerEditingOverlay,
  getRangeMappedLayerRadiusHandle,
  getSourceRange,
  type RadiusOffsetBounds,
} from "@/features/layers/core/range-mapped-layer-geometry";
import type { LayerDto, RangeDto } from "@/features/project/project-dto/project-dto";

type RangeMappedLayerDto = LayerDto & {
  radiusOffsetMm: number;
  valueEnd: number;
  valueStart: number;
};

export abstract class RangeMappedLayer<TDto extends RangeMappedLayerDto> extends Layer<TDto> {
  getEditingOverlay(context: EditingOverlayContext) {
    const range = getSourceRange(this.dto, context);
    return range ? getRangeMappedLayerEditingOverlay(this.dto, range) : [];
  }

  getHandles(context: EditingOverlayContext): LayerHandle[] {
    const range = getSourceRange(this.dto, context);
    return range ? getRangeMappedLayerRadiusHandle(this.dto, range) : [];
  }

  applyHandleDrag(handleId: string, pointer: PointerInput, context: EditingOverlayContext): TDto {
    const range = getSourceRange(this.dto, context);
    return applyRangeMappedLayerRadiusDrag(
      this.dto,
      handleId,
      pointer,
      range,
      range ? this.getRadiusOffsetBounds(range) : undefined,
    );
  }

  protected abstract getRadiusOffsetBounds(range: RangeDto): RadiusOffsetBounds;
}
