import { describe, expect, it } from "vitest";
import { createProject } from "@/features/project/factories/project-factories";
import {
  getPdfPageLayout,
  getPngDimensions,
  isRasterSizeSupported,
} from "./project-export-options";

describe("project export options", () => {
  it("converts millimetres and DPI to the displayed PNG pixel dimensions", () => {
    const project = createProject({
      canvas: {
        background: "#FFFFFF",
        heightMm: 25.4,
        transparentBackground: true,
        widthMm: 50.8,
      },
    });

    expect(getPngDimensions(project, 300)).toEqual({ height: 300, width: 600 });
    expect(isRasterSizeSupported(project, 300)).toBe(true);
  });

  it("reports whether the project fits an ISO paper size at 1:1", () => {
    const project = createProject({
      canvas: {
        background: "#FFFFFF",
        heightMm: 250,
        transparentBackground: true,
        widthMm: 250,
      },
    });

    expect(getPdfPageLayout(project, "a4")).toMatchObject({
      availableHeight: 277,
      availableWidth: 190,
      fitsActualSize: false,
    });
    expect(getPdfPageLayout(project, "a3")).toMatchObject({
      availableHeight: 400,
      availableWidth: 277,
      fitsActualSize: true,
    });
  });
});
