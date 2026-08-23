import { beforeEach, describe, expect, it } from "vitest";
import { createProject } from "@/features/project/factories/project-factories";
import {
  AUTOSAVE_LIMIT,
  AUTOSAVE_STORAGE_KEY,
  readAutosaveSnapshots,
  saveAutosaveSnapshot,
} from "./project-autosave";

describe("project autosave storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("keeps the five newest valid project snapshots", () => {
    for (let index = 0; index < AUTOSAVE_LIMIT + 2; index += 1) {
      saveAutosaveSnapshot(
        window.localStorage,
        createProject({
          meta: {
            title: `Project ${index}`,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        }),
        new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(),
      );
    }

    const snapshots = readAutosaveSnapshots(window.localStorage);
    expect(snapshots).toHaveLength(5);
    expect(snapshots[0].project.meta.title).toBe("Project 6");
    expect(snapshots.at(-1)?.project.meta.title).toBe("Project 2");
  });

  it("ignores corrupt storage without mutating it", () => {
    window.localStorage.setItem(AUTOSAVE_STORAGE_KEY, "not json");
    expect(readAutosaveSnapshots(window.localStorage)).toEqual([]);
    expect(window.localStorage.getItem(AUTOSAVE_STORAGE_KEY)).toBe("not json");
  });
});
