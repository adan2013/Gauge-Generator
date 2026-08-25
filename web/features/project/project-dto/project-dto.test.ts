import { describe, expect, it } from "vitest";
import {
  createProject,
  createLabelLayer,
  createRange,
  createNumericScaleLayer,
  createNeedleLayer,
  createEllipseLayer,
  createRectangleLayer,
  createLineLayer,
  createIconLayer,
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

  it("rejects negative canvas dimensions and blank object names", () => {
    const project = createProject({
      canvas: { widthMm: -1, heightMm: 120, background: "#FFFFFF", transparentBackground: true },
    });
    expect(validateProject(project).issues).not.toEqual([]);
    expect(
      validateProject(createProject({ ranges: [createRange({ name: "   " })] })).issues,
    ).not.toEqual([]);
  });

  it("stores snapping in the strict project settings contract", () => {
    const project = createProject({
      settings: { snapping: { enabled: false, distanceMm: 5, angleDegrees: 15 } },
    });
    expect(ProjectSchema.parse(JSON.parse(JSON.stringify(project))).settings.snapping).toEqual({
      enabled: false,
      distanceMm: 5,
      angleDegrees: 15,
    });
    expect(
      ProjectSchema.safeParse({
        ...project,
        settings: { snapping: { enabled: true, distanceMm: 0, angleDegrees: 10 } },
      }).success,
    ).toBe(false);
  });

  it("accepts local font family names without changing the project contract", () => {
    const range = createRange();
    const layer = createLabelLayer(range.id, {
      textStyle: {
        ...createLabelLayer(range.id).textStyle,
        font: { source: "system", family: "Avenir Next" },
      },
    });

    expect(
      ProjectSchema.safeParse(createProject({ ranges: [range], layers: [layer] })).success,
    ).toBe(true);
    expect(
      ProjectSchema.safeParse({
        ...createProject({ ranges: [range], layers: [layer] }),
        layers: [
          { ...layer, textStyle: { ...layer.textStyle, font: { source: "system", family: "" } } },
        ],
      }).success,
    ).toBe(false);
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
    const layer = createNumericScaleLayer(range.id, {
      textStyle: {
        font: { source: "system", family: "Arial" },
        sizeMm: 4,
        color: "#20242B",
        bold: false,
        italic: false,
        underline: false,
      },
    });

    expect(validateProject(createProject({ ranges: [range], layers: [layer] })).issues).toEqual([]);
    expect(
      validateProject(
        createProject({
          ranges: [range],
          layers: [{ ...layer, textStyle: { ...layer.textStyle, sizeMm: 50 } }],
        }),
      ).issues,
    ).toContainEqual({
      path: `layers.${layer.id}.textStyle.sizeMm`,
      code: PROJECT_VALIDATION_CODES.valueOutsideAllowedRange,
    });
  });

  it("validates Label text, point layout, and nested typography", () => {
    const range = createRange();
    const layer = createLabelLayer(range.id);

    expect(validateProject(createProject({ ranges: [range], layers: [layer] })).issues).toEqual([]);
    expect(
      validateProject(
        createProject({ ranges: [range], layers: [{ ...layer, text: "x".repeat(41) }] }),
      ).issues[0]?.code,
    ).toBe(PROJECT_VALIDATION_CODES.invalidSchema);
  });

  it("accepts a Label text path mapped through its source Range", () => {
    const range = createRange();
    const layer = createLabelLayer(range.id, {
      layout: {
        mode: "text-arc",
        radiusOffsetMm: -5,
        valueStart: 0,
        valueEnd: 100,
        alignment: "center",
        direction: "reverse",
      },
    });

    expect(validateProject(createProject({ ranges: [range], layers: [layer] })).issues).toEqual([]);
  });

  it.each(["arrowhead", "tapered-rounded"] as const)(
    "accepts the Needle %s tip style",
    (tipStyle) => {
      const range = createRange();
      const layer = createNeedleLayer(range);

      expect(
        validateProject(
          createProject({
            ranges: [range],
            layers: [{ ...layer, shaft: { ...layer.shaft, tipStyle } }],
          }),
        ).issues,
      ).toEqual([]);
    },
  );

  it("validates Ellipse, Rectangle, Line, and Icon nested geometry and styling", () => {
    const range = createRange();
    const project = createProject({ ranges: [range] });
    const ellipse = createEllipseLayer(range.id, project.canvas);
    const rectangle = createRectangleLayer(range.id, project.canvas, {
      cornerRadiusPercent: 50,
    });
    const line = createLineLayer(range.id, project.canvas);
    const icon = createIconLayer(range.id, project.canvas);

    expect(
      validateProject({ ...project, layers: [ellipse, rectangle, line, icon] }).issues,
    ).toEqual([]);
    expect(
      validateProject({
        ...project,
        layers: [{ ...ellipse, geometry: { ...ellipse.geometry, rotationDegrees: 360 } }],
      }).issues[0]?.code,
    ).toBe(PROJECT_VALIDATION_CODES.invalidSchema);
    expect(
      validateProject({ ...project, layers: [{ ...rectangle, cornerRadiusPercent: 50.1 }] })
        .issues[0]?.code,
    ).toBe(PROJECT_VALIDATION_CODES.invalidSchema);
    expect(
      validateProject({
        ...project,
        layers: [{ ...line, geometry: { ...line.geometry, rotationDegrees: -1 } }],
      }).issues[0]?.code,
    ).toBe(PROJECT_VALIDATION_CODES.invalidSchema);
    expect(
      validateProject({
        ...project,
        layers: [{ ...icon, icon: { library: "lucide", name: "not-a-real-icon" } }],
      }).issues[0],
    ).toMatchObject({ code: PROJECT_VALIDATION_CODES.invalidSchema });
  });

  it("limits point Label rotation to zero through 359 degrees", () => {
    const range = createRange();
    const layer = createLabelLayer(range.id);
    if (layer.layout.mode !== "point") throw new Error("Expected point layout");

    expect(
      validateProject(
        createProject({
          ranges: [range],
          layers: [{ ...layer, layout: { ...layer.layout, rotationDegrees: -1 } }],
        }),
      ).issues[0]?.code,
    ).toBe(PROJECT_VALIDATION_CODES.invalidSchema);
    expect(
      validateProject(
        createProject({
          ranges: [range],
          layers: [{ ...layer, layout: { ...layer.layout, rotationDegrees: 360 } }],
        }),
      ).issues[0]?.code,
    ).toBe(PROJECT_VALIDATION_CODES.invalidSchema);
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
});
