import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createProject } from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { CanvasPreview } from "./canvas-preview";

describe("CanvasPreview", () => {
  it("renders the empty-project welcome state", () => {
    const project = createProject();
    renderEditor(
      <CanvasPreview
        canvas={project.canvas}
        hasRange={false}
        onBrowseExamples={vi.fn()}
        onCreateRange={vi.fn()}
        onRangeChange={vi.fn()}
        onRangeInteractionEnd={vi.fn()}
        onRangeInteractionStart={vi.fn()}
        selectedRange={undefined}
        snapping={{ angleDegrees: 10, distanceMm: 2, enabled: true }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Your canvas is ready" })).toBeTruthy();
  });
});
