import { describe, expect, it } from "vitest";
import {
  isLucideIconName,
  resolveLucideIconDefinition,
  resolveLucideIconDefinitions,
} from "./lucide-icon-resources";

describe("Lucide icon resources", () => {
  it("loads and normalizes an icon by catalog name", async () => {
    const definition = await resolveLucideIconDefinition("gauge");

    expect(definition).toEqual({
      viewBox: [0, 0, 24, 24],
      nodes: [
        ["path", { d: "m12 14 4-4" }],
        ["path", { d: "M3.34 19a10 10 0 1 1 17.32 0" }],
      ],
    });
    expect(isLucideIconName("gauge")).toBe(true);
    expect(await resolveLucideIconDefinition("not-a-real-lucide-icon")).toBeNull();
  });

  it("resolves only unique valid project resources", async () => {
    const definitions = await resolveLucideIconDefinitions(["gauge", "gauge", "slash"]);

    expect([...definitions.keys()]).toEqual(["gauge", "slash"]);
  });
});
