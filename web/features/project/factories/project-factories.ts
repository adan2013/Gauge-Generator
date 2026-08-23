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
  EllipseLayerDto,
  RectangleLayerDto,
  LineLayerDto,
  IconLayerDto,
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

const DEFAULT_SHAPE_STYLE = {
  fillColor: "#BBDEFB",
  borderColor: "#1565C0",
  borderWidthMm: 0,
} as const;

function createPlanarGeometry(canvas: CanvasDto) {
  return {
    offsetXMm: 0,
    offsetYMm: 0,
    widthMm: canvas.widthMm / 2,
    heightMm: canvas.heightMm / 2,
    rotationDegrees: 0,
  };
}

export function createEllipseLayer(
  rangeId: string,
  canvas: CanvasDto,
  overrides: Partial<EllipseLayerDto> = {},
): EllipseLayerDto {
  return {
    id: crypto.randomUUID(),
    name: "Ellipse",
    visible: true,
    rangeId,
    type: LAYER_TYPE.ellipse,
    geometry: createPlanarGeometry(canvas),
    style: { ...DEFAULT_SHAPE_STYLE },
    ...overrides,
  };
}

export function createRectangleLayer(
  rangeId: string,
  canvas: CanvasDto,
  overrides: Partial<RectangleLayerDto> = {},
): RectangleLayerDto {
  return {
    id: crypto.randomUUID(),
    name: "Rectangle",
    visible: true,
    rangeId,
    type: LAYER_TYPE.rectangle,
    geometry: createPlanarGeometry(canvas),
    style: { ...DEFAULT_SHAPE_STYLE },
    cornerRadiusPercent: 0,
    ...overrides,
  };
}

export function createLineLayer(
  rangeId: string,
  canvas: CanvasDto,
  overrides: Partial<LineLayerDto> = {},
): LineLayerDto {
  return {
    id: crypto.randomUUID(),
    name: "Line",
    visible: true,
    rangeId,
    type: LAYER_TYPE.line,
    geometry: {
      offsetXMm: 0,
      offsetYMm: 0,
      lengthMm: canvas.widthMm / 2,
      rotationDegrees: 0,
    },
    style: {
      color: "#1565C0",
      strokeWidthMm: 2,
      roundedEnds: false,
    },
    ...overrides,
  };
}

export function createIconLayer(
  rangeId: string,
  canvas: CanvasDto,
  overrides: Partial<IconLayerDto> = {},
): IconLayerDto {
  return {
    id: crypto.randomUUID(),
    name: "Icon",
    visible: true,
    rangeId,
    type: LAYER_TYPE.icon,
    icon: { library: "lucide", name: "gauge" },
    geometry: {
      offsetXMm: 0,
      offsetYMm: 0,
      widthMm: Math.min(canvas.widthMm, canvas.heightMm) / 4,
      heightMm: Math.min(canvas.widthMm, canvas.heightMm) / 4,
      rotationDegrees: 0,
    },
    style: { color: "#1565C0", strokeWidthMm: 1 },
    ...overrides,
  };
}

type LayerFactoryOverrides = Partial<Pick<LayerDto, "id" | "name" | "visible">>;

export function createLayerFromType(
  type: LayerDto["type"],
  range: RangeDto,
  canvas: CanvasDto,
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
    case LAYER_TYPE.ellipse:
      return createEllipseLayer(range.id, canvas, overrides);
    case LAYER_TYPE.rectangle:
      return createRectangleLayer(range.id, canvas, overrides);
    case LAYER_TYPE.line:
      return createLineLayer(range.id, canvas, overrides);
    case LAYER_TYPE.icon:
      return createIconLayer(range.id, canvas, overrides);
    default:
      return assertNever(type);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unsupported layer type: ${value}`);
}

/** Restores layer-owned visual settings while keeping its project identity and source Range. */
export function resetLayerToDefaults(
  layer: LayerDto,
  range: RangeDto,
  canvas: CanvasDto,
): LayerDto {
  return createLayerFromType(layer.type, range, canvas, {
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
    settings: { snapping: { enabled: true, distanceMm: 2, angleDegrees: 10 } },
    layers: [],
    ranges: [],
    ...overrides,
  };
}

/** A predictable populated document for manual development of visual layers. */
export function createDevelopmentProject(): ProjectDto {
  const canvas: CanvasDto = {
    widthMm: 120,
    heightMm: 120,
    background: "#FFFFFF",
    transparentBackground: false,
  };
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
    canvas,
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
      createEllipseLayer(range.id, canvas, {
        name: "Unit badge",
        geometry: {
          offsetXMm: 0,
          offsetYMm: 16,
          widthMm: 24,
          heightMm: 12,
          rotationDegrees: 0,
        },
        style: { fillColor: "#E3F2FD", borderColor: "#1565C0", borderWidthMm: 0.8 },
      }),
      createIconLayer(range.id, canvas, {
        name: "Pressure symbol",
        icon: { library: "lucide", name: "gauge" },
        geometry: {
          offsetXMm: 28,
          offsetYMm: 25,
          widthMm: 12,
          heightMm: 12,
          rotationDegrees: 0,
        },
        style: { color: "#1565C0", strokeWidthMm: 1 },
      }),
      createLineLayer(range.id, canvas, {
        name: "Unit divider",
        geometry: {
          offsetXMm: 0,
          offsetYMm: 25,
          lengthMm: 20,
          rotationDegrees: 0,
        },
        style: { color: "#1565C0", strokeWidthMm: 1, roundedEnds: true },
      }),
      createRectangleLayer(range.id, canvas, {
        name: "Gauge plate",
        geometry: {
          offsetXMm: 0,
          offsetYMm: 0,
          widthMm: 116,
          heightMm: 116,
          rotationDegrees: 0,
        },
        style: { fillColor: "#E8F1FA", borderColor: "#1565C0", borderWidthMm: 1.2 },
        cornerRadiusPercent: 5,
      }),
    ],
  });
}
