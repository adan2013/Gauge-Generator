import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { TooltipProvider } from "./tooltip-provider";

describe("TooltipProvider", () => {
  it("renders its children", () => {
    renderEditor(
      <TooltipProvider>
        <span>Tooltip-enabled editor</span>
      </TooltipProvider>,
    );

    expect(screen.getByText("Tooltip-enabled editor")).toBeTruthy();
  });
});
