import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type SidebarMode = "layers" | "properties" | "project-settings";
export type EditorSelection = { collection: "layers" | "ranges"; id: string } | null;
export type AutosaveStatus = "idle" | "saved" | "error";
export type LayerPreviewModifiers = {
  showOnlySelectedLayer: boolean;
  bringSelectedLayerToFront: boolean;
  showEditingOverlay: boolean;
};

type EditorState = {
  sidebarMode: SidebarMode;
  selectedObject: EditorSelection;
  hoveredLayerId: string | null;
  layerPreviewModifiers: LayerPreviewModifiers;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
  autosaveStatus: AutosaveStatus;
};

const initialState: EditorState = {
  sidebarMode: "layers",
  selectedObject: null,
  hoveredLayerId: null,
  layerPreviewModifiers: {
    showOnlySelectedLayer: false,
    bringSelectedLayerToFront: false,
    showEditingOverlay: true,
  },
  snapping: { enabled: true, distanceMm: 2, angleDegrees: 10 },
  autosaveStatus: "idle",
};

export const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setSidebarMode: (state, action: PayloadAction<SidebarMode>) => {
      state.sidebarMode = action.payload;
    },
    setSelectedObject: (state, action: PayloadAction<EditorSelection>) => {
      state.selectedObject = action.payload;
    },
    setHoveredLayerId: (state, action: PayloadAction<string | null>) => {
      state.hoveredLayerId = action.payload;
    },
    setLayerPreviewModifiers: (state, action: PayloadAction<LayerPreviewModifiers>) => {
      state.layerPreviewModifiers = action.payload;
    },
    setSnapping: (state, action: PayloadAction<EditorState["snapping"]>) => {
      state.snapping = action.payload;
    },
    setAutosaveStatus: (state, action: PayloadAction<AutosaveStatus>) => {
      state.autosaveStatus = action.payload;
    },
  },
});

export const editorActions = editorSlice.actions;
