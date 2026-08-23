"use client";

import { useTranslations } from "next-intl";
import { EditorSidebar } from "@/features/editor/editor-sidebar/editor-sidebar";
import { useEditorShell } from "@/features/editor/editor-shell/editor-shell-context";
import { LayersBrowser } from "@/features/editor/layers-browser/layers-browser";
import { ProjectSettingsPanel } from "@/features/editor/project-settings-panel/project-settings-panel";
import { PropertiesPanel } from "@/features/editor/properties-panel/properties-panel";

export function EditorShellSidebar() {
  const t = useTranslations("Editor");
  const { actions, state } = useEditorShell();
  const {
    layerPreviewModifiers,
    project,
    selectedLayer,
    selectedName,
    selectedObject,
    selectedRange,
    sidebarMode,
    snapping,
  } = state;

  return (
    <EditorSidebar
      ariaLabel={t("layers.sidebarAriaLabel")}
      layers={
        <LayersBrowser
          layers={project.layers}
          onCreateLayer={actions.openLayerPicker}
          onCreateRange={actions.createProjectRange}
          onDeleteLayer={actions.removeLayer}
          onDeleteRange={actions.removeRange}
          onDuplicateLayer={actions.duplicateLayer}
          onHoverLayer={actions.setHoveredLayerId}
          onOpenLayerProperties={actions.openLayerProperties}
          onOpenProjectSettings={actions.openProjectSettings}
          onOpenRangeProperties={actions.openRangeProperties}
          onReorderLayer={actions.reorderLayer}
          onToggleLayerVisibility={actions.toggleLayerVisibility}
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
          onAngleSnapChange={(value) => actions.updateSnapping({ angleDegrees: Number(value) })}
          onBack={actions.closeSidebarPanel}
          onBackgroundChange={(value) => actions.updateCanvas({ background: value })}
          onCanvasHeightChange={(value) => actions.updateCanvas({ heightMm: Number(value) })}
          onCanvasWidthChange={(value) => actions.updateCanvas({ widthMm: Number(value) })}
          onDistanceSnapChange={(value) => actions.updateSnapping({ distanceMm: Number(value) })}
          onHistoryTransactionEnd={actions.completeHistoryTransaction}
          onHistoryTransactionStart={actions.beginHistoryTransaction}
          onTitleChange={actions.updateProjectTitle}
          onSnapEnabledChange={(enabled) => actions.updateSnapping({ enabled })}
          onTransparentBackgroundChange={(enabled) =>
            actions.updateCanvas({ transparentBackground: enabled })
          }
          snapEnabled={snapping.enabled}
          title={project.meta.title}
          transparentBackground={project.canvas.transparentBackground}
        />
      }
      properties={
        <PropertiesPanel
          canvas={project.canvas}
          layerPreviewModifiers={layerPreviewModifiers}
          onBack={actions.closeSidebarPanel}
          onCreateLayer={actions.createLayer}
          onHistoryTransactionEnd={actions.completeHistoryTransaction}
          onHistoryTransactionStart={actions.beginHistoryTransaction}
          onLayerChange={actions.updateSelectedLayer}
          onLayerPreviewModifiersChange={actions.setLayerPreviewModifiers}
          onLayerRangeChange={(rangeId) => actions.updateSelectedLayer({ rangeId })}
          onNameChange={actions.renameSelectedObject}
          onRangeChange={actions.updateSelectedRange}
          onResetLayer={actions.resetSelectedLayer}
          ranges={project.ranges}
          selectedLayer={selectedLayer}
          selectedName={selectedName}
          selectedObject={selectedObject}
          selectedRange={selectedRange}
          snapping={snapping}
        />
      }
    />
  );
}
