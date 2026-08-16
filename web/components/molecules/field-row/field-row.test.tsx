import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FieldRow } from "./field-row";

describe("FieldRow", () => {
  it("associates its label with a composed control and displays the unit", () => {
    render(
      <FieldRow htmlFor="radius" label="Radius" unit="mm">
        <input id="radius" type="number" />
      </FieldRow>,
    );

    expect(screen.getByLabelText(/Radius/)).toBeTruthy();
    expect(screen.getByText("(mm)")).toBeTruthy();
  });

  it("renders optional supporting copy and an accessible error", () => {
    render(
      <FieldRow
        description="Measured from the center."
        error="Must be greater than zero."
        label="Radius"
      >
        <input aria-label="Radius" />
      </FieldRow>,
    );

    expect(screen.getByText("Measured from the center.")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe("Must be greater than zero.");
  });
});
