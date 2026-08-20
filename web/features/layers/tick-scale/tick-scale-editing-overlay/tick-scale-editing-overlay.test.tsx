import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import {
  createProject,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import messages from "@/messages/en.json";
import { TickScaleEditingOverlay } from "./tick-scale-editing-overlay";

describe("TickScaleEditingOverlay", () => {
  it("renders the reusable radius-offset handle", () => {
    const range = createRange();
    const layer = createTickScaleLayer(range.id, { radiusOffsetMm: 4 });
    const project = createProject({ ranges: [range], layers: [layer] });

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <svg viewBox="0 0 120 120">
          <TickScaleEditingOverlay
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

    expect(screen.getByTestId("tick-scale-editing-overlay")).toBeTruthy();
    expect(screen.getByLabelText("Adjust tick radius")).toBeTruthy();
    expect(screen.getByText("4 mm")).toBeTruthy();
  });
});
