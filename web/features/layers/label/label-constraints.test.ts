import { describe, expect, it } from "vitest";
import {
  createLabelLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import { constrainLabelToRange, getLabelLayoutValidationIssues } from "./label-constraints";

describe("Label Range constraints", () => {
  const canvas = createProject().canvas;
  const range = createRange({ centerX: 30, centerY: 80, radius: 20 });

  it("constrains a point label center to the canvas edges", () => {
    const layer = createLabelLayer(range.id, {
      layout: { mode: "point", offsetXMm: -40, offsetYMm: 50, rotationDegrees: 0 },
    });

    expect(constrainLabelToRange(layer, range, canvas).layout).toEqual({
      mode: "point",
      offsetXMm: -30,
      offsetYMm: canvas.heightMm - 80,
      rotationDegrees: 0,
    });
  });

  it("validates and constrains a text path against Range radius and values", () => {
    const layer = createLabelLayer(range.id, {
      layout: {
        mode: "text-arc",
        radiusOffsetMm: -20,
        valueStart: -10,
        valueEnd: 110,
        alignment: "center",
        direction: "forward",
      },
    });

    expect(getLabelLayoutValidationIssues(layer, canvas, range)).toEqual([
      {
        path: "layout.radiusOffsetMm",
        code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
      },
      {
        path: "layout.valueStart",
        code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
      },
    ]);
    expect(constrainLabelToRange(layer, range, canvas).layout).toMatchObject({
      radiusOffsetMm: -19.5,
      valueStart: 0,
      valueEnd: 100,
    });
  });

  it("rejects a text path without a value span", () => {
    const layer = createLabelLayer(range.id, {
      layout: {
        mode: "text-arc",
        radiusOffsetMm: 0,
        valueStart: 50,
        valueEnd: 50,
        alignment: "center",
        direction: "forward",
      },
    });

    expect(getLabelLayoutValidationIssues(layer, canvas, range)).toContainEqual({
      path: "layout.valueStart",
      code: PROJECT_VALIDATION_CODES.valueRangeMustHaveSpan,
    });
  });
});
