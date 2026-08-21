import {
  LAYER_TYPE,
  PROJECT_FORMAT,
  PROJECT_VERSION,
} from "@/features/project/project-dto/project-dto";
import { CORNER_RADIUS_PERCENT } from "@/features/ranges/path-geometry/corner-radius-percent";
import { getRangeScaleValueBounds } from "@/features/ranges/scale-mapping/scale-mapping";
import {
  createPointLabelLayout,
  createTextArcLabelLayout,
} from "@/features/layers/label/label-layout-factories";
import type {
  CanvasDto,
  LayerDto,
  ProjectDto,
  RangeDto,
  TickScaleLayerDto,
  NumericScaleLayerDto,
  LabelLayerDto,
  ArcLayerDto,
  NeedleLayerDto,
  TextStyleDto,
} from "@/features/project/project-dto/project-dto";

const DEFAULT_TIMESTAMP = "2026-01-01T00:00:00.000Z";

export function createTextStyle(overrides: Partial<TextStyleDto> = {}): TextStyleDto {
  return {
    font: { source: "system", family: "Arial" },
    sizeMm: 3,
    color: "#20242B",
    bold: false,
    italic: false,
    underline: false,
    ...overrides,
  };
}

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
    textStyle: createTextStyle(),
    rotated: false,
    ...overrides,
  };
}

export function createLabelLayer(
  rangeId: string,
  overrides: Partial<LabelLayerDto> = {},
): LabelLayerDto {
  return {
    id: crypto.randomUUID(),
    name: "Label",
    visible: true,
    rangeId,
    type: LAYER_TYPE.label,
    text: "Label",
    layout: createPointLabelLayout(),
    textStyle: createTextStyle({ sizeMm: 5, bold: true }),
    ...overrides,
  };
}

export function createArcLayer(rangeId: string, overrides: Partial<ArcLayerDto> = {}): ArcLayerDto {
  return {
    id: crypto.randomUUID(),
    name: "Arc",
    visible: true,
    rangeId,
    type: LAYER_TYPE.arc,
    valueStart: 0,
    valueEnd: 100,
    radiusOffsetMm: 0,
    strokeWidthMm: 2,
    roundedEnds: false,
    color: "#2E7D32",
    ...overrides,
  };
}

export function createNeedleLayer(
  range: RangeDto,
  overrides: Partial<NeedleLayerDto> = {},
): NeedleLayerDto {
  return {
    id: crypto.randomUUID(),
    name: "Needle",
    visible: true,
    rangeId: range.id,
    type: LAYER_TYPE.needle,
    value: getRangeScaleValueBounds(range).min,
    shaft: {
      lengthMm: 40,
      tailLengthMm: 6,
      widthMm: 2,
      tipStyle: "tapered-rounded",
      color: "#C62828",
      tailColor: "#20242B",
    },
    hub: {
      visible: true,
      radiusMm: 3,
      color: "#20242B",
      placement: "front",
    },
    ...overrides,
  };
}

type LayerFactoryOverrides = Partial<Pick<LayerDto, "id" | "name" | "visible">>;

export function createLayerFromType(
  type: LayerDto["type"],
  range: RangeDto,
  overrides: LayerFactoryOverrides = {},
): LayerDto {
  switch (type) {
    case LAYER_TYPE.tickScale:
      return createTickScaleLayer(range.id, overrides);
    case LAYER_TYPE.numericScale:
      return createNumericScaleLayer(range.id, overrides);
    case LAYER_TYPE.label:
      return createLabelLayer(range.id, overrides);
    case LAYER_TYPE.arc:
      return createArcLayer(range.id, overrides);
    case LAYER_TYPE.needle:
      return createNeedleLayer(range, overrides);
    default:
      return assertNever(type);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unsupported layer type: ${value}`);
}

/** Restores layer-owned visual settings while keeping its project identity and source Range. */
export function resetLayerToDefaults(layer: LayerDto, range: RangeDto): LayerDto {
  return createLayerFromType(layer.type, range, {
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
      createArcLayer(range.id, {
        name: "Warning arc",
        valueStart: 70,
        valueEnd: 100,
        radiusOffsetMm: 3,
        strokeWidthMm: 3,
        roundedEnds: false,
        color: "#C62828",
      }),
      createNeedleLayer(range, {
        name: "Pressure needle",
        value: 70,
        shaft: {
          lengthMm: 35,
          tailLengthMm: 6,
          widthMm: 2,
          tipStyle: "tapered-rounded",
          color: "#C62828",
          tailColor: "#3F3F3F",
        },
        hub: {
          visible: true,
          radiusMm: 3,
          color: "#3F3F3F",
          placement: "front",
        },
      }),
      createLabelLayer(range.id, {
        name: "Unit label",
        text: "bar",
        layout: createPointLabelLayout({ offsetYMm: 16 }),
        textStyle: createTextStyle({ sizeMm: 5, bold: true, color: "#3F3F3F" }),
      }),
      createLabelLayer(range.id, {
        name: "Arc caption",
        text: "PRESSURE",
        layout: createTextArcLabelLayout(range, {
          radiusOffsetMm: -20,
          valueStart: 20,
          valueEnd: 80,
        }),
        textStyle: createTextStyle({ sizeMm: 3, color: "#3F3F3F" }),
      }),
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
        textStyle: createTextStyle({ sizeMm: 4.5, bold: true, color: "#3F3F3F" }),
      }),
    ],
  });
}
