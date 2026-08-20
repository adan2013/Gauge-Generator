import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EditingOverlayGeometry } from "./editing-overlay-geometry";

describe("EditingOverlayGeometry", () => {
  it("compensates strokes and dash lengths for the preview display scale", () => {
    render(
      <svg>
        <EditingOverlayGeometry
          displayScale={0.25}
          primitives={[
            {
              d: "M 0 0 L 10 10",
              dasharray: "2 4",
              id: "scaled-overlay",
              kind: "path",
              strokeWidth: 0.8,
              tone: "accent",
            },
          ]}
        />
      </svg>,
    );

    expect(screen.getByTestId("scaled-overlay").getAttribute("stroke-width")).toBe("0.2");
    expect(screen.getByTestId("scaled-overlay").getAttribute("stroke-dasharray")).toBe("0.5 1");
  });
});
