import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import leonGaugeJson from "@/features/examples/projects/leon-gauge.json";
import { validateProject } from "@/features/project/project-dto/project-validation";
import { ExampleProjectPreview } from "./example-project-preview";

describe("ExampleProjectPreview", () => {
  it("clips rendered layers to the canvas bounds", () => {
    const result = validateProject(leonGaugeJson);
    if (!result.data) throw new Error("Expected the Leon example to be valid");

    const { container } = render(
      <ExampleProjectPreview project={result.data} title="Car speedometer with multiple masks" />,
    );

    const clipPath = container.querySelector("clipPath");
    expect(clipPath?.querySelector("rect")?.getAttribute("height")).toBe(
      String(result.data.canvas.heightMm),
    );
    expect(clipPath?.querySelector("rect")?.getAttribute("width")).toBe(
      String(result.data.canvas.widthMm),
    );
    expect(container.querySelector("g[clip-path]")).not.toBeNull();
  });
});
