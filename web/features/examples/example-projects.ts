import appleClockJson from "@/features/examples/projects/apple-clock.json";
import leonGaugeJson from "@/features/examples/projects/leon-gauge.json";
import mazdaGaugeJson from "@/features/examples/projects/mazda-gauge.json";
import pressureGaugeJson from "@/features/examples/projects/pressure-gauge.json";
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
    "apple-clock",
    "Square rounded clock",
    "A crisp analogue clock face inspired by Apple's familiar clock design.",
    appleClockJson,
  ),
  createExample(
    "leon-gauge",
    "Car speedometer with multiple masks",
    "A layered automotive instrument inspired by the SEAT Leon dashboard.",
    leonGaugeJson,
  ),
  createExample(
    "mazda-gauge",
    "Car tachometer with LCD display",
    "A Mazda-inspired automotive dial with a segmented display showing speed and the active gear.",
    mazdaGaugeJson,
  ),
  createExample(
    "pressure-gauge",
    "Custom curve scale gauge",
    "A compact pressure gauge with part of its range marked by an arc and a warning icon.",
    pressureGaugeJson,
  ),
];

function createExample(id: string, title: string, description: string, source: unknown) {
  const result = validateProject(source);
  if (!result.data) throw new Error(`Invalid bundled example: ${id}`);
  return { description, id, project: result.data, title };
}
