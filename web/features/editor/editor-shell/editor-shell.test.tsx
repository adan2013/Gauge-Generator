import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import messages from "@/messages/en.json";
import { EditorShell } from "./editor-shell";

function renderEditor() {
  return render(<NextIntlClientProvider locale="en" messages={messages}><EditorShell /></NextIntlClientProvider>);
}

describe("EditorShell", () => {
  it("opens the properties view from the empty Range call to action", () => {
    renderEditor();
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    expect(screen.getByRole("heading", { name: "Range setup" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Back to layers" })).toHaveLength(2);
  });

  it("returns to the separated Layers and Ranges view", () => {
    renderEditor();
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Back to layers" })[0]);
    expect(screen.getByRole("heading", { name: "Visual layers" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Ranges" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Range 1/ })).toBeTruthy();
  });

  it("keeps visual layers separate from Ranges", () => {
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "Layer" }));
    expect(screen.getByText("Create a Range before adding a visual layer.")).toBeTruthy();

    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Back to layers" })[1]);
    fireEvent.click(screen.getByRole("button", { name: "Layer" }));
    expect(screen.getByRole("heading", { name: "Layer setup" })).toBeTruthy();
  });

  it("allows custom names for Ranges and visual layers", () => {
    renderEditor();
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Engine range" } });
    fireEvent.click(screen.getAllByRole("button", { name: "Back to layers" })[1]);
    expect(screen.getByRole("button", { name: /^Engine range/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Layer" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Major ticks" } });
    expect(screen.getByRole<HTMLInputElement>("textbox", { name: "Name" }).value).toBe("Major ticks");
  });

  it("opens project settings from Layers", () => {
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "Projects" }));
    expect(screen.getByRole("heading", { name: "Project settings" })).toBeTruthy();
    expect(screen.getByRole<HTMLInputElement>("spinbutton", { name: "Width" }).value).toBe("120");
  });

  it("keeps a Range slider synchronized with its number input", () => {
    renderEditor();
    fireEvent.click(screen.getAllByRole("button", { name: "Create first Range" })[0]);
    fireEvent.change(screen.getByRole("slider", { name: "Adjust Opening angle" }), { target: { value: "180" } });
    expect(screen.getByRole<HTMLInputElement>("spinbutton", { name: "Opening angle" }).value).toBe("180");
  });
});
