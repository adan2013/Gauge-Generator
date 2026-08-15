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
    angleStart: 0,
    openingAngle: 240,
    handOffsetX: 0,
    handOffsetY: 0,
    handPivotSize: 2,
    handPivotColor: "#20242B",
    scaleDefinition: { mode: "linear", start: 0, end: 100, step: 10 },
    ...overrides,
  };
}

export function createTickScaleLayer(rangeId: string, overrides: Partial<LayerDto> = {}): LayerDto {
  return { id: crypto.randomUUID(), name: "Tick scale", visible: true, rangeId, type: "tick-scale", ...overrides };
}

export function createProject(overrides: Partial<ProjectDto> = {}): ProjectDto {
  return {
    format: PROJECT_FORMAT,
    version: PROJECT_VERSION,
    meta: { title: "Untitled project", createdAt: DEFAULT_TIMESTAMP, updatedAt: DEFAULT_TIMESTAMP },
    canvas: { widthMm: 120, heightMm: 120, background: "#FFFFFF" },
    layers: [],
    ranges: [],
    ...overrides,
  };
}
