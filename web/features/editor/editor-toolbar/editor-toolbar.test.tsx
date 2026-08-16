import { screen } from "@testing-library/react";
import { FilePlus2 } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { renderEditor } from "@/test/render-editor";
import { EditorToolbar } from "./editor-toolbar";

describe("EditorToolbar", () => {
  it("renders declared actions", () => {
    renderEditor(
      <EditorToolbar
        actions={[{ icon: FilePlus2, id: "new", label: "New" }]}
        onAction={vi.fn()}
        onOpenHelp={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "New" })).toBeTruthy();
  });
});
