import type { RenderContext, ValidationIssue } from "@/features/layers/core/layer";
import { PlanarGeometryLayer } from "@/features/layers/planar-geometry/planar-geometry";
import type { PlanarShapeLayerDto, RangeDto } from "@/features/project/project-dto/project-dto";
import { getPlanarShapeValidationIssues } from "./planar-shape-constraints";

export abstract class PlanarShapeLayer<
  TDto extends PlanarShapeLayerDto,
> extends PlanarGeometryLayer<TDto> {
  protected override getValidationIssues(
    context: RenderContext,
    range: RangeDto,
  ): ValidationIssue[] {
    return getPlanarShapeValidationIssues(this.dto, context.project.canvas, range);
  }
}
