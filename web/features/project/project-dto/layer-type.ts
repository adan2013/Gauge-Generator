export const LAYER_TYPE = {
  tickScale: "tick-scale",
  numericScale: "numeric-scale",
  label: "label",
  arc: "arc",
  needle: "needle",
} as const;

export type LayerType = (typeof LAYER_TYPE)[keyof typeof LAYER_TYPE];
