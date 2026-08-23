"use client";

import { createContext, type ReactNode, use, useEffect, useRef } from "react";
import { CircleCheck, Pencil, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { useStatusMessage } from "@/components/providers/status-message-provider/status-message-provider";
import { useProjectValidation } from "@/features/editor/project-validation/use-project-validation";
import { useEditorToolbarController } from "@/features/editor/editor-shell/use-editor-toolbar-controller";
import { useSidebarPanelEscape } from "@/features/editor/editor-shell/use-sidebar-panel-escape";
import { constrainProjectLayersToRanges } from "@/features/layers/core/layer-registry";
import {
  createLayerFromType,
  createRangeForCanvas,
  resetLayerToDefaults,
} from "@/features/project/factories/project-factories";
import {
  MAX_RANGES,
  type LayerDto,
  type LayerType,
  type ProjectDto,
  type RangeDto,
} from "@/features/project/project-dto/project-dto";
import {
  editorActions,
  type EditorSelection,
  type LayerPreviewModifiers,
  type SidebarMode,
} from "@/store/editor-slice";
import {
  beginProjectHistoryTransaction,
  completeProjectHistoryTransaction,
} from "@/store/history-actions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { projectActions } from "@/store/project-slice";

type EditorShellState = {
  hoveredLayerId: string | null;
  layerPreviewModifiers: LayerPreviewModifiers;
  project: ProjectDto;
  selectedLayer: LayerDto | undefined;
  selectedName: string;
  selectedObject: EditorSelection;
  selectedRange: RangeDto | undefined;
  sidebarMode: SidebarMode;
  snapping: {
    enabled: boolean;
    distanceMm: number;
    angleDegrees: number;
  };
};

type EditorShellActions = {
  beginHistoryTransaction: () => void;
  browseExamples: () => void;
  closeSidebarPanel: () => void;
  commitLayer: (layer: LayerDto) => boolean;
  commitRange: (range: RangeDto) => boolean;
  completeHistoryTransaction: () => void;
  createLayer: (type: LayerType) => void;
  createProjectRange: () => void;
  duplicateLayer: (layerId: string, name: string) => void;
  openLayerFromCanvas: (layerId: string) => void;
  openLayerPicker: () => void;
  openLayerProperties: (layerId: string) => void;
  openProjectSettings: () => void;
  openRangeProperties: (rangeId: string) => void;
  removeLayer: (layerId: string) => void;
  removeRange: (rangeId: string) => void;
  renameSelectedObject: (name: string) => void;
  reorderLayer: (layerId: string, targetIndex: number) => void;
  resetSelectedLayer: () => void;
  setHoveredLayerId: (layerId: string | null) => void;
  setLayerPreviewModifiers: (modifiers: LayerPreviewModifiers) => void;
  toggleLayerVisibility: (layerId: string) => void;
  updateCanvas: (change: Partial<ProjectDto["canvas"]>) => void;
  updateSelectedLayer: (change: Partial<LayerDto>) => void;
  updateSelectedRange: (change: Partial<RangeDto>) => void;
  updateSnapping: (change: Partial<EditorShellState["snapping"]>) => void;
};

type EditorShellContextValue = {
  actions: EditorShellActions;
  meta: { toolbar: ReturnType<typeof useEditorToolbarController> };
  state: EditorShellState;
};

const EditorShellContext = createContext<EditorShellContextValue | null>(null);

export function EditorShellProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const project = useAppSelector((state) => state.project.current);
  const { hoveredLayerId, layerPreviewModifiers, selectedObject, sidebarMode, snapping } =
    useAppSelector((state) => state.editor);
  const t = useTranslations("Editor");
  const { dismissMessage, showMessage } = useStatusMessage();
  const { validateCandidateProject } = useProjectValidation();
  const rangeWarningIdRef = useRef<number | null>(null);

  function dismissRangeDependencyWarning() {
    if (rangeWarningIdRef.current === null) return;
    dismissMessage(rangeWarningIdRef.current);
    rangeWarningIdRef.current = null;
  }
  function commitRange(range: RangeDto) {
    const ranges = project.ranges.map((candidate) =>
      candidate.id === range.id ? range : candidate,
    );
    const candidateProject = constrainProjectLayersToRanges({ ...project, ranges });
    if (!validateCandidateProject(candidateProject)) return false;
    dispatch(projectActions.updateRange(range));
    return true;
  }
  function commitLayer(layer: LayerDto) {
    const layers = project.layers.map((candidate) =>
      candidate.id === layer.id ? layer : candidate,
    );
    if (!validateCandidateProject({ ...project, layers })) return false;
    dispatch(projectActions.updateLayer(layer));
    return true;
  }
  function showRangeDependencyWarning(rangeId: string, candidateProject = project) {
    dismissRangeDependencyWarning();
    const count = candidateProject.layers.filter((layer) => layer.rangeId === rangeId).length;
    if (count === 0) return;
    rangeWarningIdRef.current = showMessage({
      color: "accent",
      content: t("status.rangeDependencyWarning", { count }),
      duration: "persistent",
      icon: TriangleAlert,
    });
  }
  useEffect(
    () => () => {
      if (rangeWarningIdRef.current !== null) dismissMessage(rangeWarningIdRef.current);
    },
    [dismissMessage],
  );

  function openRangeProperties(rangeId: string) {
    showRangeDependencyWarning(rangeId);
    dispatch(editorActions.setSelectedObject({ collection: "ranges", id: rangeId }));
    dispatch(editorActions.setSidebarMode("properties"));
  }
  function openLayerProperties(layerId: string) {
    dismissRangeDependencyWarning();
    dispatch(editorActions.setSelectedObject({ collection: "layers", id: layerId }));
    dispatch(editorActions.setSidebarMode("properties"));
  }
  function openLayerFromCanvas(layerId: string) {
    if (
      sidebarMode === "properties" &&
      selectedObject?.collection === "layers" &&
      selectedObject.id === layerId
    )
      return;
    const layer = project.layers.find((candidate) => candidate.id === layerId);
    if (!layer) return;
    openLayerProperties(layerId);
    showMessage({
      color: "neutral",
      content: t("status.layerEditModeStarted", { name: layer.name }),
      duration: 2_500,
      icon: Pencil,
    });
  }
  function createProjectRange() {
    if (project.ranges.length >= MAX_RANGES) return;
    const range = createRangeForCanvas(project.canvas, {
      name: t("ranges.defaultName", { number: project.ranges.length + 1 }),
    });
    if (!validateCandidateProject({ ...project, ranges: [...project.ranges, range] })) return;
    dispatch(projectActions.addRange(range));
    openRangeProperties(range.id);
  }
  function openLayerPicker() {
    if (!project.ranges[0]) {
      showMessage({
        color: "accent",
        content: t("status.rangeRequired"),
        duration: 4_000,
        icon: TriangleAlert,
      });
      return;
    }
    dismissRangeDependencyWarning();
    dispatch(editorActions.setSelectedObject(null));
    dispatch(editorActions.setSidebarMode("properties"));
  }
  function createLayer(type: LayerType) {
    const sourceRange = project.ranges.at(-1);
    if (!sourceRange) return;
    const name = t("layers.defaultName", { number: project.layers.length + 1 });
    const layer = createLayerFromType(type, sourceRange, project.canvas, { name });
    dispatch(projectActions.addLayer(layer));
    openLayerProperties(layer.id);
  }
  function renameSelectedObject(name: string) {
    if (!selectedObject) return;
    if (selectedObject.collection === "ranges") {
      const range = project.ranges.find((item) => item.id === selectedObject.id);
      if (range) commitRange({ ...range, name });
      return;
    }
    const layer = project.layers.find((item) => item.id === selectedObject.id);
    if (layer) commitLayer({ ...layer, name });
  }

  const selectedName =
    selectedObject?.collection === "ranges"
      ? (project.ranges.find((range) => range.id === selectedObject.id)?.name ?? "")
      : (project.layers.find((layer) => layer.id === selectedObject?.id)?.name ?? "");
  const selectedRange =
    selectedObject?.collection === "ranges"
      ? project.ranges.find((range) => range.id === selectedObject.id)
      : undefined;
  const selectedLayer =
    selectedObject?.collection === "layers"
      ? project.layers.find((layer) => layer.id === selectedObject.id)
      : undefined;

  function closeSidebarPanel() {
    dismissRangeDependencyWarning();
    dispatch(editorActions.setSidebarMode("layers"));
  }
  useSidebarPanelEscape({
    enabled:
      sidebarMode === "project-settings" ||
      (sidebarMode === "properties" && selectedObject !== null),
    onEscape: closeSidebarPanel,
  });
  function updateSelectedRange(change: Partial<RangeDto>) {
    if (selectedRange) commitRange({ ...selectedRange, ...change });
  }
  function updateSelectedLayer(change: Partial<LayerDto>) {
    if (!selectedLayer) return;
    commitLayer({ ...selectedLayer, ...change } as LayerDto);
  }
  function resetSelectedLayer() {
    if (!selectedLayer) return;
    const sourceRange = project.ranges.find((range) => range.id === selectedLayer.rangeId);
    if (
      !sourceRange ||
      !commitLayer(resetLayerToDefaults(selectedLayer, sourceRange, project.canvas))
    )
      return;
    showMessage({
      color: "neutral",
      content: t("status.layerReset"),
      duration: 3_000,
      icon: CircleCheck,
    });
  }
  function updateCanvas(change: Partial<ProjectDto["canvas"]>) {
    const canvas = { ...project.canvas, ...change };
    if (!validateCandidateProject({ ...project, canvas })) return;
    dispatch(projectActions.setCanvas(canvas));
  }
  function updateSnapping(change: Partial<typeof snapping>) {
    dispatch(editorActions.setSnapping({ ...snapping, ...change }));
  }
  function toggleLayerVisibility(layerId: string) {
    const layer = project.layers.find((item) => item.id === layerId);
    if (layer) commitLayer({ ...layer, visible: !layer.visible });
  }
  function openProjectSettings() {
    dismissRangeDependencyWarning();
    dispatch(editorActions.setSidebarMode("project-settings"));
  }

  const toolbar = useEditorToolbarController({
    dismissRangeDependencyWarning,
    selectedRange,
    showRangeDependencyWarning,
  });
  const value: EditorShellContextValue = {
    actions: {
      beginHistoryTransaction: () => {
        dispatch(beginProjectHistoryTransaction());
      },
      browseExamples: () => undefined,
      closeSidebarPanel,
      commitLayer,
      commitRange,
      completeHistoryTransaction: () => {
        dispatch(completeProjectHistoryTransaction());
      },
      createLayer,
      createProjectRange,
      duplicateLayer: (layerId, name) => {
        dispatch(projectActions.duplicateLayer({ layerId, name }));
      },
      openLayerFromCanvas,
      openLayerPicker,
      openLayerProperties,
      openProjectSettings,
      openRangeProperties,
      removeLayer: (layerId) => {
        dispatch(projectActions.removeLayer(layerId));
      },
      removeRange: (rangeId) => {
        dispatch(projectActions.removeRange(rangeId));
      },
      renameSelectedObject,
      reorderLayer: (layerId, targetIndex) => {
        dispatch(projectActions.reorderLayer({ layerId, targetIndex }));
      },
      resetSelectedLayer,
      setHoveredLayerId: (layerId) => {
        dispatch(editorActions.setHoveredLayerId(layerId));
      },
      setLayerPreviewModifiers: (modifiers) => {
        dispatch(editorActions.setLayerPreviewModifiers(modifiers));
      },
      toggleLayerVisibility,
      updateCanvas,
      updateSelectedLayer,
      updateSelectedRange,
      updateSnapping,
    },
    meta: { toolbar },
    state: {
      hoveredLayerId,
      layerPreviewModifiers,
      project,
      selectedLayer,
      selectedName,
      selectedObject,
      selectedRange,
      sidebarMode,
      snapping,
    },
  };

  return <EditorShellContext value={value}>{children}</EditorShellContext>;
}

export function useEditorShell() {
  const context = use(EditorShellContext);
  if (!context) throw new Error("useEditorShell must be used within EditorShellProvider");
  return context;
}
