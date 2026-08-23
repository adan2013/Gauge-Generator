"use client";

import { CanvasPreview } from "@/features/editor/canvas-preview/canvas-preview";
import { useEditorShell } from "@/features/editor/editor-shell/editor-shell-context";

export function EditorShellCanvas() {
  const { actions, state } = useEditorShell();
  const {
    hoveredLayerId,
    layerPreviewModifiers,
    project,
    selectedLayer,
    selectedRange,
    sidebarMode,
    snapping,
  } = state;

  return (
    <CanvasPreview
      hoveredLayerId={hoveredLayerId}
      layerPreviewModifiers={layerPreviewModifiers}
      onBrowseExamples={actions.browseExamples}
      onCreateRange={actions.createProjectRange}
      onLayerChange={actions.commitLayer}
      onLayerInteractionEnd={actions.completeHistoryTransaction}
      onLayerInteractionStart={actions.beginHistoryTransaction}
      onRangeChange={actions.commitRange}
      onRangeInteractionEnd={actions.completeHistoryTransaction}
      onRangeInteractionStart={actions.beginHistoryTransaction}
      onSelectLayer={actions.openLayerFromCanvas}
      project={project}
      selectedLayer={sidebarMode === "properties" ? selectedLayer : undefined}
      selectedRange={sidebarMode === "properties" ? selectedRange : undefined}
      snapping={snapping}
    />
  );
}
