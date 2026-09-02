import { describe, expect, it } from "vitest";
import { createProject, createRange } from "@/features/project/factories/project-factories";
import { createProjectFingerprint } from "./project-fingerprint";

describe("createProjectFingerprint", () => {
  it("is stable across extension key order and changes with persisted project data", () => {
    const project = createProject({ extensions: { zebra: 1, alpha: { two: 2, one: 1 } } });
    const reordered = createProject({
      ...project,
      extensions: { alpha: { one: 1, two: 2 }, zebra: 1 },
    });

    expect(createProjectFingerprint(project)).toBe(createProjectFingerprint(reordered));
    expect(createProjectFingerprint({ ...project, ranges: [createRange()] })).not.toBe(
      createProjectFingerprint(project),
    );
    expect(createProjectFingerprint(project)).toMatch(/^sha256:[0-9a-f]{64}$/);
  });
});
