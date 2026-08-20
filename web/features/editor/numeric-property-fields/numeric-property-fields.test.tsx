import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { NumericPropertyDefinition } from "@/features/layers/core/layer";
import { renderEditor } from "@/test/render-editor";
import { NumericPropertyFields, resolveNumericPropertyValue } from "./numeric-property-fields";

const snapping = { angleDegrees: 10, distanceMm: 2, enabled: true };
const definition: NumericPropertyDefinition = {
  key: "value",
  max: 10,
  min: 0,
  snap: "distance",
  step: 0.1,
  value: 4,
};

describe("resolveNumericPropertyValue", () => {
  it("applies integer rounding, the selected snapping increment, and bounds centrally", () => {
    expect(resolveNumericPropertyValue(definition, "5.1", snapping)).toBe(6);
    expect(resolveNumericPropertyValue({ ...definition, snap: "angle" }, "14", snapping)).toBe(10);
    expect(
      resolveNumericPropertyValue(
        { ...definition, integerOnly: true, snap: "none" },
        "3.6",
        snapping,
      ),
    ).toBe(4);
    expect(resolveNumericPropertyValue(definition, "20", snapping)).toBe(10);
  });

  it("preserves unsnapped fields and fields edited while snapping is disabled", () => {
    expect(resolveNumericPropertyValue({ ...definition, snap: "none" }, "5.1", snapping)).toBe(5.1);
    expect(resolveNumericPropertyValue(definition, "5.1", { ...snapping, enabled: false })).toBe(
      5.1,
    );
  });
});

describe("NumericPropertyFields", () => {
  it("renders one group and commits its resolved values through the shared path", () => {
    const onValueChange = vi.fn();
    const definitions = [
      { ...definition, group: "geometry", label: "Radius" },
      { ...definition, key: "hidden", group: "other", label: "Hidden" },
    ];
    renderEditor(
      <NumericPropertyFields
        definitions={definitions}
        getLabel={(item) => item.label}
        getSuffix={() => "mm"}
        group="geometry"
        onInteractionEnd={vi.fn()}
        onInteractionStart={vi.fn()}
        onValueChange={onValueChange}
        snapping={snapping}
      />,
    );

    expect(screen.queryByRole("spinbutton", { name: "Hidden" })).toBeNull();
    const input = screen.getByRole("spinbutton", { name: "Radius" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "5.1" } });
    fireEvent.blur(input);

    expect(onValueChange).toHaveBeenCalledWith("value", 6);
  });
});
