export const ARC_LIMITS = {
  minimumValueSpan: 1,
  strokeWidthMm: { max: 50, min: 0.1 },
} as const;

export function getArcStrokeWidthMaximum(effectiveRadiusMm: number): number {
  return Math.min(ARC_LIMITS.strokeWidthMm.max, effectiveRadiusMm * 2);
}
