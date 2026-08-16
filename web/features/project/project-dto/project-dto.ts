import { z } from "zod";
import { PROJECT_VALIDATION_CODES, type ProjectValidationCode } from "./project-validation-codes";

export const PROJECT_FORMAT = "gauge-generator-web" as const;
export const PROJECT_VERSION = 1 as const;
export const MAX_LAYERS = 80;
export const MAX_RANGES = 5;
export const CANVAS_DIMENSION_MIN_MM = 20;
export const CANVAS_DIMENSION_MAX_MM = 1_000;

const IdSchema = z.string().uuid();
const NameSchema = z.string().trim().min(1).max(80);
const HexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const ScaleDefinitionSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("linear"), start: z.number(), end: z.number() }).strict(),
  z
    .object({
      mode: z.literal("logarithmic"),
      start: z.number().positive(),
      end: z.number().positive(),
      base: z.number().gt(1),
    })
    .strict(),
  z
    .object({
      mode: z.literal("custom"),
      points: z
        .array(z.object({ value: z.number(), position: z.number().min(0).max(1) }).strict())
        .min(2),
    })
    .strict(),
]);

export const RangeSchema = z
  .object({
    id: IdSchema,
    name: NameSchema,
    centerX: z.number().nonnegative(),
    centerY: z.number().nonnegative(),
    radius: z.number().min(5),
    angleStart: z.number().min(0).max(360),
    openingAngle: z.number().min(-360).max(360),
    scaleDefinition: ScaleDefinitionSchema,
  })
  .strict();

const LayerBaseSchema = z
  .object({
    id: IdSchema,
    name: NameSchema,
    visible: z.boolean(),
    rangeId: IdSchema,
  })
  .strict();

const TickScaleLayerSchema = LayerBaseSchema.extend({
  type: z.literal("tick-scale"),
  valueStart: z.number(),
  valueEnd: z.number(),
  valueStep: z.number().positive(),
  tickLengthMm: z.number().min(0.2).max(50),
  tickWidthMm: z.number().min(0.1).max(10),
  radiusOffsetMm: z.number().min(-500).max(500),
  cornerRadiusPercent: z.number().min(0).max(50),
  color: HexColorSchema,
}).strict();

export const LayerSchema = z.discriminatedUnion("type", [TickScaleLayerSchema]);

export const CanvasSchema = z
  .object({
    widthMm: z.number().min(CANVAS_DIMENSION_MIN_MM).max(CANVAS_DIMENSION_MAX_MM),
    heightMm: z.number().min(CANVAS_DIMENSION_MIN_MM).max(CANVAS_DIMENSION_MAX_MM),
    background: HexColorSchema,
    transparentBackground: z.boolean().default(true),
  })
  .strict();

export const ProjectSchema = z
  .object({
    format: z.literal(PROJECT_FORMAT),
    version: z.literal(PROJECT_VERSION),
    meta: z
      .object({
        title: NameSchema,
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      })
      .strict(),
    canvas: CanvasSchema,
    layers: z.array(LayerSchema).max(MAX_LAYERS),
    ranges: z.array(RangeSchema).max(MAX_RANGES),
    extensions: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export type ScaleDefinitionDto = z.infer<typeof ScaleDefinitionSchema>;
export type RangeDto = z.infer<typeof RangeSchema>;
export type LayerDto = z.infer<typeof LayerSchema>;
export type TickScaleLayerDto = Extract<LayerDto, { type: "tick-scale" }>;
export type CanvasDto = z.infer<typeof CanvasSchema>;
export type ProjectDto = z.infer<typeof ProjectSchema>;

export type ProjectValidationIssue = { path: string; code: ProjectValidationCode };

/** A Range may overhang a nearby canvas edge, but its radius stays bounded. */
export function getRangeRadiusMaximum(canvas: CanvasDto): number {
  return Math.max(canvas.widthMm, canvas.heightMm) / 2;
}

export function validateProject(project: unknown): {
  data?: ProjectDto;
  issues: ProjectValidationIssue[];
} {
  const parsed = ProjectSchema.safeParse(project);
  if (!parsed.success) {
    return {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        code: PROJECT_VALIDATION_CODES.invalidSchema,
      })),
    };
  }

  const issues: ProjectValidationIssue[] = [];
  const ids = [
    ...parsed.data.ranges.map((range) => range.id),
    ...parsed.data.layers.map((layer) => layer.id),
  ];
  if (new Set(ids).size !== ids.length)
    issues.push({ path: "", code: PROJECT_VALIDATION_CODES.duplicateObjectId });

  const rangeIds = new Set(parsed.data.ranges.map((range) => range.id));
  for (const layer of parsed.data.layers) {
    if (!rangeIds.has(layer.rangeId))
      issues.push({
        path: `layers.${layer.id}.rangeId`,
        code: PROJECT_VALIDATION_CODES.missingRangeReference,
      });
    const sourceRange = parsed.data.ranges.find((range) => range.id === layer.rangeId);
    if (layer.type === "tick-scale" && sourceRange) {
      const effectiveRadiusMm = sourceRange.radius + layer.radiusOffsetMm;
      if (effectiveRadiusMm <= 0)
        issues.push({
          path: `layers.${layer.id}.radiusOffsetMm`,
          code: PROJECT_VALIDATION_CODES.tickScaleRadiusNonPositive,
        });
      if (layer.radiusOffsetMm > sourceRange.radius)
        issues.push({
          path: `layers.${layer.id}.radiusOffsetMm`,
          code: PROJECT_VALIDATION_CODES.tickScaleRadiusOffsetOutsideRange,
        });
      if (layer.tickLengthMm > effectiveRadiusMm)
        issues.push({
          path: `layers.${layer.id}.tickLengthMm`,
          code: PROJECT_VALIDATION_CODES.tickScaleLengthOutsideRadius,
        });
      if (layer.tickWidthMm > layer.tickLengthMm)
        issues.push({
          path: `layers.${layer.id}.tickWidthMm`,
          code: PROJECT_VALIDATION_CODES.tickScaleWidthExceedsLength,
        });
      const scaleValues =
        sourceRange.scaleDefinition.mode === "custom"
          ? sourceRange.scaleDefinition.points.map((point) => point.value)
          : [sourceRange.scaleDefinition.start, sourceRange.scaleDefinition.end];
      const scaleMinimum = Math.min(...scaleValues);
      const scaleMaximum = Math.max(...scaleValues);
      if (layer.valueStart < scaleMinimum || layer.valueEnd > scaleMaximum)
        issues.push({
          path: `layers.${layer.id}`,
          code: PROJECT_VALIDATION_CODES.tickScaleValueOutsideRange,
        });
      if (layer.valueStart > layer.valueEnd)
        issues.push({
          path: `layers.${layer.id}.valueStart`,
          code: PROJECT_VALIDATION_CODES.tickScaleValueStartAfterEnd,
        });
      if (Math.floor((layer.valueEnd - layer.valueStart) / layer.valueStep) + 1 > 200)
        issues.push({
          path: `layers.${layer.id}.valueStep`,
          code: PROJECT_VALIDATION_CODES.tickScaleTooManyMarks,
        });
    }
  }

  for (const range of parsed.data.ranges) {
    if (range.centerX > parsed.data.canvas.widthMm)
      issues.push({
        path: `ranges.${range.id}.centerX`,
        code: PROJECT_VALIDATION_CODES.rangeCenterOutsideCanvas,
      });
    if (range.centerY > parsed.data.canvas.heightMm)
      issues.push({
        path: `ranges.${range.id}.centerY`,
        code: PROJECT_VALIDATION_CODES.rangeCenterOutsideCanvas,
      });
    if (range.radius > getRangeRadiusMaximum(parsed.data.canvas))
      issues.push({
        path: `ranges.${range.id}.radius`,
        code: PROJECT_VALIDATION_CODES.rangeRadiusOutsideCanvasLimit,
      });
    const scale = range.scaleDefinition;
    if (scale.mode !== "custom" && scale.start === scale.end)
      issues.push({
        path: `ranges.${range.id}.scaleDefinition`,
        code: PROJECT_VALIDATION_CODES.scaleStartEqualsEnd,
      });
    if (scale.mode === "custom") {
      for (let index = 1; index < scale.points.length; index += 1) {
        const previous = scale.points[index - 1];
        const point = scale.points[index];
        if (point.value <= previous.value || point.position < previous.position)
          issues.push({
            path: `ranges.${range.id}.scaleDefinition.points.${index}`,
            code: PROJECT_VALIDATION_CODES.customScaleNotMonotonic,
          });
      }
    }
  }

  return issues.length > 0 ? { issues } : { data: parsed.data, issues: [] };
}
