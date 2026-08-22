import type { LayerDto, ProjectDto, RangeDto } from "@/features/project/project-dto/project-dto";
import type { ProjectValidationCode } from "@/features/project/project-dto/project-validation-codes";
import type { EditingOverlayPrimitive } from "@/features/layers/core/editing-overlay-geometry";

export type CanvasPointMm = { x: number; y: number };
export type ValidationIssue = { path: string; code: ProjectValidationCode };
export type NumericPropertyDefinition<TKey extends string = string> = {
  integerOnly?: boolean;
  key: TKey;
  max: number;
  min: number;
  snap: "angle" | "distance" | "none";
  step: number;
  value: number;
};
export type RenderContext = { project: ProjectDto; rangeById: ReadonlyMap<string, RangeDto> };
export type EditingOverlayContext = RenderContext;
export const OVERLAY_INTEGER_INCREMENT = 1;
export type PointerInput = {
  point: CanvasPointMm;
  shiftKey: boolean;
  altKey: boolean;
  snapDistanceMm?: number;
  snapAngleDegrees?: number;
};
export type LayerHandle = {
  id: string;
  kind:
    | "move"
    | "radius"
    | "rotation"
    | "angle-start"
    | "angle-end"
    | "pivot"
    | "length"
    | "value"
    | "resize";
  label: string;
  point: CanvasPointMm;
};

export abstract class Layer<TDto extends LayerDto = LayerDto> {
  protected constructor(protected readonly dto: TDto) {}

  get id() {
    return this.dto.id;
  }
  get name() {
    return this.dto.name;
  }
  get type() {
    return this.dto.type;
  }
  get rangeId() {
    return this.dto.rangeId;
  }
  toDto(): TDto {
    return this.dto;
  }

  abstract validate(context: RenderContext): ValidationIssue[];
  abstract toSvg(context: RenderContext): string;
  abstract getEditingOverlay(context: EditingOverlayContext): readonly EditingOverlayPrimitive[];
  abstract getHandles(context: EditingOverlayContext): LayerHandle[];
  abstract applyHandleDrag(
    handleId: string,
    pointer: PointerInput,
    context: EditingOverlayContext,
  ): TDto;
}
