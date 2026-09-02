export const NEEDLE_LIMITS = {
  lengthMm: { max: 1_000, min: 1 },
  tailLengthMm: { max: 500, min: 0 },
  widthMm: { max: 50, min: 0.1 },
  hubRadiusMm: { max: 50, min: 0.5 },
} as const;
