import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { EditorSidebar } from "./editor-sidebar";

describe("EditorSidebar", () => {
  it("positions the active panel in the slider", () => {
    renderEditor(
      <EditorSidebar
        ariaLabel="Editor sidebar"
        layers={<p>Layers</p>}
        mode="properties"
        projectSettings={<p>Settings</p>}
        properties={<p>Properties</p>}
      />,
    );
    expect(
      screen
        .getByLabelText("Editor sidebar")
        .querySelector(":scope > div > div")
        ?.getAttribute("style"),
    ).toContain("translateX(-66.666667%)");
  });
});
