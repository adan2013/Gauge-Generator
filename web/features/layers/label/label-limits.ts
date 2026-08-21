export const LABEL_LIMITS = {
  pointOffsetMm: { min: -1_000, max: 1_000 },
  radiusOffsetMm: { min: -500, max: 500 },
  rotationDegrees: { min: 0, max: 359 },
  textLength: { max: 40 },
} as const;
