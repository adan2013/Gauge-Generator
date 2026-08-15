export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function snap(value: number, increment: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(increment) || increment <= 0) return value;
  return Math.sign(value) * Math.round(Math.abs(value) / increment) * increment;
}

export function snapDistanceMm(value: number, incrementMm = 2): number {
  return snap(value, incrementMm);
}

export function snapAngleDegrees(value: number, incrementDegrees = 10): number {
  return snap(value, incrementDegrees);
}

export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export function valueToNormalizedPosition(value: number, start: number, end: number): number {
  if (start === end) throw new Error("Scale start and end must differ.");
  return (value - start) / (end - start);
}

export function normalizedPositionToAngle(position: number, angleStart: number, openingAngle: number): number {
  return normalizeAngle(angleStart + openingAngle * position);
}
