import { describe, expect, it } from "vitest";
import { validateProject } from "@/features/project/project-dto/project-validation";
import { EXAMPLE_PROJECTS } from "./example-projects";

describe("example projects", () => {
  it("contains unique, domain-valid static projects", () => {
    expect(new Set(EXAMPLE_PROJECTS.map((example) => example.id)).size).toBe(
      EXAMPLE_PROJECTS.length,
    );
    for (const example of EXAMPLE_PROJECTS) {
      expect(validateProject(example.project).issues).toEqual([]);
      expect(example.project.layers.length).toBeGreaterThanOrEqual(6);
      expect(
        new Set(example.project.layers.map((layer) => layer.type)).size,
      ).toBeGreaterThanOrEqual(4);
    }
  });
});
