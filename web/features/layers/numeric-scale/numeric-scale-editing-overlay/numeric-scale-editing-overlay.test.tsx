import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import {
  createNumericScaleLayer,
  createProject,
  createRange,
} from "@/features/project/factories/project-factories";
import messages from "@/messages/en.json";
import { NumericScaleEditingOverlay } from "./numeric-scale-editing-overlay";

describe("NumericScaleEditingOverlay", () => {
  it("renders its path guide and reusable radius-offset handle", () => {
    const range = createRange();
    const layer = createNumericScaleLayer(range.id, { radiusOffsetMm: 4 });
    const project = createProject({ ranges: [range], layers: [layer] });

    const { container } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <svg viewBox="0 0 120 120">
          <NumericScaleEditingOverlay
            canvas={project.canvas}
            displayScale={1}
            layer={layer}
            onInteractionEnd={vi.fn()}
            onInteractionStart={vi.fn()}
            onLayerChange={vi.fn()}
            project={project}
            snapping={{ enabled: true, distanceMm: 2, angleDegrees: 10 }}
          />
        </svg>
      </NextIntlClientProvider>,
    );

    expect(screen.getByTestId("numeric-scale-editing-overlay")).toBeTruthy();
    expect(screen.getByLabelText("Adjust label radius")).toBeTruthy();
    expect(screen.getByText("4 mm")).toBeTruthy();
    expect(container.querySelector("path")?.getAttribute("d")).toContain("M ");
  });
});
