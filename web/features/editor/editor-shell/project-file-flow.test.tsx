import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createProject, createRange } from "@/features/project/factories/project-factories";
import { serializeProjectJson } from "@/features/project/project-file/project-json";
import {
  AUTOSAVE_INTERVAL_MS,
  readAutosaveSnapshots,
  saveAutosaveSnapshot,
} from "@/features/project/persistence/project-autosave";
import { projectActions } from "@/store/project-slice";
import { selectIsProjectDirty } from "@/store/project-file-slice";
import { makeStore } from "@/store/store";
import { renderEditor } from "@/test/render-editor";
import { EditorShell } from "./editor-shell";

const browserFileMocks = vi.hoisted(() => ({
  chooseProjectJsonFile: vi.fn(),
  downloadProjectJson: vi.fn(),
}));
const browserExportMocks = vi.hoisted(() => ({ exportProject: vi.fn() }));

vi.mock("@/features/project/project-file/browser-project-file", () => browserFileMocks);
vi.mock("@/features/project/export/browser-project-export", () => browserExportMocks);

describe("EditorShell project file flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.title = "Gauge Generator Web";
    browserFileMocks.chooseProjectJsonFile.mockReset();
    browserFileMocks.downloadProjectJson.mockReset();
    browserExportMocks.exportProject.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => vi.useRealTimers());

  it("protects dirty New project and resets the saved baseline after confirmation", async () => {
    const project = createProject({ ranges: [createRange()] });
    const store = makeStore({ project: { current: project } });
    renderEditor(<EditorShell />, store);
    act(() => store.dispatch(projectActions.setCanvas({ ...project.canvas, widthMm: 140 })));

    fireEvent.click(screen.getAllByRole("button", { name: "New project" }).at(-1)!);
    expect(await screen.findByRole("alertdialog")).toBeTruthy();
    expect(store.getState().project.current.ranges).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Discard and create" }));
    await waitFor(() => expect(store.getState().project.current.ranges).toHaveLength(0));
    expect(selectIsProjectDirty(store.getState())).toBe(false);
    expect(store.getState().history.past).toHaveLength(0);
  });

  it("reflects the project title and dirty marker in the tab until Download", async () => {
    const store = makeStore({
      project: {
        current: createProject({
          meta: {
            title: "Card project",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        }),
      },
    });
    renderEditor(<EditorShell />, store);
    await waitFor(() => expect(document.title).toBe("Card project — Gauge Generator Web"));
    act(() => store.dispatch(projectActions.addRange(createRange())));
    expect(selectIsProjectDirty(store.getState())).toBe(true);
    await waitFor(() => expect(document.title).toBe("* Card project — Gauge Generator Web"));

    fireEvent.click(screen.getAllByRole("button", { name: "Download" }).at(-1)!);

    expect(browserFileMocks.downloadProjectJson).toHaveBeenCalledWith(
      store.getState().project.current,
    );
    expect(selectIsProjectDirty(store.getState())).toBe(false);
    await waitFor(() => expect(document.title).toBe("Card project — Gauge Generator Web"));
  });

  it("opens a validated project atomically and leaves an invalid file without changes", async () => {
    const openedProject = createProject({
      meta: {
        title: "Opened project",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });
    browserFileMocks.chooseProjectJsonFile.mockResolvedValueOnce({
      text: async () => serializeProjectJson(openedProject),
    });
    const store = makeStore();
    renderEditor(<EditorShell />, store);

    fireEvent.click(screen.getAllByRole("button", { name: "Open" }).at(-1)!);
    await waitFor(() => expect(store.getState().project.current.meta.title).toBe("Opened project"));
    expect(selectIsProjectDirty(store.getState())).toBe(false);

    browserFileMocks.chooseProjectJsonFile.mockResolvedValueOnce({ text: async () => "bad" });
    fireEvent.click(screen.getAllByRole("button", { name: "Open" }).at(-1)!);
    expect(await screen.findByText(/not a valid Gauge Generator project/)).toBeTruthy();
    expect(store.getState().project.current.meta.title).toBe("Opened project");
  });

  it("opens Export and keeps project changes dirty after producing artwork", async () => {
    const store = makeStore();
    renderEditor(<EditorShell />, store);
    act(() => store.dispatch(projectActions.addRange(createRange())));

    fireEvent.click(screen.getAllByRole("button", { name: "Export" }).at(-1)!);
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Export" }));

    await waitFor(() => expect(browserExportMocks.exportProject).toHaveBeenCalled());
    expect(selectIsProjectDirty(store.getState())).toBe(true);
  });

  it("autosaves changed project data locally without clearing dirty state or the tab title", () => {
    vi.useFakeTimers();
    const store = makeStore();
    renderEditor(<EditorShell />, store);
    act(() => store.dispatch(projectActions.addRange(createRange())));

    act(() => vi.advanceTimersByTime(AUTOSAVE_INTERVAL_MS));

    expect(readAutosaveSnapshots(window.localStorage)).toHaveLength(1);
    expect(store.getState().editor.autosaveStatus).toBe("saved");
    expect(selectIsProjectDirty(store.getState())).toBe(true);
    expect(screen.getByText(/Autosaved locally/)).toBeTruthy();
    expect(document.title).toBe("* Untitled project — Gauge Generator Web");
  });

  it("restores a local snapshot and opens a bundled example as dirty projects", async () => {
    const restored = createProject({
      meta: {
        title: "Recovered gauge",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });
    saveAutosaveSnapshot(window.localStorage, restored, "2026-08-23T08:00:00.000Z");
    const store = makeStore();
    renderEditor(<EditorShell />, store);

    fireEvent.click(screen.getAllByRole("button", { name: "Restore" }).at(-1)!);
    fireEvent.click(await screen.findByRole("button", { name: "Restore: Recovered gauge" }));
    await waitFor(() =>
      expect(store.getState().project.current.meta.title).toBe("Recovered gauge"),
    );
    expect(selectIsProjectDirty(store.getState())).toBe(true);

    fireEvent.click(screen.getAllByRole("button", { name: "Examples" }).at(-1)!);
    expect(await screen.findAllByRole("img", { name: /Preview of/ })).toHaveLength(4);
    fireEvent.click(
      await screen.findByRole("button", { name: /Open example: Square rounded clock/ }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Discard and open example" }));
    await waitFor(() =>
      expect(store.getState().project.current.meta.title).toBe("Square rounded clock"),
    );
    expect(selectIsProjectDirty(store.getState())).toBe(true);
  });

  it("registers beforeunload protection only while the project is dirty", () => {
    const store = makeStore();
    renderEditor(<EditorShell />, store);
    const cleanEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);

    act(() => store.dispatch(projectActions.addRange(createRange())));
    const dirtyEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);
  });
});
