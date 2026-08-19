import { describe, expect, it } from "vitest";
import type { ScaleDefinitionDto } from "@/features/project/project-dto/project-dto";
import { createScaleDefinitionForMode } from "./scale-definition";

describe("scale definition mode transitions", () => {
  it("resets each selected mode to its defaults and requires confirmation", () => {
    const custom: ScaleDefinitionDto = {
      mode: "custom",
      points: [
        { value: 25, position: 0 },
        { value: 75, position: 1 },
      ],
    };

    expect(createScaleDefinitionForMode(custom, "linear")).toEqual({
      definition: { mode: "linear", start: 0, end: 100 },
      requiresConfirmation: true,
    });
    expect(createScaleDefinitionForMode(custom, "logarithmic")).toEqual({
      definition: {
        mode: "logarithmic",
        start: 1,
        end: 100,
        detailEmphasis: "low-values",
      },
      requiresConfirmation: true,
    });
    expect(
      createScaleDefinitionForMode(
        {
          mode: "logarithmic",
          start: 10,
          end: 1_000,
          detailEmphasis: "high-values",
        },
        "custom",
      ),
    ).toEqual({
      definition: {
        mode: "custom",
        points: [
          { value: 0, position: 0 },
          { value: 100, position: 1 },
        ],
      },
      requiresConfirmation: true,
    });
  });

  it("keeps the current definition when the selected mode has not changed", () => {
    const current = { mode: "linear", start: 20, end: 80 } as const;

    expect(createScaleDefinitionForMode(current, "linear")).toEqual({
      definition: current,
      requiresConfirmation: false,
    });
  });
});
