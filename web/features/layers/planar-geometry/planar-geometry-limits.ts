export const PLANAR_GEOMETRY_LIMITS = {
  offsetMm: { min: -2_000, max: 2_000 },
  dimensionMm: { min: 0.1, max: 2_000 },
  rotationDegrees: { min: 0, max: 359 },
} as const;
