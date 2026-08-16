import {
  LAYER_TYPE,
  PROJECT_FORMAT,
  PROJECT_VERSION,
  type LayerType,
} from "@/features/project/project-dto/project-dto";
import type {
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
    angleStart: 140,
    openingAngle: 260,
    scaleDefinition: { mode: "linear", start: 0, end: 100 },
    ...overrides,
  };
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
    cornerRadiusPercent: 50,
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

const LAYER_FACTORIES = {
  [LAYER_TYPE.tickScale]: (rangeId: string, overrides: Partial<LayerDto>) =>
    createTickScaleLayer(rangeId, overrides as never),
  [LAYER_TYPE.numericScale]: (rangeId: string, overrides: Partial<LayerDto>) =>
    createNumericScaleLayer(rangeId, overrides as never),
} satisfies Record<LayerType, (rangeId: string, overrides: Partial<LayerDto>) => LayerDto>;

export function createLayerFromType(
  type: LayerType,
  rangeId: string,
  overrides: Partial<LayerDto> = {},
): LayerDto {
  return LAYER_FACTORIES[type](rangeId, overrides);
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
    name: "Apple Clock range",
    angleStart: 270,
    openingAngle: 360,
    radius: 48,
    scaleDefinition: { mode: "linear", start: 0, end: 60 },
  });
  return createProject({
    meta: {
      title: "Apple Clock workbench",
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
        name: "Inner hour markers",
        radiusOffsetMm: 0,
        valueStart: 0,
        valueEnd: 60,
        valueStep: 5,
        tickLengthMm: 7,
        tickWidthMm: 1.35,
        cornerRadiusPercent: 30,
        color: "#3F3F3F",
      }),
      createTickScaleLayer(range.id, {
        name: "Minute markers",
        radiusOffsetMm: 0,
        valueStart: 0,
        valueEnd: 60,
        valueStep: 1,
        tickLengthMm: 2.2,
        tickWidthMm: 0.55,
        cornerRadiusPercent: 30,
        color: "#C4C4C4",
      }),
      createNumericScaleLayer(range.id, {
        name: "Cardinal hour labels",
        valueStart: 15,
        valueEnd: 60,
        valueStep: 15,
        scaleMultiplier: 1 / 5,
        radiusOffsetMm: -15,
        fontSizeMm: 16,
        bold: true,
        color: "#3F3F3F",
      }),
    ],
  });
}
