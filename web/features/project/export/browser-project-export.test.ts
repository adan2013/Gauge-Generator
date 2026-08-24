import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createProject,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import { exportProject } from "./browser-project-export";

const pdfMocks = vi.hoisted(() => ({
  addPage: vi.fn(),
  constructorOptions: vi.fn(),
  output: vi.fn(() => new Blob(["pdf"], { type: "application/pdf" })),
  svg2pdf: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("jspdf", () => ({
  jsPDF: class {
    constructor(options: unknown) {
      pdfMocks.constructorOptions(options);
    }
    internal = {
      pageSize: {
        getHeight: () => 297,
        getWidth: () => 210,
      },
    };
    addPage = pdfMocks.addPage;
    output = pdfMocks.output;
  },
}));

vi.mock("svg2pdf.js", () => ({ svg2pdf: pdfMocks.svg2pdf }));

afterEach(() => {
  vi.restoreAllMocks();
  pdfMocks.addPage.mockClear();
  pdfMocks.constructorOptions.mockClear();
  pdfMocks.output.mockClear();
  pdfMocks.svg2pdf.mockClear();
});

describe("browser project export", () => {
  it("exports visible layers as pages in one PDF", async () => {
    const createObjectUrl = vi.fn(() => "blob:project-export");
    const revokeObjectUrl = vi.fn();
    Object.defineProperties(URL, {
      createObjectURL: { configurable: true, value: createObjectUrl },
      revokeObjectURL: { configurable: true, value: revokeObjectUrl },
    });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const range = createRange();
    const project = createProject({
      layers: [
        createTickScaleLayer(range.id, { name: "First" }),
        createTickScaleLayer(range.id, { name: "Second" }),
      ],
      meta: {
        createdAt: "2026-01-01T00:00:00.000Z",
        title: "Layered gauge",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      ranges: [range],
    });

    await exportProject(project, {
      dpi: 300,
      format: "pdf",
      pdfPaperSize: "a3",
      pdfScale: "actual",
      scope: "layers",
    });

    expect(pdfMocks.svg2pdf).toHaveBeenCalledTimes(2);
    expect(pdfMocks.constructorOptions).toHaveBeenCalledWith(
      expect.objectContaining({ format: "a3" }),
    );
    expect(pdfMocks.addPage).toHaveBeenCalledWith("a3", "portrait");
    expect(pdfMocks.output).toHaveBeenCalledTimes(1);
    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect((click.mock.instances[0] as HTMLAnchorElement).download).toBe("Layered-gauge.pdf");
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:project-export");
  });
});
