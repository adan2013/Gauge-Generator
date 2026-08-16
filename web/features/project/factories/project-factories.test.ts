import { describe, expect, it } from "vitest";
import { createDevelopmentProject } from "./project-factories";

describe("createDevelopmentProject", () => {
  it("provides an Apple Clock workbench with one Range and two Tick Scale layers", () => {
    const project = createDevelopmentProject();

    expect(project.ranges).toHaveLength(1);
    expect(project.layers).toHaveLength(2);
    expect(
      project.layers.every(
        (layer) => layer.type === "tick-scale" && layer.rangeId === project.ranges[0].id,
      ),
    ).toBe(true);
    expect(project.ranges[0]).toMatchObject({ angleStart: 0, openingAngle: 360, radius: 48 });
    expect(project.layers.map((layer) => layer.name)).toEqual([
      "Minute markers",
      "Inner hour markers",
    ]);
  });
});
