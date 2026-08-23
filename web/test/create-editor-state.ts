import type { RootState } from "@/store/store";

export function createEditorState(
  overrides: Partial<RootState["editor"]> = {},
): RootState["editor"] {
  return {
    sidebarMode: "layers",
    selectedObject: null,
    hoveredLayerId: null,
    layerPreviewModifiers: {
      showOnlySelectedLayer: false,
      bringSelectedLayerToFront: false,
      showEditingOverlay: true,
    },
    autosaveStatus: "idle",
    ...overrides,
  };
}
