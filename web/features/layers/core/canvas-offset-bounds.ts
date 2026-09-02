import type { CanvasDto, RangeDto } from "@/features/project/project-dto/project-dto";

export type CanvasOffsetBounds = {
  offsetX: { min: number; max: number };
  offsetY: { min: number; max: number };
};

export function getCanvasOffsetBounds(canvas: CanvasDto, range: RangeDto): CanvasOffsetBounds {
  return {
    offsetX: { min: -range.centerX, max: canvas.widthMm - range.centerX },
    offsetY: { min: -range.centerY, max: canvas.heightMm - range.centerY },
  };
}
