import { describe, expect, it } from "vitest";
import { createRange } from "@/features/project/factories/project-factories";
import { Range } from "./range";
import { getRangeNumericPropertyDefinitions } from "./range-properties";

describe("Range property definitions", () => {
  it("uses the default start and opening angles", () => {
    expect(new Range(createRange()).toDto()).toMatchObject({
      angleStart: 140,
      cornerRadiusPercent: 50,
      openingAngle: 260,
    });
  });

  it("derives editable coordinate limits from the current canvas", () => {
    const fields = getRangeNumericPropertyDefinitions(createRange(), {
      widthMm: 240,
      heightMm: 80,
      background: "#FFFFFF",
      transparentBackground: true,
    });

    expect(fields.find((field) => field.key === "centerX")).toMatchObject({
      min: 0,
      max: 240,
      snap: "distance",
    });
    expect(fields.find((field) => field.key === "centerY")).toMatchObject({ min: 0, max: 80 });
    expect(fields.find((field) => field.key === "radius")).toMatchObject({ min: 5, max: 120 });
    expect(fields.find((field) => field.key === "cornerRadiusPercent")).toMatchObject({
      min: 1,
      max: 50,
      snap: "none",
    });
    expect(fields.find((field) => field.key === "openingAngle")).toMatchObject({
      min: -360,
      max: 360,
      snap: "angle",
    });
  });

  it("places its handles on the shared rounded path", () => {
    const model = new Range(
      createRange({
        centerX: 60,
        centerY: 60,
        radius: 20,
        angleStart: 0,
        openingAngle: 90,
        cornerRadiusPercent: 1,
      }),
    );

    expect(model.getHandles().find((handle) => handle.id === "radius")?.point).toEqual({
      x: expect.closeTo(79.883, 3),
      y: expect.closeTo(79.883, 3),
    });
  });

  it("exposes the center, radius, and angle handles", () => {
    const handles = new Range(
      createRange({ centerX: 60, centerY: 60, radius: 20, angleStart: 0, openingAngle: 90 }),
    ).getHandles();

    expect(handles.map((handle) => handle.id)).toEqual([
      "center",
      "radius",
      "angle-start",
      "angle-end",
    ]);
    expect(handles.find((handle) => handle.id === "radius")?.point).toMatchObject({
      x: expect.closeTo(74.142, 3),
      y: expect.closeTo(74.142, 3),
    });
    expect(handles.find((handle) => handle.id === "angle-start")?.point).toEqual({ x: 80, y: 60 });
    expect(handles.find((handle) => handle.id === "angle-end")?.point).toEqual({ x: 60, y: 80 });
  });

  it("keeps a dragged center on the canvas and radius within its canvas-derived limit", () => {
    const range = new Range(createRange({ radius: 20 }));
    const canvas = {
      widthMm: 120,
      heightMm: 120,
      background: "#FFFFFF",
      transparentBackground: true,
    };

    expect(
      range.applyHandleDrag(
        "center",
        { point: { x: 160, y: -20 }, shiftKey: false, altKey: false },
        canvas,
      ),
    ).toMatchObject({ centerX: 120, centerY: 0 });
    expect(
      range.applyHandleDrag(
        "radius",
        { point: { x: 600, y: 60 }, shiftKey: false, altKey: false },
        canvas,
      ).radius,
    ).toBe(60);
  });

  it("updates the signed opening angle from the end handle", () => {
    const clockwise = new Range(createRange({ angleStart: 0, openingAngle: 90 }));
    const counterClockwise = new Range(createRange({ angleStart: 0, openingAngle: -90 }));
    const canvas = {
      widthMm: 120,
      heightMm: 120,
      background: "#FFFFFF",
      transparentBackground: true,
    };

    expect(
      clockwise.applyHandleDrag(
        "angle-end",
        { point: { x: 60, y: 108 }, shiftKey: false, altKey: false },
        canvas,
      ).openingAngle,
    ).toBe(90);
    expect(
      counterClockwise.applyHandleDrag(
        "angle-end",
        { point: { x: 60, y: 108 }, shiftKey: false, altKey: false },
        canvas,
      ).openingAngle,
    ).toBe(-270);
  });

  it("quantizes handle updates to the configured distance and angle increments", () => {
    const range = new Range(createRange({ centerX: 60, centerY: 60 }));
    const canvas = {
      widthMm: 120,
      heightMm: 120,
      background: "#FFFFFF",
      transparentBackground: true,
    };

    expect(
      range.applyHandleDrag(
        "radius",
        {
          point: { x: 97.23, y: 60 },
          shiftKey: false,
          altKey: false,
          snapDistanceMm: 2,
          snapAngleDegrees: 10,
        },
        canvas,
      ).radius,
    ).toBe(38);
    expect(
      range.applyHandleDrag(
        "angle-start",
        {
          point: { x: 100, y: 77 },
          shiftKey: false,
          altKey: false,
          snapDistanceMm: 2,
          snapAngleDegrees: 10,
        },
        canvas,
      ).angleStart,
    ).toBe(20);
  });

  it("keeps its radius when dragging starts on its rounded-path handle", () => {
    const model = new Range(
      createRange({ radius: 20, angleStart: 0, openingAngle: 90, cornerRadiusPercent: 1 }),
    );
    const radiusHandle = model.getHandles().find((handle) => handle.id === "radius")!;
    const canvas = {
      widthMm: 120,
      heightMm: 120,
      background: "#FFFFFF",
      transparentBackground: true,
    };

    expect(
      model.applyHandleDrag(
        "radius",
        { point: radiusHandle.point, shiftKey: false, altKey: false, snapDistanceMm: 1 },
        canvas,
      ).radius,
    ).toBe(20);
  });
});
