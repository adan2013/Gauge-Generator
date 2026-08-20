import { describe, expect, it } from "vitest";
import {
  createProject,
  createRange,
  createNumericScaleLayer,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import { ProjectSchema } from "./project-dto";
import { validateProject } from "./project-validation";
import { PROJECT_VALIDATION_CODES } from "./project-validation-codes";

describe("ProjectSchema", () => {
  it("round-trips a project with independent Range and visual-layer collections", () => {
    const range = createRange();
    const project = createProject({ ranges: [range], layers: [createTickScaleLayer(range.id)] });
    const result = validateProject(JSON.parse(JSON.stringify(project)));

    expect(result.issues).toEqual([]);
    expect(ProjectSchema.parse(result.data)).toEqual(project);
  });

  it("defaults a missing canvas transparency flag to true for older JSON files", () => {
    const project = createProject();
    const legacyCanvas = {
      widthMm: project.canvas.widthMm,
      heightMm: project.canvas.heightMm,
      background: project.canvas.background,
    };

    expect(
      ProjectSchema.parse({ ...project, canvas: legacyCanvas }).canvas.transparentBackground,
    ).toBe(true);
  });

  it("rejects negative canvas dimensions and blank object names", () => {
    const project = createProject({
      canvas: { widthMm: -1, heightMm: 120, background: "#FFFFFF", transparentBackground: true },
    });
    expect(validateProject(project).issues).not.toEqual([]);
    expect(
      validateProject(createProject({ ranges: [createRange({ name: "   " })] })).issues,
    ).not.toEqual([]);
  });

  it("rejects a project with more than five Ranges", () => {
    const ranges = Array.from({ length: 6 }, (_, index) =>
      createRange({ name: `Range ${index + 1}` }),
    );

    expect(validateProject(createProject({ ranges })).issues[0]?.code).toBe(
      PROJECT_VALIDATION_CODES.invalidSchema,
    );
  });

  it("requires the Range center to be on canvas and keeps radius within the canvas-derived limit", () => {
    expect(
      validateProject(createProject({ ranges: [createRange({ radius: 61 })] })).issues[0]?.code,
    ).toBe(PROJECT_VALIDATION_CODES.rangeRadiusOutsideCanvasLimit);
    expect(
      validateProject(createProject({ ranges: [createRange({ radius: 4 })] })).issues[0]?.code,
    ).toBe(PROJECT_VALIDATION_CODES.invalidSchema);
    expect(
      validateProject(createProject({ ranges: [createRange({ centerX: 121 })] })).issues[0]?.code,
    ).toBe(PROJECT_VALIDATION_CODES.rangeCenterOutsideCanvas);
  });

  it("rejects a visual layer whose source Range is missing", () => {
    const project = createProject({ layers: [createTickScaleLayer(crypto.randomUUID())] });
    expect(validateProject(project).issues[0]?.code).toBe(
      PROJECT_VALIDATION_CODES.missingRangeReference,
    );
  });

  it("keeps the value-mapping mode on Range, not on a visual Tick Scale", () => {
    const range = createRange({
      scaleDefinition: {
        mode: "logarithmic",
        start: 1,
        end: 100,
        detailEmphasis: "low-values",
      },
    });
    const layer = createTickScaleLayer(range.id, { valueStart: 1, valueEnd: 100, valueStep: 10 });
    const project = createProject({ ranges: [range], layers: [layer] });

    expect(validateProject(project).data?.ranges[0].scaleDefinition.mode).toBe("logarithmic");
    const invalidLayerProject: unknown = {
      ...project,
      layers: [{ ...layer, scaleDefinition: range.scaleDefinition }],
    };
    expect(validateProject(invalidLayerProject).issues).not.toEqual([]);
  });

  it("requires custom-scale endpoints to cover normalized positions zero and one", () => {
    const range = createRange({
      scaleDefinition: {
        mode: "custom",
        points: [
          { value: 0, position: 0.1 },
          { value: 100, position: 0.9 },
        ],
      },
    });

    expect(validateProject(createProject({ ranges: [range] })).issues).toEqual([
      {
        path: `ranges.${range.id}.scaleDefinition.points.0.position`,
        code: PROJECT_VALIDATION_CODES.customScaleEndpointsInvalid,
      },
      {
        path: `ranges.${range.id}.scaleDefinition.points.1.position`,
        code: PROJECT_VALIDATION_CODES.customScaleEndpointsInvalid,
      },
    ]);
  });

  it("keeps scale bounds ordered when value direction is descending", () => {
    const range = createRange({
      valueDirection: "descending",
      scaleDefinition: { mode: "linear", start: 100, end: 0 },
    });

    expect(validateProject(createProject({ ranges: [range] })).issues).toContainEqual({
      path: `ranges.${range.id}.scaleDefinition`,
      code: PROJECT_VALIDATION_CODES.scaleBoundsNotAscending,
    });
  });

  it("enforces the scale-value and Numeric Scale multiplier limits used by the editor", () => {
    const range = createRange({
      scaleDefinition: { mode: "linear", start: -1_000_001, end: 100 },
    });
    const validRange = createRange();
    const numericScale = createNumericScaleLayer(validRange.id, { scaleMultiplier: 0.001 });

    expect(validateProject(createProject({ ranges: [range] })).issues[0]?.code).toBe(
      PROJECT_VALIDATION_CODES.invalidSchema,
    );
    expect(
      validateProject(createProject({ ranges: [validRange], layers: [numericScale] })).issues[0]
        ?.code,
    ).toBe(PROJECT_VALIDATION_CODES.invalidSchema);
  });

  it("validates Numeric Scale as an independent visual layer tied to a Range", () => {
    const range = createRange();
    const layer = createNumericScaleLayer(range.id, { fontSizeMm: 4 });

    expect(validateProject(createProject({ ranges: [range], layers: [layer] })).issues).toEqual([]);
    expect(
      validateProject(createProject({ ranges: [range], layers: [{ ...layer, fontSizeMm: 50 }] }))
        .issues,
    ).toContainEqual({
      path: `layers.${layer.id}.fontSizeMm`,
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  });

  it("rejects a Tick Scale whose radius offset would create a non-positive rendered radius", () => {
    const range = createRange({ radius: 20 });
    const layer = createTickScaleLayer(range.id, { radiusOffsetMm: -20 });

    expect(
      validateProject(createProject({ ranges: [range], layers: [layer] })).issues,
    ).toContainEqual({
      path: `layers.${layer.id}.radiusOffsetMm`,
      code: PROJECT_VALIDATION_CODES.valueMustBePositive,
    });
  });

  it("uses each domain object validate method to return JSON paths", () => {
    const range = createRange({ radius: 20 });
    const layer = createTickScaleLayer(range.id, { radiusOffsetMm: -20 });

    expect(
      validateProject(createProject({ ranges: [range], layers: [layer] })).issues,
    ).toContainEqual({
      path: `layers.${layer.id}.radiusOffsetMm`,
      code: PROJECT_VALIDATION_CODES.valueMustBePositive,
    });
  });
});
