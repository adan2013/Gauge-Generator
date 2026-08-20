import { describe, expect, it } from "vitest";
import {
  addCustomScalePointAtLargestGap,
  editCustomScalePoint,
  getCustomScalePointBounds,
  moveCustomScalePoint,
  removeCustomScalePoint,
  snapCustomScalePoint,
} from "./custom-scale-points";

const points = [
  { value: 0, position: 0 },
  { value: 50, position: 0.5 },
  { value: 100, position: 1 },
];

describe("custom scale points", () => {
  it("adds a point inside the largest value gap", () => {
    expect(addCustomScalePointAtLargestGap(points)).toEqual([
      { value: 0, position: 0 },
      { value: 25, position: 0.25 },
      { value: 50, position: 0.5 },
      { value: 100, position: 1 },
    ]);
  });

  it("keeps a dragged point strictly between both neighbours on both axes", () => {
    const moved = moveCustomScalePoint(points, 1, { value: 500, position: -1 });

    expect(moved[1].value).toBeGreaterThan(0);
    expect(moved[1].value).toBeLessThan(100);
    expect(moved[1].position).toBeGreaterThan(0);
    expect(moved[1].position).toBeLessThan(1);
  });

  it("does not move or remove locked endpoints", () => {
    expect(moveCustomScalePoint(points, 0, { value: 20, position: 0.2 })).toEqual(points);
    expect(removeCustomScalePoint(points, points.length - 1)).toEqual(points);
  });

  it("removes an interior point", () => {
    expect(removeCustomScalePoint(points, 1)).toEqual([
      { value: 0, position: 0 },
      { value: 100, position: 1 },
    ]);
  });

  it("edits endpoint values while keeping their normalized positions locked", () => {
    const firstChanged = editCustomScalePoint(points, 0, { value: -25, position: 0.2 });
    const lastChanged = editCustomScalePoint(firstChanged, 2, { value: 125, position: 0.8 });

    expect(lastChanged[0]).toEqual({ value: -25, position: 0 });
    expect(lastChanged[2]).toEqual({ value: 125, position: 1 });
  });

  it("declares integer value bounds at least one unit away from neighbouring points", () => {
    expect(getCustomScalePointBounds(points, 0).value.max).toBe(49);
    expect(getCustomScalePointBounds(points, 1).value).toEqual({ min: 1, max: 99 });
    expect(getCustomScalePointBounds(points, 2).value.min).toBe(51);
  });

  it("snaps values to the project increment and positions to 0.05", () => {
    expect(
      snapCustomScalePoint({ value: 66.7, position: 0.683 }, { enabled: true, valueStep: 2 }),
    ).toEqual({ value: 66, position: 0.7 });
  });
});
