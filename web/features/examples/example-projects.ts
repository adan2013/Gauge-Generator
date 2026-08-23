import classicScaleJson from "@/features/examples/projects/classic-scale.json";
import electricRangeJson from "@/features/examples/projects/electric-range.json";
import grandTourerJson from "@/features/examples/projects/grand-tourer.json";
import minimalLabelJson from "@/features/examples/projects/minimal-label.json";
import { validateProject } from "@/features/project/project-dto/project-validation";
import type { ProjectDto } from "@/features/project/project-dto/project-dto";

export type ExampleProject = {
  description: string;
  id: string;
  project: ProjectDto;
  title: string;
};

export const EXAMPLE_PROJECTS: ExampleProject[] = [
  createExample(
    "heritage-clock",
    "Heritage clock",
    "A warm, mechanical clock face with layered hands and classic typography.",
    classicScaleJson,
  ),
  createExample(
    "track-tachometer",
    "Track tachometer",
    "A high-contrast racing dial with minor marks, redline, and a live needle.",
    minimalLabelJson,
  ),
  createExample(
    "grand-tourer",
    "Grand tourer",
    "A refined dual-scale speedometer with KPH, MPH, warning zone, and odometer.",
    grandTourerJson,
  ),
  createExample(
    "electric-range",
    "Electric range",
    "A wide, rounded dashboard instrument for charge and remaining distance.",
    electricRangeJson,
  ),
];

function createExample(id: string, title: string, description: string, source: unknown) {
  const result = validateProject(source);
  if (!result.data) throw new Error(`Invalid bundled example: ${id}`);
  return { description, id, project: result.data, title };
}
