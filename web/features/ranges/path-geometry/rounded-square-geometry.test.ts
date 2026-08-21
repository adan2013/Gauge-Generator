import { describe, expect, it } from "vitest";
import {
  pointOnRoundedSquare,
  roundedSquarePathData,
  roundedSquareRadiusAtPoint,
} from "./rounded-square-geometry";

describe("rounded-square geometry", () => {
  it("projects positions onto a circle at 50% and a square at 0% corner radius", () => {
    expect(pointOnRoundedSquare(60, 60, 40, 45, 50).point).toEqual({
      x: expect.closeTo(88.284, 3),
      y: expect.closeTo(88.284, 3),
    });
    expect(pointOnRoundedSquare(60, 60, 40, 45, 0).point).toEqual({ x: 100, y: 100 });
  });

  it("recovers the source radius from points on every supported path shape", () => {
    for (const cornerRadiusPercent of [0, 20, 50]) {
      const point = pointOnRoundedSquare(60, 60, 40, 45, cornerRadiusPercent).point;
      expect(roundedSquareRadiusAtPoint(60, 60, point, cornerRadiusPercent)).toBeCloseTo(40);
    }
  });

  it("generates the shared rounded path used by Range and visual-layer overlays", () => {
    const path = roundedSquarePathData({
      angleStart: 0,
      centerX: 60,
      centerY: 60,
      cornerRadiusPercent: 0,
      openingAngle: 90,
      radius: 40,
    });

    expect(path).toMatch(/^M 100 60 /);
    expect(path).toContain("L 100 100");
    expect(path).toMatch(/L 60 100$/);
  });

  it("uses true SVG arcs instead of sampled line segments for rounded corners", () => {
    const path = roundedSquarePathData({
      angleStart: 0,
      centerX: 60,
      centerY: 60,
      cornerRadiusPercent: 25,
      openingAngle: 90,
      radius: 40,
    });

    expect(path).toMatch(/^M 100 60 L /);
    expect(path).toContain("A 20 20 0 0 1");
    expect(path.match(/ A /g)).toHaveLength(1);
    expect(path).toMatch(/ L 60 100$/);
  });

  it("uses the reverse SVG sweep for counter-clockwise paths", () => {
    const path = roundedSquarePathData({
      angleStart: 90,
      centerX: 60,
      centerY: 60,
      cornerRadiusPercent: 25,
      openingAngle: -90,
      radius: 40,
    });

    expect(path).toContain("A 20 20 0 0 0");
    expect(path).toMatch(/L 100 60$/);
  });
});
