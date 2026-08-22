import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createIconLayer,
  createProject,
  createRange,
  createTickScaleLayer,
} from "@/features/project/factories/project-factories";
import { LayerThumbnail } from "./layer-thumbnail";

describe("LayerThumbnail", () => {
  it("renders the layer's final SVG at thumbnail scale", () => {
    const range = createRange();
    const layer = createTickScaleLayer(range.id, { valueEnd: 20, valueStep: 10 });
    const project = createProject({ layers: [layer], ranges: [range] });
    const { container } = render(<LayerThumbnail layer={layer} project={project} />);

    expect(screen.getByTestId(`layer-thumbnail-${layer.id}`)).toBeTruthy();
    expect(container.querySelectorAll("line")).toHaveLength(3);
  });

  it("loads a catalog-backed icon for its thumbnail", async () => {
    const range = createRange();
    const project = createProject({ ranges: [range] });
    const layer = createIconLayer(range.id, project.canvas, {
      icon: { library: "lucide", name: "gauge" },
    });
    const { container } = render(
      <LayerThumbnail layer={layer} project={{ ...project, layers: [layer] }} />,
    );

    await screen.findByTestId(`layer-thumbnail-${layer.id}`);
    await expect.poll(() => container.querySelectorAll("path").length).toBeGreaterThan(0);
  });
});
