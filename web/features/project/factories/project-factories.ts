import { PROJECT_FORMAT, PROJECT_VERSION } from "@/features/project/project-dto/project-dto";
import type {
  LayerDto,
  ProjectDto,
  RangeDto,
  TickScaleLayerDto,
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
    type: "tick-scale",
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

/** Restores layer-owned visual settings while keeping its project identity and source Range. */
export function resetLayerToDefaults(layer: LayerDto): LayerDto {
  switch (layer.type) {
    case "tick-scale":
      return createTickScaleLayer(layer.rangeId, {
        id: layer.id,
        name: layer.name,
        visible: layer.visible,
      });
  }
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
    angleStart: 0,
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
    ranges: [range],
    layers: [
      createTickScaleLayer(range.id, {
        name: "Minute markers",
        radiusOffsetMm: 0,
        valueStart: 0,
        valueEnd: 60,
        valueStep: 1,
        tickLengthMm: 1.7,
        tickWidthMm: 0.45,
        cornerRadiusPercent: 22,
      }),
      createTickScaleLayer(range.id, {
        name: "Inner hour markers",
        radiusOffsetMm: -8,
        valueStart: 0,
        valueEnd: 60,
        valueStep: 5,
        tickLengthMm: 2.5,
        tickWidthMm: 0.8,
        cornerRadiusPercent: 26,
      }),
    ],
  });
}
