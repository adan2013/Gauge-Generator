"use client";

import { useState } from "react";
import {
  BookOpen,
  Download,
  FileDown,
  FilePlus2,
  FolderOpen,
  HelpCircle,
  History,
  Redo2,
  Undo2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { StatusMessage } from "@/components/molecules/status-message/status-message";
import { CanvasPreview } from "@/features/editor/canvas-preview/canvas-preview";
import { EditorSidebar } from "@/features/editor/editor-sidebar/editor-sidebar";
import {
  EditorToolbar,
  type EditorToolbarAction,
} from "@/features/editor/editor-toolbar/editor-toolbar";
import { LayersBrowser } from "@/features/editor/layers-browser/layers-browser";
import { ProjectSettingsPanel } from "@/features/editor/project-settings-panel/project-settings-panel";
import { PropertiesPanel } from "@/features/editor/properties-panel/properties-panel";
import {
  createRange,
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
  const [status, setStatus] = useState("");
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
  const announce = (action: string) => setStatus(t("status.placeholder", { action }));
  const openRangeProperties = (rangeId: string) => {
    dispatch(editorActions.setSelectedObject({ collection: "ranges", id: rangeId }));
    dispatch(editorActions.setSidebarMode("properties"));
    setStatus(t("status.rangeOpened"));
  };
  const openLayerProperties = (layerId: string) => {
    dispatch(editorActions.setSelectedObject({ collection: "layers", id: layerId }));
    dispatch(editorActions.setSidebarMode("properties"));
    setStatus(t("status.layerOpened"));
  };
  function createProjectRange() {
    if (project.ranges.length >= MAX_RANGES) return;
    const range = createRange({
      name: t("ranges.defaultName", { number: project.ranges.length + 1 }),
    });
    dispatch(projectActions.addRange(range));
    openRangeProperties(range.id);
  }
  function openLayerPicker() {
    if (!project.ranges[0]) {
      setStatus(t("status.rangeRequired"));
      return;
    }
    dispatch(editorActions.setSelectedObject(null));
    dispatch(editorActions.setSidebarMode("properties"));
    setStatus(t("status.layerPickerOpened"));
  }
  function createLayer(type: LayerType) {
    const sourceRange = project.ranges.at(-1);
    if (!sourceRange) return;
    const name = t("layers.defaultName", { number: project.layers.length + 1 });
    const layer = createLayerFromType(type, sourceRange.id, { name });
    dispatch(projectActions.addLayer(layer));
    openLayerProperties(layer.id);
  }
  function renameSelectedObject(name: string) {
    if (!selectedObject) return;
    if (selectedObject.collection === "ranges") {
      const range = project.ranges.find((item) => item.id === selectedObject.id);
      if (range) dispatch(projectActions.updateRange({ ...range, name }));
      return;
    }
    const layer = project.layers.find((item) => item.id === selectedObject.id);
    if (layer) dispatch(projectActions.updateLayer({ ...layer, name }));
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
  const updateSelectedRange = (change: Partial<RangeDto>) => {
    if (selectedRange) dispatch(projectActions.updateRange({ ...selectedRange, ...change }));
  };
  const updateSelectedLayer = (change: Partial<LayerDto>) => {
    if (!selectedLayer) return;
    dispatch(projectActions.updateLayer({ ...selectedLayer, ...change } as LayerDto));
  };
  const resetSelectedLayer = () => {
    if (!selectedLayer) return;
    dispatch(projectActions.updateLayer(resetLayerToDefaults(selectedLayer)));
    setStatus(t("status.layerReset"));
  };
  const updateCanvas = (change: Partial<typeof project.canvas>) =>
    dispatch(projectActions.setCanvas({ ...project.canvas, ...change }));
  const updateSnapping = (change: Partial<typeof snapping>) =>
    dispatch(editorActions.setSnapping({ ...snapping, ...change }));
  function handleToolbarAction(action: EditorToolbarAction) {
    if (action.id === "undo") {
      dispatch(undoProject());
      setStatus(t("status.undo"));
      return;
    }
    if (action.id === "redo") {
      dispatch(redoProject());
      setStatus(t("status.redo"));
      return;
    }
    announce(action.label);
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
              onDuplicateLayer={(layerId) => dispatch(projectActions.duplicateLayer(layerId))}
              onHoverLayer={(layerId) => dispatch(editorActions.setHoveredLayerId(layerId))}
              onOpenLayerProperties={openLayerProperties}
              onOpenProjectSettings={() =>
                dispatch(editorActions.setSidebarMode("project-settings"))
              }
              onOpenRangeProperties={openRangeProperties}
              onReorderLayer={(layerId, targetIndex) =>
                dispatch(projectActions.reorderLayer({ layerId, targetIndex }))
              }
              onToggleLayerVisibility={(layerId) => {
                const layer = project.layers.find((item) => item.id === layerId);
                if (layer)
                  dispatch(projectActions.updateLayer({ ...layer, visible: !layer.visible }));
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
              onBack={() => dispatch(editorActions.setSidebarMode("layers"))}
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
              onBack={() => dispatch(editorActions.setSidebarMode("layers"))}
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
          onBrowseExamples={() => announce(t("toolbar.examples"))}
          onCreateRange={createProjectRange}
          onLayerChange={(layer) => dispatch(projectActions.updateLayer(layer))}
          onLayerInteractionEnd={() => dispatch(completeProjectHistoryTransaction())}
          onLayerInteractionStart={() => dispatch(beginProjectHistoryTransaction())}
          onRangeChange={(range) => dispatch(projectActions.updateRange(range))}
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
      <StatusMessage>{status}</StatusMessage>
    </main>
  );
}
