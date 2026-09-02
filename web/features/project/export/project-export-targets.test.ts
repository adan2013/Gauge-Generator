import { describe, expect, it } from "vitest";
import {
  createProject,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import { createProjectExportTargets } from "./project-export-targets";

describe("project export targets", () => {
  it("creates transparent, aligned files only for visible layers", () => {
    const range = createRange();
    const first = createTickScaleLayer(range.id, { name: "Outer scale" });
    const hidden = createTickScaleLayer(range.id, { name: "Hidden", visible: false });
    const second = createTickScaleLayer(range.id, { name: "Needle / foreground" });
    const project = createProject({ layers: [first, hidden, second], ranges: [range] });

    const targets = createProjectExportTargets(project, "layers");

    expect(targets.map((target) => target.filename)).toEqual([
      "01-Outer-scale",
      "02-Needle-foreground",
    ]);
    expect(targets.every((target) => target.transparentBackground)).toBe(true);
    expect(targets[0].layerIds).toEqual(new Set([first.id]));
    expect(targets[1].layerIds).toEqual(new Set([second.id]));
  });
});
