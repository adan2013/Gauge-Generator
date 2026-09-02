import { z } from "zod";
import { CORNER_RADIUS_PERCENT } from "@/features/ranges/path-geometry/corner-radius-percent";
import { NUMERIC_SCALE_LIMITS } from "@/features/layers/numeric-scale/numeric-scale-limits";
import { TICK_SCALE_LIMITS } from "@/features/layers/tick-scale/tick-scale-limits";
import { LABEL_LIMITS } from "@/features/layers/label/label-limits";
import { ARC_LIMITS } from "@/features/layers/arc/arc-limits";
import { NEEDLE_LIMITS } from "@/features/layers/needle/needle-limits";
import { PLANAR_SHAPE_LIMITS } from "@/features/layers/planar-shape/planar-shape-limits";
import { PLANAR_GEOMETRY_LIMITS } from "@/features/layers/planar-geometry/planar-geometry-limits";
import { LINE_LIMITS } from "@/features/layers/line/line-limits";
import { ICON_LIMITS } from "@/features/layers/icon/icon-limits";
import {
  FONT_FAMILY_NAME_MAX_LENGTH,
  TEXT_STYLE_LIMITS,
} from "@/features/layers/core/text-style/text-style-limits";
export { LAYER_TYPE, type LayerType } from "./layer-type";
import { LAYER_TYPE } from "./layer-type";

export const PROJECT_FORMAT = "gauge-generator-web" as const;
export const PROJECT_VERSION = 1 as const;
export const MAX_LAYERS = 80;
export const MAX_RANGES = 5;
export const CANVAS_DIMENSION_MIN_MM = 20;
export const CANVAS_DIMENSION_MAX_MM = 1_000;
export const CUSTOM_SCALE_POSITION_STEP = 0.05;
export const SCALE_VALUE_MIN = -1_000_000;
export const SCALE_VALUE_MAX = 1_000_000;

const IdSchema = z.string().uuid();
const NameSchema = z.string().trim().min(1).max(80);
const HexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const ScaleValueSchema = z.number().int().min(SCALE_VALUE_MIN).max(SCALE_VALUE_MAX);
const ScaleStepSchema = z
  .number()
  .int()
  .positive()
  .max(SCALE_VALUE_MAX - SCALE_VALUE_MIN);

export const FontReferenceSchema = z
  .object({
    source: z.literal("system"),
    family: z
      .string()
      .trim()
      .min(1)
      .max(FONT_FAMILY_NAME_MAX_LENGTH)
      .refine((family) => !/[\u0000-\u001f\u007f]/.test(family)),
  })
  .strict();

export const TextStyleSchema = z
  .object({
    font: FontReferenceSchema,
    sizeMm: z.number().min(TEXT_STYLE_LIMITS.sizeMm.min).max(TEXT_STYLE_LIMITS.sizeMm.max),
    color: HexColorSchema,
    bold: z.boolean(),
    italic: z.boolean(),
    underline: z.boolean(),
  })
  .strict();

export const ScaleDefinitionSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("linear"), start: ScaleValueSchema, end: ScaleValueSchema }).strict(),
  z
    .object({
      mode: z.literal("logarithmic"),
      start: ScaleValueSchema.positive(),
      end: ScaleValueSchema.positive(),
      detailEmphasis: z.enum(["low-values", "high-values"]),
    })
    .strict(),
  z
    .object({
      mode: z.literal("custom"),
      points: z
        .array(
          z
            .object({
              value: ScaleValueSchema,
              position: z.number().min(0).max(1).multipleOf(CUSTOM_SCALE_POSITION_STEP),
            })
            .strict(),
        )
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
    cornerRadiusPercent: z.number().min(CORNER_RADIUS_PERCENT.min).max(CORNER_RADIUS_PERCENT.max),
    angleStart: z.number().min(0).max(360),
    openingAngle: z.number().min(-360).max(360),
    valueDirection: z.enum(["ascending", "descending"]),
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
  valueStart: ScaleValueSchema,
  valueEnd: ScaleValueSchema,
  valueStep: ScaleStepSchema,
  tickLengthMm: z
    .number()
    .min(TICK_SCALE_LIMITS.tickLengthMm.min)
    .max(TICK_SCALE_LIMITS.tickLengthMm.max),
  tickWidthMm: z
    .number()
    .min(TICK_SCALE_LIMITS.tickWidthMm.min)
    .max(TICK_SCALE_LIMITS.tickWidthMm.max),
  radiusOffsetMm: z.number().min(-500).max(500),
  color: HexColorSchema,
}).strict();

const NumericScaleLayerSchema = LayerBaseSchema.extend({
  type: z.literal(LAYER_TYPE.numericScale),
  valueStart: ScaleValueSchema,
  valueEnd: ScaleValueSchema,
  valueStep: ScaleStepSchema,
  scaleMultiplier: z
    .number()
    .min(NUMERIC_SCALE_LIMITS.scaleMultiplier.min)
    .max(NUMERIC_SCALE_LIMITS.scaleMultiplier.max),
  decimalPlaces: z.number().int().min(0).max(4),
  radiusOffsetMm: z.number().min(-500).max(500),
  textStyle: TextStyleSchema,
  rotated: z.boolean(),
}).strict();

const LabelLayerSchema = LayerBaseSchema.extend({
  type: z.literal(LAYER_TYPE.label),
  text: z.string().min(1).max(LABEL_LIMITS.textLength.max),
  layout: z.discriminatedUnion("mode", [
    z
      .object({
        mode: z.literal("point"),
        offsetXMm: z
          .number()
          .min(LABEL_LIMITS.pointOffsetMm.min)
          .max(LABEL_LIMITS.pointOffsetMm.max),
        offsetYMm: z
          .number()
          .min(LABEL_LIMITS.pointOffsetMm.min)
          .max(LABEL_LIMITS.pointOffsetMm.max),
        rotationDegrees: z
          .number()
          .int()
          .min(LABEL_LIMITS.rotationDegrees.min)
          .max(LABEL_LIMITS.rotationDegrees.max),
      })
      .strict(),
    z
      .object({
        mode: z.literal("text-arc"),
        radiusOffsetMm: z
          .number()
          .min(LABEL_LIMITS.radiusOffsetMm.min)
          .max(LABEL_LIMITS.radiusOffsetMm.max),
        valueStart: ScaleValueSchema,
        valueEnd: ScaleValueSchema,
        alignment: z.enum(["start", "center", "end"]),
        direction: z.enum(["forward", "reverse"]),
      })
      .strict(),
  ]),
  textStyle: TextStyleSchema,
}).strict();

const ArcLayerSchema = LayerBaseSchema.extend({
  type: z.literal(LAYER_TYPE.arc),
  valueStart: ScaleValueSchema,
  valueEnd: ScaleValueSchema,
  radiusOffsetMm: z.number().min(-500).max(500),
  strokeWidthMm: z.number().min(ARC_LIMITS.strokeWidthMm.min).max(ARC_LIMITS.strokeWidthMm.max),
  roundedEnds: z.boolean(),
  color: HexColorSchema,
}).strict();

const NeedleLayerSchema = LayerBaseSchema.extend({
  type: z.literal(LAYER_TYPE.needle),
  value: ScaleValueSchema,
  shaft: z
    .object({
      lengthMm: z.number().min(NEEDLE_LIMITS.lengthMm.min).max(NEEDLE_LIMITS.lengthMm.max),
      tailLengthMm: z
        .number()
        .min(NEEDLE_LIMITS.tailLengthMm.min)
        .max(NEEDLE_LIMITS.tailLengthMm.max),
      widthMm: z.number().min(NEEDLE_LIMITS.widthMm.min).max(NEEDLE_LIMITS.widthMm.max),
      tipStyle: z.enum(["flat", "rounded", "arrowhead", "pointed", "tapered-rounded"]),
      color: HexColorSchema,
      tailColor: HexColorSchema,
    })
    .strict(),
  hub: z
    .object({
      visible: z.boolean(),
      radiusMm: z.number().min(NEEDLE_LIMITS.hubRadiusMm.min).max(NEEDLE_LIMITS.hubRadiusMm.max),
      color: HexColorSchema,
      placement: z.enum(["front", "behind"]),
    })
    .strict(),
}).strict();

const PlanarGeometrySchema = z
  .object({
    offsetXMm: z
      .number()
      .min(PLANAR_GEOMETRY_LIMITS.offsetMm.min)
      .max(PLANAR_GEOMETRY_LIMITS.offsetMm.max),
    offsetYMm: z
      .number()
      .min(PLANAR_GEOMETRY_LIMITS.offsetMm.min)
      .max(PLANAR_GEOMETRY_LIMITS.offsetMm.max),
    widthMm: z
      .number()
      .min(PLANAR_GEOMETRY_LIMITS.dimensionMm.min)
      .max(PLANAR_GEOMETRY_LIMITS.dimensionMm.max),
    heightMm: z
      .number()
      .min(PLANAR_GEOMETRY_LIMITS.dimensionMm.min)
      .max(PLANAR_GEOMETRY_LIMITS.dimensionMm.max),
    rotationDegrees: z
      .number()
      .int()
      .min(PLANAR_GEOMETRY_LIMITS.rotationDegrees.min)
      .max(PLANAR_GEOMETRY_LIMITS.rotationDegrees.max),
  })
  .strict();

const PlanarShapeStyleSchema = z
  .object({
    fillColor: HexColorSchema,
    borderColor: HexColorSchema,
    borderWidthMm: z
      .number()
      .min(PLANAR_SHAPE_LIMITS.borderWidthMm.min)
      .max(PLANAR_SHAPE_LIMITS.borderWidthMm.max),
  })
  .strict();

const EllipseLayerSchema = LayerBaseSchema.extend({
  type: z.literal(LAYER_TYPE.ellipse),
  geometry: PlanarGeometrySchema,
  style: PlanarShapeStyleSchema,
}).strict();

const RectangleLayerSchema = LayerBaseSchema.extend({
  type: z.literal(LAYER_TYPE.rectangle),
  geometry: PlanarGeometrySchema,
  style: PlanarShapeStyleSchema,
  cornerRadiusPercent: z
    .number()
    .min(PLANAR_SHAPE_LIMITS.cornerRadiusPercent.min)
    .max(PLANAR_SHAPE_LIMITS.cornerRadiusPercent.max),
}).strict();

const LineLayerSchema = LayerBaseSchema.extend({
  type: z.literal(LAYER_TYPE.line),
  geometry: z
    .object({
      offsetXMm: z.number().min(LINE_LIMITS.offsetMm.min).max(LINE_LIMITS.offsetMm.max),
      offsetYMm: z.number().min(LINE_LIMITS.offsetMm.min).max(LINE_LIMITS.offsetMm.max),
      lengthMm: z.number().min(LINE_LIMITS.lengthMm.min).max(LINE_LIMITS.lengthMm.max),
      rotationDegrees: z
        .number()
        .int()
        .min(LINE_LIMITS.rotationDegrees.min)
        .max(LINE_LIMITS.rotationDegrees.max),
    })
    .strict(),
  style: z
    .object({
      color: HexColorSchema,
      strokeWidthMm: z
        .number()
        .min(LINE_LIMITS.strokeWidthMm.min)
        .max(LINE_LIMITS.strokeWidthMm.max),
      roundedEnds: z.boolean(),
    })
    .strict(),
}).strict();

const IconLayerSchema = LayerBaseSchema.extend({
  type: z.literal(LAYER_TYPE.icon),
  icon: z
    .object({
      library: z.literal("lucide"),
      name: z
        .string()
        .regex(/^[a-z0-9-]+$/)
        .min(1)
        .max(80),
    })
    .strict(),
  geometry: PlanarGeometrySchema,
  style: z
    .object({
      color: HexColorSchema,
      strokeWidthMm: z
        .number()
        .min(ICON_LIMITS.strokeWidthMm.min)
        .max(ICON_LIMITS.strokeWidthMm.max),
    })
    .strict(),
}).strict();

export const LayerSchema = z.discriminatedUnion("type", [
  TickScaleLayerSchema,
  NumericScaleLayerSchema,
  LabelLayerSchema,
  ArcLayerSchema,
  NeedleLayerSchema,
  EllipseLayerSchema,
  RectangleLayerSchema,
  LineLayerSchema,
  IconLayerSchema,
]);

export const CanvasSchema = z
  .object({
    widthMm: z.number().min(CANVAS_DIMENSION_MIN_MM).max(CANVAS_DIMENSION_MAX_MM),
    heightMm: z.number().min(CANVAS_DIMENSION_MIN_MM).max(CANVAS_DIMENSION_MAX_MM),
    background: HexColorSchema,
    transparentBackground: z.boolean().default(true),
  })
  .strict();

export const SnappingSchema = z
  .object({
    enabled: z.boolean(),
    distanceMm: z.number().positive().max(CANVAS_DIMENSION_MAX_MM),
    angleDegrees: z.number().positive().max(360),
  })
  .strict();

export const ProjectSettingsSchema = z
  .object({
    snapping: SnappingSchema,
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
    settings: ProjectSettingsSchema,
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
export type LabelLayerDto = Extract<LayerDto, { type: typeof LAYER_TYPE.label }>;
export type ArcLayerDto = Extract<LayerDto, { type: typeof LAYER_TYPE.arc }>;
export type NeedleLayerDto = Extract<LayerDto, { type: typeof LAYER_TYPE.needle }>;
export type EllipseLayerDto = Extract<LayerDto, { type: typeof LAYER_TYPE.ellipse }>;
export type RectangleLayerDto = Extract<LayerDto, { type: typeof LAYER_TYPE.rectangle }>;
export type LineLayerDto = Extract<LayerDto, { type: typeof LAYER_TYPE.line }>;
export type IconLayerDto = Extract<LayerDto, { type: typeof LAYER_TYPE.icon }>;
export type PlanarShapeLayerDto = EllipseLayerDto | RectangleLayerDto;
export type PlanarGeometryLayerDto = PlanarShapeLayerDto | IconLayerDto;
export type FontReferenceDto = z.infer<typeof FontReferenceSchema>;
export type TextStyleDto = z.infer<typeof TextStyleSchema>;
export type CanvasDto = z.infer<typeof CanvasSchema>;
export type SnappingDto = z.infer<typeof SnappingSchema>;
export type ProjectSettingsDto = z.infer<typeof ProjectSettingsSchema>;
export type ProjectDto = z.infer<typeof ProjectSchema>;

/** A Range may overhang a nearby canvas edge, but its radius stays bounded. */
export function getRangeRadiusMaximum(canvas: CanvasDto): number {
  return Math.max(canvas.widthMm, canvas.heightMm) / 2;
}
