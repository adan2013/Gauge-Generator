import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTextStyle } from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { getTextStyleSizePropertyDefinition } from "../text-style-properties";
import { TextStylePropertiesEditor } from "./text-style-properties-editor";

afterEach(() => vi.unstubAllGlobals());

describe("TextStylePropertiesEditor", () => {
  it("updates the nested font reference and style flags", () => {
    const style = createTextStyle();
    const onChange = vi.fn();
    renderEditor(
      <TextStylePropertiesEditor
        definition={getTextStyleSizePropertyDefinition(style.sizeMm)}
        onChange={onChange}
        onInteractionEnd={vi.fn()}
        onInteractionStart={vi.fn()}
        snapping={{ angleDegrees: 10, distanceMm: 2, enabled: true }}
        style={style}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Font" }), {
      target: { value: "Georgia" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Bold" }));

    expect(onChange).toHaveBeenNthCalledWith(1, {
      ...style,
      font: { source: "system", family: "Georgia" },
    });
    expect(onChange).toHaveBeenNthCalledWith(2, { ...style, bold: true });
  });

  it("loads installed font families and lets the user select one", async () => {
    vi.stubGlobal(
      "queryLocalFonts",
      vi
        .fn()
        .mockResolvedValue([
          { family: "Avenir Next" },
          { family: "Avenir Next" },
          { family: "Verdana" },
        ]),
    );
    const style = createTextStyle();
    const onChange = vi.fn();
    renderEditor(
      <TextStylePropertiesEditor
        definition={getTextStyleSizePropertyDefinition(style.sizeMm)}
        onChange={onChange}
        onInteractionEnd={vi.fn()}
        onInteractionStart={vi.fn()}
        snapping={{ angleDegrees: 10, distanceMm: 2, enabled: true }}
        style={style}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Load local fonts" }));
    expect(await screen.findByRole("option", { name: "Avenir Next" })).toBeTruthy();

    fireEvent.change(screen.getByRole("combobox", { name: "Font" }), {
      target: { value: "Avenir Next" },
    });
    expect(onChange).toHaveBeenCalledWith({
      ...style,
      font: { source: "system", family: "Avenir Next" },
    });
  });
});
