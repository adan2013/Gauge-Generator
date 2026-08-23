import { z } from "zod";
import { ProjectSchema, type ProjectDto } from "@/features/project/project-dto/project-dto";

export const AUTOSAVE_INTERVAL_MS = 3 * 60 * 1_000;
export const AUTOSAVE_LIMIT = 5;
export const AUTOSAVE_STORAGE_KEY = "gauge-generator-web:autosave-snapshots";

const AutosaveSnapshotSchema = z
  .object({
    savedAt: z.string().datetime(),
    project: ProjectSchema,
  })
  .strict();

const AutosaveCollectionSchema = z.array(AutosaveSnapshotSchema);

export type AutosaveSnapshot = z.infer<typeof AutosaveSnapshotSchema>;

export function readAutosaveSnapshots(storage: Storage): AutosaveSnapshot[] {
  const source = storage.getItem(AUTOSAVE_STORAGE_KEY);
  if (!source) return [];
  try {
    const parsed = AutosaveCollectionSchema.safeParse(JSON.parse(source));
    if (!parsed.success) return [];
    return parsed.data
      .sort((left, right) => right.savedAt.localeCompare(left.savedAt))
      .slice(0, AUTOSAVE_LIMIT);
  } catch {
    return [];
  }
}

export function saveAutosaveSnapshot(
  storage: Storage,
  project: ProjectDto,
  savedAt = new Date().toISOString(),
): AutosaveSnapshot[] {
  const snapshot = AutosaveSnapshotSchema.parse({ savedAt, project });
  const snapshots = [snapshot, ...readAutosaveSnapshots(storage)].slice(0, AUTOSAVE_LIMIT);
  storage.setItem(AUTOSAVE_STORAGE_KEY, JSON.stringify(snapshots));
  return snapshots;
}
