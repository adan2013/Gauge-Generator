import type { ScaleDefinitionDto } from "@/features/project/project-dto/project-dto";

export type ScaleMode = ScaleDefinitionDto["mode"];

const DEFAULT_SCALE_DEFINITIONS = {
  linear: { mode: "linear", start: 0, end: 100 },
  logarithmic: {
    mode: "logarithmic",
    start: 1,
    end: 100,
    detailEmphasis: "low-values",
  },
  custom: {
    mode: "custom",
    points: [
      { value: 0, position: 0 },
      { value: 100, position: 1 },
    ],
  },
} as const satisfies Record<ScaleMode, ScaleDefinitionDto>;

type ScaleModeTransition = {
  definition: ScaleDefinitionDto;
  requiresConfirmation: boolean;
};

export function createScaleDefinitionForMode(
  current: ScaleDefinitionDto,
  mode: ScaleMode,
): ScaleModeTransition {
  if (current.mode === mode) return { definition: current, requiresConfirmation: false };

  return {
    definition: structuredClone(DEFAULT_SCALE_DEFINITIONS[mode]),
    requiresConfirmation: true,
  };
}
