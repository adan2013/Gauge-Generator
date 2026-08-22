export const LINE_LIMITS = {
  offsetMm: { min: -2_000, max: 2_000, step: 0.1 },
  lengthMm: { min: 0.1, max: 2_000 },
  rotationDegrees: { min: 0, max: 359 },
  strokeWidthMm: { min: 0.1, max: 500 },
} as const;
