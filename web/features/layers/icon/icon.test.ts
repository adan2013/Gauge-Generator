import { describe, expect, it } from "vitest";
import {
  createIconLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import { PROJECT_VALIDATION_CODES } from "@/features/project/project-dto/project-validation-codes";
import type { SvgIconDefinition } from "./lucide-icon-resources";
import { getIconGeometry, IconLayer } from "./icon";

describe("IconLayer", () => {
  const range = createRange();
  const project = createProject({ ranges: [range] });
  const layer = createIconLayer(range.id, project.canvas, {
    geometry: {
      offsetXMm: 10,
      offsetYMm: -5,
      widthMm: 24,
      heightMm: 12,
      rotationDegrees: 90,
    },
    style: { color: "#123456", strokeWidthMm: 1.5 },
  });
  const definition: SvgIconDefinition = {
    viewBox: [0, 0, 24, 24],
    nodes: [["path", { d: "M2 2 22 22" }]],
  };
  const context = {
    project,
    rangeById: new Map([[range.id, range]]),
    iconDefinitions: new Map([["gauge", definition]]),
  };

  it("renders normalized icon nodes with physical size, rotation, color, and stroke width", () => {
    const svg = new IconLayer(layer).toSvg(context);

    expect(svg).toContain(
      'transform="translate(70 55) rotate(90) scale(1 0.5) translate(-12 -12)"',
    );
    expect(svg).toContain('color="#123456"');
    expect(svg).toContain('stroke-width="2.121"');
    expect(svg).toContain('<path d="M2 2 22 22" />');
  });

  it("uses the intrinsic viewBox when rendering a non-square resource", () => {
    const rectangularDefinition: SvgIconDefinition = {
      viewBox: [0, 0, 48, 24],
      nodes: [["rect", { height: "20", width: "44", x: "2", y: "2" }]],
    };
    const svg = new IconLayer(layer).toSvg({
      ...context,
      iconDefinitions: new Map([["gauge", rectangularDefinition]]),
    });

    expect(svg).toContain("scale(0.5 0.5) translate(-24 -12)");
  });

  it("derives position, rotation, and size handles from planar icon geometry", () => {
    expect(getIconGeometry(layer, range)).toMatchObject({
      center: { x: 70, y: 55 },
      rotationHandle: { x: 82, y: 55 },
      sizeHandle: { x: 64, y: 67 },
    });
    expect(new IconLayer(layer).getHandles(context).map(({ id }) => id)).toEqual([
      "position",
      "rotation",
      "size",
    ]);
  });

  it("rejects a name outside the Lucide catalog", () => {
    const invalid = { ...layer, icon: { library: "lucide" as const, name: "missing-icon-name" } };

    expect(new IconLayer(invalid).validate(context)).toContainEqual({
      path: "icon.name",
      code: PROJECT_VALIDATION_CODES.invalidSchema,
    });
  });
});
