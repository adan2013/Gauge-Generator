import { createSlice, current, type PayloadAction } from "@reduxjs/toolkit";
import { createProject } from "@/features/project/factories/project-factories";
import { constrainProjectLayersToRanges } from "@/features/layers/core/layer-registry";
import {
  MAX_LAYERS,
  type CanvasDto,
  type LayerDto,
  type ProjectDto,
  type RangeDto,
  type SnappingDto,
} from "@/features/project/project-dto/project-dto";
import { validateProject } from "@/features/project/project-dto/project-validation";

type ProjectState = { current: ProjectDto };

const initialState: ProjectState = {
  current: createProject(),
};

function touch(project: ProjectDto) {
  project.meta.updatedAt = new Date().toISOString();
}

function commitProjectMutation(state: ProjectState, mutate: (project: ProjectDto) => boolean) {
  const candidate = structuredClone(current(state.current));
  if (!mutate(candidate)) return;
  const constrainedCandidate = constrainProjectLayersToRanges(candidate);
  touch(constrainedCandidate);
  const result = validateProject(constrainedCandidate);
  if (result.data) state.current = result.data;
}

export const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    resetProject: (state, action: PayloadAction<ProjectDto | undefined>) => {
      const result = validateProject(action.payload ?? createProject());
      if (result.data) state.current = result.data;
    },
    replaceProject: (state, action: PayloadAction<ProjectDto>) => {
      const result = validateProject(action.payload);
      if (result.data) state.current = result.data;
    },
    setCanvas: (state, action: PayloadAction<CanvasDto>) => {
      commitProjectMutation(state, (project) => {
        project.canvas = action.payload;
        return true;
      });
    },
    setSnapping: (state, action: PayloadAction<SnappingDto>) => {
      commitProjectMutation(state, (project) => {
        project.settings.snapping = action.payload;
        return true;
      });
    },
    setProjectTitle: (state, action: PayloadAction<string>) => {
      commitProjectMutation(state, (project) => {
        project.meta.title = action.payload;
        return true;
      });
    },
    addRange: (state, action: PayloadAction<RangeDto>) => {
      commitProjectMutation(state, (project) => {
        project.ranges.push(action.payload);
        return true;
      });
    },
    updateRange: (state, action: PayloadAction<RangeDto>) => {
      commitProjectMutation(state, (project) => {
        const index = project.ranges.findIndex((range) => range.id === action.payload.id);
        if (index < 0) return false;
        project.ranges[index] = action.payload;
        return true;
      });
    },
    removeRange: (state, action: PayloadAction<string>) => {
      commitProjectMutation(state, (project) => {
        if (project.layers.some((layer) => layer.rangeId === action.payload)) return false;
        const nextRanges = project.ranges.filter((range) => range.id !== action.payload);
        if (nextRanges.length === project.ranges.length) return false;
        project.ranges = nextRanges;
        return true;
      });
    },
    addLayer: (state, action: PayloadAction<LayerDto>) => {
      commitProjectMutation(state, (project) => {
        project.layers.unshift(action.payload);
        return true;
      });
    },
    duplicateLayer: (state, action: PayloadAction<{ layerId: string; name: string }>) => {
      commitProjectMutation(state, (project) => {
        if (project.layers.length >= MAX_LAYERS) return false;
        const sourceIndex = project.layers.findIndex(
          (layer) => layer.id === action.payload.layerId,
        );
        if (sourceIndex < 0) return false;
        const sourceLayer = project.layers[sourceIndex];
        project.layers.splice(sourceIndex, 0, {
          ...sourceLayer,
          id: crypto.randomUUID(),
          name: action.payload.name,
        });
        return true;
      });
    },
    updateLayer: (state, action: PayloadAction<LayerDto>) => {
      commitProjectMutation(state, (project) => {
        const index = project.layers.findIndex((layer) => layer.id === action.payload.id);
        if (index < 0) return false;
        project.layers[index] = action.payload;
        return true;
      });
    },
    removeLayer: (state, action: PayloadAction<string>) => {
      commitProjectMutation(state, (project) => {
        const nextLayers = project.layers.filter((layer) => layer.id !== action.payload);
        if (nextLayers.length === project.layers.length) return false;
        project.layers = nextLayers;
        return true;
      });
    },
    reorderLayer: (state, action: PayloadAction<{ layerId: string; targetIndex: number }>) => {
      commitProjectMutation(state, (project) => {
        const sourceIndex = project.layers.findIndex(
          (layer) => layer.id === action.payload.layerId,
        );
        if (sourceIndex < 0) return false;
        const [layer] = project.layers.splice(sourceIndex, 1);
        const targetIndex = Math.max(
          0,
          Math.min(action.payload.targetIndex, project.layers.length),
        );
        project.layers.splice(targetIndex, 0, layer);
        return true;
      });
    },
  },
});

export const projectActions = projectSlice.actions;
