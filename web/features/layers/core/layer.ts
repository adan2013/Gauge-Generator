import type { LayerDto, ProjectDto, RangeDto } from "@/features/project/project-dto/project-dto";

export type CanvasPointMm = { x: number; y: number };
export type ValidationIssue = { path: string; code: string };
export type NumericPropertyDefinition = { min: number; max: number; step: number };
export type RenderContext = { project: ProjectDto; rangeById: ReadonlyMap<string, RangeDto> };
export type EditingOverlayContext = RenderContext & { zoom: number };
export type PointerInput = { point: CanvasPointMm; shiftKey: boolean; altKey: boolean };
export type LayerHandle = { id: string; kind: "move" | "radius" | "rotation" | "angle-start" | "angle-end" | "pivot"; label: string; point: CanvasPointMm };

export abstract class Layer<TDto extends LayerDto = LayerDto> {
  protected constructor(protected readonly dto: TDto) {}

  get id() { return this.dto.id; }
  get name() { return this.dto.name; }
  get type() { return this.dto.type; }
  get rangeId() { return this.dto.rangeId; }
  toDto(): TDto { return this.dto; }

  abstract getNumericPropertyDefinitions(context: RenderContext): Readonly<Record<string, NumericPropertyDefinition>>;
  abstract validate(context: RenderContext): ValidationIssue[];
  abstract toSvg(context: RenderContext): string;
  abstract toEditingOverlay(context: EditingOverlayContext): string;
  abstract getHandles(context: EditingOverlayContext): LayerHandle[];
  abstract applyHandleDrag(handleId: string, pointer: PointerInput, context: EditingOverlayContext): TDto;
}
