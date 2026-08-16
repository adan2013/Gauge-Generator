import { describe, expect, it } from "vitest";
import { createDevelopmentProject } from "./project-factories";

describe("createDevelopmentProject", () => {
  it("provides one Range and three Tick Scale layers for manual development", () => {
    const project = createDevelopmentProject();

    expect(project.ranges).toHaveLength(1);
    expect(project.layers).toHaveLength(3);
    expect(
      project.layers.every(
        (layer) => layer.type === "tick-scale" && layer.rangeId === project.ranges[0].id,
      ),
    ).toBe(true);
  });
});
