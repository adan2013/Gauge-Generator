import { describe, expect, it } from "vitest";
import { createProject } from "@/features/project/factories/project-factories";
import { parseProjectJson, serializeProjectJson } from "./project-json";

describe("project JSON", () => {
  it("round-trips a valid project and rejects malformed input", () => {
    const project = createProject();
    expect(parseProjectJson(serializeProjectJson(project))).toEqual({ success: true, project });
    expect(parseProjectJson("{not json}")).toEqual({ success: false });
    expect(parseProjectJson(JSON.stringify({ ...project, format: "unknown" }))).toEqual({
      success: false,
    });
  });
});
