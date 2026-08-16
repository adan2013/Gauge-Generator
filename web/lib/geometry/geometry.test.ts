import { describe, expect, it } from "vitest";
import {
  clamp,
  normalizeAngle,
  normalizedPositionToAngle,
  snap,
  snapAngleDegrees,
  snapDistanceMm,
  valueToNormalizedPosition,
} from "./geometry";

describe("geometry helpers", () => {
  it("clamps values at both inclusive bounds", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(11, 0, 10)).toBe(10);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it("snaps positive and negative values symmetrically", () => {
    expect(snap(5.1, 2)).toBe(6);
    expect(snap(-5.1, 2)).toBe(-6);
    expect(snap(5, 2)).toBe(6);
    expect(snap(-5, 2)).toBe(-6);
    expect(snap(4.9, 2.5)).toBe(5);
  });

  it("preserves values when a snap increment or value is not usable", () => {
    expect(snap(12, 0)).toBe(12);
    expect(snap(12, -2)).toBe(12);
    expect(snap(Number.POSITIVE_INFINITY, 2)).toBe(Number.POSITIVE_INFINITY);
    expect(snap(12, Number.NaN)).toBe(12);
    expect(snap(Number.NaN, 2)).toBeNaN();
  });

  it("snaps distance and angle with default and custom increments", () => {
    expect(snapDistanceMm(5.1)).toBe(6);
    expect(snapAngleDegrees(16)).toBe(20);
    expect(snapDistanceMm(4.9, 0.5)).toBe(5);
    expect(snapAngleDegrees(12.5, 5)).toBe(15);
  });

  it("normalizes angles across zero and complete turns", () => {
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(360)).toBe(0);
    expect(normalizeAngle(720)).toBe(0);
    expect(normalizeAngle(-10)).toBe(350);
    expect(normalizeAngle(-720)).toBe(0);
    expect(normalizeAngle(-0.5)).toBeCloseTo(359.5);
  });

  it("maps scale values at bounds, outside bounds, and through reversed scales", () => {
    expect(valueToNormalizedPosition(0, 0, 100)).toBe(0);
    expect(valueToNormalizedPosition(50, 0, 100)).toBe(0.5);
    expect(valueToNormalizedPosition(100, 0, 100)).toBe(1);
    expect(valueToNormalizedPosition(150, 0, 100)).toBe(1.5);
    expect(valueToNormalizedPosition(75, 100, 0)).toBe(0.25);
    expect(() => valueToNormalizedPosition(10, 10, 10)).toThrow("Scale start and end must differ.");
  });

  it("maps normalized positions to angles for positive and negative arcs", () => {
    expect(normalizedPositionToAngle(0, 350, 40)).toBe(350);
    expect(normalizedPositionToAngle(0.5, 350, 40)).toBe(10);
    expect(normalizedPositionToAngle(1, 350, 40)).toBe(30);
    expect(normalizedPositionToAngle(0.5, 20, -80)).toBe(340);
    expect(normalizedPositionToAngle(1, 30, 360)).toBe(30);
  });
});
