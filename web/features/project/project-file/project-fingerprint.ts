import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";
import { ProjectSchema, type ProjectDto } from "@/features/project/project-dto/project-dto";

export function createProjectFingerprint(project: ProjectDto): string {
  const canonicalJson = JSON.stringify(sortJsonValue(ProjectSchema.parse(project)));
  return `sha256:${bytesToHex(sha256(utf8ToBytes(canonicalJson)))}`;
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJsonValue);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, sortJsonValue(entry)]),
  );
}
