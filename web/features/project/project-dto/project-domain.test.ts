import { describe, expect, it } from "vitest";
import { createProject, createRange } from "@/features/project/factories/project-factories";
import { fromDomainProject, toDomainProject } from "./project-domain";

describe("project domain conversion", () => {
  it("converts DTOs to Range instances and serializes them back without UI state", () => {
    const project = createProject({ ranges: [createRange({ name: "Engine" })] });
    const domain = toDomainProject(project);

    expect(domain.ranges[0].name).toBe("Engine");
    expect(fromDomainProject(domain)).toEqual(project);
  });
});
