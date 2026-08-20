import {
  LAYER_TYPE,
  PROJECT_FORMAT,
  PROJECT_VERSION,
} from "@/features/project/project-dto/project-dto";
import { CORNER_RADIUS_PERCENT } from "@/features/ranges/path-geometry/corner-radius-percent";
import type {
  CanvasDto,
  LayerDto,
  ProjectDto,
  RangeDto,
  TickScaleLayerDto,
  NumericScaleLayerDto,
} from "@/features/project/project-dto/project-dto";

const DEFAULT_TIMESTAMP = "2026-01-01T00:00:00.000Z";

export function createRange(overrides: Partial<RangeDto> = {}): RangeDto {
  return {
    id: crypto.randomUUID(),
    name: "Range",
    centerX: 60,
    centerY: 60,
    radius: 48,
    cornerRadiusPercent: CORNER_RADIUS_PERCENT.defaultValue,
    angleStart: 140,
    openingAngle: 260,
    valueDirection: "ascending",
    scaleDefinition: { mode: "linear", start: 0, end: 100 },
    ...overrides,
  };
}

/** Creates a centered Range whose initial geometry is valid for the active canvas. */
export function createRangeForCanvas(
  canvas: CanvasDto,
  overrides: Partial<RangeDto> = {},
): RangeDto {
  return createRange({
    centerX: canvas.widthMm / 2,
    centerY: canvas.heightMm / 2,
    radius: Math.max(5, Math.min(canvas.widthMm, canvas.heightMm) * 0.4),
    ...overrides,
  });
}

export function createTickScaleLayer(
  rangeId: string,
  overrides: Partial<TickScaleLayerDto> = {},
): TickScaleLayerDto {
  return {
    id: crypto.randomUUID(),
    name: "Tick scale",
    visible: true,
    rangeId,
    type: LAYER_TYPE.tickScale,
    valueStart: 0,
    valueEnd: 100,
    valueStep: 10,
    tickLengthMm: 4,
    tickWidthMm: 0.6,
    radiusOffsetMm: 0,
    color: "#20242B",
    ...overrides,
  };
}

export function createNumericScaleLayer(
  rangeId: string,
  overrides: Partial<NumericScaleLayerDto> = {},
): NumericScaleLayerDto {
  return {
    id: crypto.randomUUID(),
    name: "Numeric scale",
    visible: true,
    rangeId,
    type: LAYER_TYPE.numericScale,
    valueStart: 0,
    valueEnd: 100,
    valueStep: 10,
    scaleMultiplier: 1,
    decimalPlaces: 0,
    radiusOffsetMm: -8,
    fontSizeMm: 3,
    fontFamily: "Arial",
    bold: false,
    italic: false,
    underline: false,
    rotated: false,
    color: "#20242B",
    ...overrides,
  };
}

type LayerFactoryOverrides = Partial<Pick<LayerDto, "id" | "name" | "visible">>;

export function createLayerFromType(
  type: LayerDto["type"],
  rangeId: string,
  overrides: LayerFactoryOverrides = {},
): LayerDto {
  switch (type) {
    case LAYER_TYPE.tickScale:
      return createTickScaleLayer(rangeId, overrides);
    case LAYER_TYPE.numericScale:
      return createNumericScaleLayer(rangeId, overrides);
    default:
      return assertNever(type);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unsupported layer type: ${value}`);
}

/** Restores layer-owned visual settings while keeping its project identity and source Range. */
export function resetLayerToDefaults(layer: LayerDto): LayerDto {
  return createLayerFromType(layer.type, layer.rangeId, {
    id: layer.id,
    name: layer.name,
    visible: layer.visible,
  });
}

export function createProject(overrides: Partial<ProjectDto> = {}): ProjectDto {
  return {
    format: PROJECT_FORMAT,
    version: PROJECT_VERSION,
    meta: { title: "Untitled project", createdAt: DEFAULT_TIMESTAMP, updatedAt: DEFAULT_TIMESTAMP },
    canvas: { widthMm: 120, heightMm: 120, background: "#FFFFFF", transparentBackground: true },
    layers: [],
    ranges: [],
    ...overrides,
  };
}

/** A predictable populated document for manual development of visual layers. */
export function createDevelopmentProject(): ProjectDto {
  const range = createRange({
    name: "Pressure range (bar)",
    angleStart: 135,
    openingAngle: 270,
    radius: 46,
    cornerRadiusPercent: 30,
    scaleDefinition: {
      mode: "logarithmic",
      start: 10,
      end: 100,
      detailEmphasis: "high-values",
    },
  });
  return createProject({
    meta: {
      title: "Logarithmic pressure gauge",
      createdAt: DEFAULT_TIMESTAMP,
      updatedAt: DEFAULT_TIMESTAMP,
    },
    canvas: {
      widthMm: 120,
      heightMm: 120,
      background: "#FFFFFF",
      transparentBackground: false,
    },
    ranges: [range],
    layers: [
      createTickScaleLayer(range.id, {
        name: "Major pressure ticks",
        radiusOffsetMm: 0,
        valueStart: 10,
        valueEnd: 100,
        valueStep: 10,
        tickLengthMm: 7,
        tickWidthMm: 1.2,
        color: "#3F3F3F",
      }),
      createTickScaleLayer(range.id, {
        name: "Minor pressure ticks",
        radiusOffsetMm: 0,
        valueStart: 10,
        valueEnd: 100,
        valueStep: 2,
        tickLengthMm: 3,
        tickWidthMm: 0.5,
        color: "#C4C4C4",
      }),
      createNumericScaleLayer(range.id, {
        name: "Pressure values (bar)",
        valueStart: 10,
        valueEnd: 100,
        valueStep: 10,
        scaleMultiplier: 0.1,
        radiusOffsetMm: -11,
        fontSizeMm: 4.5,
        bold: true,
        color: "#3F3F3F",
      }),
    ],
  });
}
