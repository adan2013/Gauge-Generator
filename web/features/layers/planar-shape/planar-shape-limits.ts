export const PLANAR_SHAPE_LIMITS = {
  offsetMm: { min: -2_000, max: 2_000 },
  dimensionMm: { min: 0.1, max: 2_000 },
  rotationDegrees: { min: 0, max: 359 },
  borderWidthMm: { min: 0, max: 500 },
  cornerRadiusPercent: { min: 0, max: 50 },
} as const;
