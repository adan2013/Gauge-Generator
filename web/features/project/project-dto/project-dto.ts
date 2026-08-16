import { z } from "zod";
import { NUMERIC_SCALE_LIMITS } from "@/features/layers/numeric-scale/numeric-scale-limits";
import { TICK_SCALE_LIMITS } from "@/features/layers/tick-scale/tick-scale-limits";
export { LAYER_TYPE, type LayerType } from "./layer-type";
import { LAYER_TYPE } from "./layer-type";

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
  type: z.literal(LAYER_TYPE.tickScale),
  valueStart: z.number(),
  valueEnd: z.number(),
  valueStep: z.number().positive(),
  tickLengthMm: z
    .number()
    .min(TICK_SCALE_LIMITS.tickLengthMm.min)
    .max(TICK_SCALE_LIMITS.tickLengthMm.max),
  tickWidthMm: z
    .number()
    .min(TICK_SCALE_LIMITS.tickWidthMm.min)
    .max(TICK_SCALE_LIMITS.tickWidthMm.max),
  radiusOffsetMm: z.number().min(-500).max(500),
  cornerRadiusPercent: z.number().min(0).max(50),
  color: HexColorSchema,
}).strict();

const NumericScaleLayerSchema = LayerBaseSchema.extend({
  type: z.literal(LAYER_TYPE.numericScale),
  valueStart: z.number(),
  valueEnd: z.number(),
  valueStep: z.number().positive(),
  scaleMultiplier: z.number().gt(0).max(100),
  decimalPlaces: z.number().int().min(0).max(4),
  radiusOffsetMm: z.number().min(-500).max(500),
  fontSizeMm: z
    .number()
    .min(NUMERIC_SCALE_LIMITS.fontSizeMm.min)
    .max(NUMERIC_SCALE_LIMITS.fontSizeMm.max),
  fontFamily: z.enum(["Arial", "Georgia", "Courier New"]),
  bold: z.boolean(),
  italic: z.boolean(),
  underline: z.boolean(),
  rotated: z.boolean(),
  color: HexColorSchema,
}).strict();

export const LayerSchema = z.discriminatedUnion("type", [
  TickScaleLayerSchema,
  NumericScaleLayerSchema,
]);

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
export type TickScaleLayerDto = Extract<LayerDto, { type: typeof LAYER_TYPE.tickScale }>;
export type NumericScaleLayerDto = Extract<LayerDto, { type: typeof LAYER_TYPE.numericScale }>;
export type CanvasDto = z.infer<typeof CanvasSchema>;
export type ProjectDto = z.infer<typeof ProjectSchema>;

/** A Range may overhang a nearby canvas edge, but its radius stays bounded. */
export function getRangeRadiusMaximum(canvas: CanvasDto): number {
  return Math.max(canvas.widthMm, canvas.heightMm) / 2;
}
