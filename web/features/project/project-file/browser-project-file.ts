import type { ProjectDto } from "@/features/project/project-dto/project-dto";
import { serializeProjectJson } from "@/features/project/project-file/project-json";

export async function chooseProjectJsonFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.addEventListener("change", () => resolve(input.files?.[0] ?? null), { once: true });
    input.addEventListener("cancel", () => resolve(null), { once: true });
    input.click();
  });
}

export function downloadProjectJson(project: ProjectDto): void {
  const blob = new Blob([serializeProjectJson(project)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sanitizeFilename(project.meta.title)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function sanitizeFilename(title: string): string {
  const sanitized = title
    .trim()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return sanitized || "gauge-project";
}
