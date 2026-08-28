import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  createProject,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import { renderEditor } from "@/test/render-editor";
import { ExportModal } from "./export-modal";

describe("ExportModal", () => {
  it("links to the project support page", () => {
    renderEditor(<ExportModal onCancel={vi.fn()} onExport={vi.fn()} project={createProject()} />);

    const supportLink = screen.getByRole("link", { name: /support the project/i });
    expect(supportLink.getAttribute("href")).toBe("https://buymeacoffee.com/danielalberski");
    expect(supportLink.getAttribute("target")).toBe("_blank");
    expect(supportLink.getAttribute("rel")).toBe("noopener noreferrer");
    expect(screen.getByRole("img", { name: "Buy Me a Coffee" }).getAttribute("src")).toContain(
      "default-yellow.png",
    );
  });

  it("shows PDF format settings with actual size first and selected by default", () => {
    const project = createProject();
    renderEditor(<ExportModal onCancel={vi.fn()} onExport={vi.fn()} project={project} />);

    fireEvent.click(screen.getByRole("radio", { name: /PDF/ }));

    expect(screen.getByRole("heading", { name: "Format settings" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /One page per layer/ })).toBeTruthy();
    const scaleOptions = screen.getAllByRole("radio", {
      name: /Actual size 1:1|Fit to page/,
    });
    expect(scaleOptions.map((option) => (option as HTMLInputElement).value)).toEqual([
      "actual",
      "fit",
    ]);
    expect((scaleOptions[0] as HTMLInputElement).checked).toBe(true);
  });

  it("warns when an actual-size project does not fit on A4 and allows A3", () => {
    const project = createProject({
      canvas: {
        background: "#FFFFFF",
        heightMm: 250,
        transparentBackground: true,
        widthMm: 250,
      },
    });
    renderEditor(<ExportModal onCancel={vi.fn()} onExport={vi.fn()} project={project} />);

    fireEvent.click(screen.getByRole("radio", { name: /PDF/ }));

    expect(screen.getByRole("alert").textContent).toContain(
      "This 250 × 250 mm project does not fit on A4 at 1:1",
    );
    expect((screen.getByRole("button", { name: "Export" }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    fireEvent.click(screen.getByRole("radio", { name: "A3" }));

    expect(screen.queryByRole("alert")).toBeNull();
    expect((screen.getByRole("button", { name: "Export" }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  it("shows the 300 DPI PNG resolution and submits the selected arrangement", async () => {
    const onExport = vi.fn().mockResolvedValue(true);
    const range = createRange();
    const project = createProject({
      layers: [createTickScaleLayer(range.id)],
      ranges: [range],
    });
    renderEditor(<ExportModal onCancel={vi.fn()} onExport={onExport} project={project} />);

    fireEvent.click(screen.getByRole("radio", { name: /PNG/ }));
    const dpiOptions = within(
      screen.getByRole("group", { name: "Print resolution (DPI)" }),
    ).getAllByRole("radio");
    expect(dpiOptions.map((option) => (option as HTMLInputElement).value)).toEqual([
      "72",
      "96",
      "150",
      "300",
      "600",
    ]);
    expect((dpiOptions[3] as HTMLInputElement).checked).toBe(true);
    expect(screen.getByText(/1417 × 1417 px/)).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: /One file per layer/ }));
    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    await waitFor(() =>
      expect(onExport).toHaveBeenCalledWith({
        dpi: 300,
        format: "png",
        pdfPaperSize: "a4",
        pdfScale: "actual",
        scope: "layers",
      }),
    );
  });
});
