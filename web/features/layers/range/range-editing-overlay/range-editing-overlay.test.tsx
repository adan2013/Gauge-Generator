import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import messages from "@/messages/en.json";
import { createRange } from "@/features/project/factories/project-factories";
import { RangeEditingOverlay } from "./range-editing-overlay";

describe("RangeEditingOverlay", () => {
  it("renders handles supplied by the Range domain object", () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <svg viewBox="0 0 120 120">
          <RangeEditingOverlay
            canvas={{
              widthMm: 120,
              heightMm: 120,
              background: "#FFFFFF",
              transparentBackground: true,
            }}
            onInteractionEnd={() => undefined}
            onInteractionStart={() => undefined}
            onRangeChange={() => undefined}
            range={createRange()}
            snapping={{ enabled: true, distanceMm: 2, angleDegrees: 10 }}
          />
        </svg>
      </NextIntlClientProvider>,
    );

    expect(screen.getByTestId("range-editing-overlay")).toBeTruthy();
    expect(screen.getByLabelText("Move center")).toBeTruthy();
    expect(screen.getByLabelText("Adjust radius")).toBeTruthy();
    expect(screen.getByText("60; 60")).toBeTruthy();
    expect(screen.getByText("r: 48 mm")).toBeTruthy();
    expect(screen.getByText("260°")).toBeTruthy();
    expect(screen.getAllByTestId("layer-handle-label-background")).toHaveLength(4);
    expect(screen.getByTestId("range-opening-angle-guide").getAttribute("stroke-dasharray")).toBe(
      screen.getByTestId("range-start-angle-guide").getAttribute("stroke-dasharray"),
    );
    expect(screen.getByTestId("range-radius-guide").getAttribute("stroke-dasharray")).not.toBe(
      screen.getByTestId("range-start-angle-guide").getAttribute("stroke-dasharray"),
    );
  });
});
