"use client";

import { useEffect, useRef } from "react";
import {
  BookOpen,
  CircleCheck,
  Download,
  FileDown,
  FilePlus2,
  FolderOpen,
  HelpCircle,
  History,
  Pencil,
  Redo2,
  TriangleAlert,
  Undo2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useStatusMessage } from "@/components/providers/status-message-provider/status-message-provider";
import { CanvasPreview } from "@/features/editor/canvas-preview/canvas-preview";
import { constrainProjectLayersToRanges } from "@/features/layers/core/layer-registry";
import { EditorSidebar } from "@/features/editor/editor-sidebar/editor-sidebar";
import {
  EditorToolbar,
  type EditorToolbarAction,
} from "@/features/editor/editor-toolbar/editor-toolbar";
import { LayersBrowser } from "@/features/editor/layers-browser/layers-browser";
import { ProjectSettingsPanel } from "@/features/editor/project-settings-panel/project-settings-panel";
import { useProjectValidation } from "@/features/editor/project-validation/use-project-validation";
import { useLayerEditingEscape } from "@/features/editor/editor-shell/use-layer-editing-escape";
import { PropertiesPanel } from "@/features/editor/properties-panel/properties-panel";
import {
  createRangeForCanvas,
  createLayerFromType,
  resetLayerToDefaults,
} from "@/features/project/factories/project-factories";
import {
  MAX_RANGES,
  type LayerDto,
  type LayerType,
  type RangeDto,
} from "@/features/project/project-dto/project-dto";
import { cn } from "@/lib/cn";
import { editorActions } from "@/store/editor-slice";
import {
  beginProjectHistoryTransaction,
  completeProjectHistoryTransaction,
  redoProject,
  undoProject,
} from "@/store/history-actions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { projectActions } from "@/store/project-slice";

export function EditorShell() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const project = useAppSelector((state) => state.project.current);
  const { hoveredLayerId, layerPreviewModifiers, selectedObject, sidebarMode, snapping } =
    useAppSelector((state) => state.editor);
  const { past, future } = useAppSelector((state) => state.history);
  const t = useTranslations("Editor");
  const { dismissMessage, showMessage } = useStatusMessage();
  const { validateCandidateProject } = useProjectValidation();
  const rangeWarningIdRef = useRef<number | null>(null);
  const toolbarActions: EditorToolbarAction[] = [
    { id: "newProject", label: t("toolbar.newProject"), icon: FilePlus2 },
    { id: "open", label: t("toolbar.open"), icon: FolderOpen },
    { id: "download", label: t("toolbar.download"), icon: Download },
    { id: "import", label: t("toolbar.import"), icon: Upload },
    { id: "export", label: t("toolbar.export"), icon: FileDown },
    { id: "undo", label: t("toolbar.undo"), icon: Undo2, disabled: past.length === 0 },
    { id: "redo", label: t("toolbar.redo"), icon: Redo2, disabled: future.length === 0 },
    { id: "restore", label: t("toolbar.restore"), icon: History },
    { id: "examples", label: t("toolbar.examples"), icon: BookOpen },
    { id: "helpCenter", label: t("toolbar.helpCenter"), icon: HelpCircle },
  ];
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
  const openRangeProperties = (rangeId: string) => {
    showRangeDependencyWarning(rangeId);
    dispatch(editorActions.setSelectedObject({ collection: "ranges", id: rangeId }));
    dispatch(editorActions.setSidebarMode("properties"));
  };
  const openLayerProperties = (layerId: string) => {
    dismissRangeDependencyWarning();
    dispatch(editorActions.setSelectedObject({ collection: "layers", id: layerId }));
    dispatch(editorActions.setSidebarMode("properties"));
  };
  const openLayerFromCanvas = (layerId: string) => {
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
  };
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
  useLayerEditingEscape({
    enabled: sidebarMode === "properties" && selectedObject?.collection === "layers",
    onEscape: () => dispatch(editorActions.setSidebarMode("layers")),
  });
  const updateSelectedRange = (change: Partial<RangeDto>) => {
    if (selectedRange) commitRange({ ...selectedRange, ...change });
  };
  const updateSelectedLayer = (change: Partial<LayerDto>) => {
    if (!selectedLayer) return;
    commitLayer({ ...selectedLayer, ...change } as LayerDto);
  };
  const resetSelectedLayer = () => {
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
  };
  const updateCanvas = (change: Partial<typeof project.canvas>) => {
    const canvas = { ...project.canvas, ...change };
    if (!validateCandidateProject({ ...project, canvas })) return;
    dispatch(projectActions.setCanvas(canvas));
  };
  const updateSnapping = (change: Partial<typeof snapping>) =>
    dispatch(editorActions.setSnapping({ ...snapping, ...change }));
  function handleToolbarAction(action: EditorToolbarAction) {
    if (action.id === "undo") {
      const targetProject = past.at(-1);
      dispatch(undoProject());
      if (selectedRange && targetProject?.ranges.some((range) => range.id === selectedRange.id))
        showRangeDependencyWarning(selectedRange.id, targetProject);
      else dismissRangeDependencyWarning();
      showMessage({ content: t("status.undo"), duration: 2_500 });
      return;
    }
    if (action.id === "redo") {
      const targetProject = future.at(-1);
      dispatch(redoProject());
      if (selectedRange && targetProject?.ranges.some((range) => range.id === selectedRange.id))
        showRangeDependencyWarning(selectedRange.id, targetProject);
      else dismissRangeDependencyWarning();
      showMessage({ content: t("status.redo"), duration: 2_500 });
      return;
    }
  }

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-app text-ink">
      <header className="flex min-h-14 items-center gap-2 border-b border-border bg-surface px-2 sm:px-3">
        <Link
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-md px-1.5 py-1 font-semibold tracking-tight text-ink",
            "hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
          )}
          href="/"
        >
          <span className="grid size-7 place-items-center rounded-md bg-accent text-xs font-bold text-white">
            GG
          </span>
          <span className="hidden lg:inline">{t("brand")}</span>
        </Link>
        <EditorToolbar
          actions={toolbarActions}
          onAction={handleToolbarAction}
          onOpenHelp={() => router.push("/app/help")}
        />
      </header>
      <section className="flex min-h-0 flex-1 overflow-hidden">
        <EditorSidebar
          ariaLabel={t("layers.sidebarAriaLabel")}
          layers={
            <LayersBrowser
              layers={project.layers}
              onCreateLayer={openLayerPicker}
              onCreateRange={createProjectRange}
              onDeleteLayer={(layerId) => dispatch(projectActions.removeLayer(layerId))}
              onDeleteRange={(rangeId) => dispatch(projectActions.removeRange(rangeId))}
              onDuplicateLayer={(layerId, name) =>
                dispatch(projectActions.duplicateLayer({ layerId, name }))
              }
              onHoverLayer={(layerId) => dispatch(editorActions.setHoveredLayerId(layerId))}
              onOpenLayerProperties={openLayerProperties}
              onOpenProjectSettings={() => {
                dismissRangeDependencyWarning();
                dispatch(editorActions.setSidebarMode("project-settings"));
              }}
              onOpenRangeProperties={openRangeProperties}
              onReorderLayer={(layerId, targetIndex) =>
                dispatch(projectActions.reorderLayer({ layerId, targetIndex }))
              }
              onToggleLayerVisibility={(layerId) => {
                const layer = project.layers.find((item) => item.id === layerId);
                if (layer) commitLayer({ ...layer, visible: !layer.visible });
              }}
              project={project}
              ranges={project.ranges}
            />
          }
          mode={sidebarMode}
          projectSettings={
            <ProjectSettingsPanel
              angleSnap={String(snapping.angleDegrees)}
              background={project.canvas.background}
              canvasHeight={String(project.canvas.heightMm)}
              canvasWidth={String(project.canvas.widthMm)}
              distanceSnap={String(snapping.distanceMm)}
              onAngleSnapChange={(value) => updateSnapping({ angleDegrees: Number(value) })}
              onBack={() => {
                dismissRangeDependencyWarning();
                dispatch(editorActions.setSidebarMode("layers"));
              }}
              onBackgroundChange={(value) => updateCanvas({ background: value })}
              onCanvasHeightChange={(value) => updateCanvas({ heightMm: Number(value) })}
              onCanvasWidthChange={(value) => updateCanvas({ widthMm: Number(value) })}
              onDistanceSnapChange={(value) => updateSnapping({ distanceMm: Number(value) })}
              onHistoryTransactionEnd={() => dispatch(completeProjectHistoryTransaction())}
              onHistoryTransactionStart={() => dispatch(beginProjectHistoryTransaction())}
              onSnapEnabledChange={(enabled) => updateSnapping({ enabled })}
              onTransparentBackgroundChange={(enabled) =>
                updateCanvas({ transparentBackground: enabled })
              }
              snapEnabled={snapping.enabled}
              transparentBackground={project.canvas.transparentBackground}
            />
          }
          properties={
            <PropertiesPanel
              canvas={project.canvas}
              onBack={() => {
                dismissRangeDependencyWarning();
                dispatch(editorActions.setSidebarMode("layers"));
              }}
              onCreateLayer={createLayer}
              onHistoryTransactionEnd={() => dispatch(completeProjectHistoryTransaction())}
              onHistoryTransactionStart={() => dispatch(beginProjectHistoryTransaction())}
              onLayerChange={updateSelectedLayer}
              onLayerPreviewModifiersChange={(modifiers) =>
                dispatch(editorActions.setLayerPreviewModifiers(modifiers))
              }
              onLayerRangeChange={(rangeId) => updateSelectedLayer({ rangeId })}
              onNameChange={renameSelectedObject}
              onRangeChange={updateSelectedRange}
              onResetLayer={resetSelectedLayer}
              ranges={project.ranges}
              layerPreviewModifiers={layerPreviewModifiers}
              selectedLayer={selectedLayer}
              selectedName={selectedName}
              selectedObject={selectedObject}
              selectedRange={selectedRange}
              snapping={snapping}
            />
          }
        />
        <CanvasPreview
          onBrowseExamples={() => undefined}
          onCreateRange={createProjectRange}
          onLayerChange={commitLayer}
          onLayerInteractionEnd={() => dispatch(completeProjectHistoryTransaction())}
          onLayerInteractionStart={() => dispatch(beginProjectHistoryTransaction())}
          onSelectLayer={openLayerFromCanvas}
          onRangeChange={commitRange}
          onRangeInteractionEnd={() => dispatch(completeProjectHistoryTransaction())}
          onRangeInteractionStart={() => dispatch(beginProjectHistoryTransaction())}
          hoveredLayerId={hoveredLayerId}
          layerPreviewModifiers={layerPreviewModifiers}
          project={project}
          selectedLayer={sidebarMode === "properties" ? selectedLayer : undefined}
          selectedRange={sidebarMode === "properties" ? selectedRange : undefined}
          snapping={snapping}
        />
      </section>
    </main>
  );
}
