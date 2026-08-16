import { PROJECT_FORMAT, PROJECT_VERSION } from "@/features/project/project-dto/project-dto";
import type { LayerDto, ProjectDto, RangeDto } from "@/features/project/project-dto/project-dto";

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

export function createTickScaleLayer(rangeId: string, overrides: Partial<LayerDto> = {}): LayerDto {
  return {
    id: crypto.randomUUID(),
    name: "Tick scale",
    visible: true,
    rangeId,
    type: "tick-scale",
    ...overrides,
  };
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
  const range = createRange({ name: "Development range" });
  return createProject({
    ranges: [range],
    layers: [
      createTickScaleLayer(range.id, { name: "Tick Scale 1" }),
      createTickScaleLayer(range.id, { name: "Tick Scale 2" }),
      createTickScaleLayer(range.id, { name: "Tick Scale 3" }),
    ],
  });
}
