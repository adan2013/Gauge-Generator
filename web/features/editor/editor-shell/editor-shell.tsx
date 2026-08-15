"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpen, ChevronLeft, ChevronRight, Download, FileDown, FilePlus2, FolderOpen, HelpCircle, History, Layers3, MoreHorizontal, Plus, Redo2, Settings2, Undo2, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { FieldRow } from "@/components/molecules/field-row/field-row";
import { StatusMessage } from "@/components/molecules/status-message/status-message";
import { Range } from "@/features/layers/range/range";
import { createRange as createRangeDto, createTickScaleLayer } from "@/features/project/factories/project-factories";
import { CANVAS_DIMENSION_MAX_MM, CANVAS_DIMENSION_MIN_MM, type CanvasDto, type LayerDto, type RangeDto } from "@/features/project/project-dto/project-dto";
import { editorActions, type EditorSelection } from "@/store/editor-slice";
import { beginProjectHistoryTransaction, completeProjectHistoryTransaction, redoProject, undoProject } from "@/store/history-actions";
import { projectActions } from "@/store/project-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type ToolbarAction = { id: string; label: string; icon: LucideIcon; disabled?: boolean };

export function EditorShell() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const project = useAppSelector((state) => state.project.current);
  const { selectedObject, sidebarMode, snapping } = useAppSelector((state) => state.editor);
  const { past, future } = useAppSelector((state) => state.history);
  const t = useTranslations("Editor");

  const toolbarActions: ToolbarAction[] = [
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
  const [status, setStatus] = useState("");

  function announce(action: string) {
    setStatus(t("status.placeholder", { action }));
  }

  function handleToolbarAction(action: ToolbarAction) {
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

  function openRangeProperties(rangeId: string) {
    dispatch(editorActions.setSelectedObject({ collection: "ranges", id: rangeId }));
    dispatch(editorActions.setSidebarMode("properties"));
    setStatus(t("status.rangeOpened"));
  }

  function createRange() {
    const range = createRangeDto({ name: t("ranges.defaultName", { number: project.ranges.length + 1 }) });
    dispatch(projectActions.addRange(range));
    openRangeProperties(range.id);
  }

  function createLayer() {
    const sourceRange = project.ranges[0];
    if (!sourceRange) {
      setStatus(t("status.rangeRequired"));
      return;
    }

    const layer = createTickScaleLayer(sourceRange.id, { name: t("layers.defaultName", { number: project.layers.length + 1 }) });
    dispatch(projectActions.addLayer(layer));
    dispatch(editorActions.setSelectedObject({ collection: "layers", id: layer.id }));
    dispatch(editorActions.setSidebarMode("properties"));
    setStatus(t("status.layerOpened"));
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

  const selectedName = selectedObject?.collection === "ranges"
    ? project.ranges.find((range) => range.id === selectedObject.id)?.name ?? ""
    : project.layers.find((layer) => layer.id === selectedObject?.id)?.name ?? "";
  const selectedRange = selectedObject?.collection === "ranges" ? project.ranges.find((range) => range.id === selectedObject.id) : undefined;

  function updateSelectedRange(change: Partial<RangeDto>) {
    if (!selectedRange) return;
    dispatch(projectActions.updateRange({ ...selectedRange, ...change }));
  }

  function updateCanvas(change: Partial<typeof project.canvas>) {
    dispatch(projectActions.setCanvas({ ...project.canvas, ...change }));
  }

  function updateSnapping(change: Partial<typeof snapping>) {
    dispatch(editorActions.setSnapping({ ...snapping, ...change }));
  }

  const sidebarTransform = {
    layers: "translateX(-33.333333%)",
    properties: "translateX(-66.666667%)",
    "project-settings": "translateX(0)",
  }[sidebarMode];

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-app text-ink">
      <header className="flex min-h-16 items-center gap-3 border-b border-border bg-surface px-3 sm:px-5">
        <Link className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 font-semibold tracking-tight text-ink hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/">
          <span className="grid size-7 place-items-center rounded-md bg-accent text-xs font-bold text-white">GG</span>
          <span className="hidden lg:inline">{t("brand")}</span>
        </Link>

        <ResponsiveToolbar actions={toolbarActions} onAction={handleToolbarAction} onOpenHelp={() => router.push("/app/help")} />
      </header>

      <section className="flex min-h-0 flex-1 overflow-hidden">
        <aside aria-label={t("layers.sidebarAriaLabel")} className="min-h-0 w-[min(100%,23rem)] shrink-0 border-r border-border bg-surface">
          <div className="h-full overflow-hidden">
            <div className="flex h-full w-[300%] transition-transform duration-300 ease-out" style={{ transform: sidebarTransform }}>
              <ProjectSettingsView angleSnap={String(snapping.angleDegrees)} canvasHeight={String(project.canvas.heightMm)} canvasWidth={String(project.canvas.widthMm)} distanceSnap={String(snapping.distanceMm)} onAngleSnapChange={(value) => updateSnapping({ angleDegrees: Number(value) })} onBack={() => dispatch(editorActions.setSidebarMode("layers"))} onCanvasHeightChange={(value) => updateCanvas({ heightMm: Number(value) })} onCanvasWidthChange={(value) => updateCanvas({ widthMm: Number(value) })} onDistanceSnapChange={(value) => updateSnapping({ distanceMm: Number(value) })} onHistoryTransactionEnd={() => dispatch(completeProjectHistoryTransaction())} onHistoryTransactionStart={() => dispatch(beginProjectHistoryTransaction())} onSnapEnabledChange={(enabled) => updateSnapping({ enabled })} snapEnabled={snapping.enabled} />
              <LayersView layers={project.layers} onCreateLayer={createLayer} onCreateRange={createRange} onOpenProjectSettings={() => dispatch(editorActions.setSidebarMode("project-settings"))} onOpenRangeProperties={openRangeProperties} ranges={project.ranges} />
              <PropertiesView canvas={project.canvas} centerX={String(selectedRange?.centerX ?? 60)} centerY={String(selectedRange?.centerY ?? 60)} onBack={() => dispatch(editorActions.setSidebarMode("layers"))} onCenterXChange={(value) => updateSelectedRange({ centerX: Number(value) })} onCenterYChange={(value) => updateSelectedRange({ centerY: Number(value) })} onHistoryTransactionEnd={() => dispatch(completeProjectHistoryTransaction())} onHistoryTransactionStart={() => dispatch(beginProjectHistoryTransaction())} onNameChange={renameSelectedObject} onOpeningAngleChange={(value) => updateSelectedRange({ openingAngle: Number(value) })} onRadiusChange={(value) => updateSelectedRange({ radius: Number(value) })} openingAngle={String(selectedRange?.openingAngle ?? 240)} radius={String(selectedRange?.radius ?? 48)} selectedName={selectedName} selectedObject={selectedObject} selectedRange={selectedRange} />
            </div>
          </div>
        </aside>

        <CanvasPreview canvasHeight={project.canvas.heightMm} canvasWidth={project.canvas.widthMm} hasRange={project.ranges.length > 0} hasVisualLayer={project.layers.length > 0} onBrowseExamples={() => announce(t("toolbar.examples"))} onCreateLayer={createLayer} onCreateRange={createRange} />
      </section>

      <StatusMessage>{status}</StatusMessage>
    </main>
  );
}

type ResponsiveToolbarProps = { actions: ToolbarAction[]; onAction: (action: ToolbarAction) => void; onOpenHelp: () => void };

function ResponsiveToolbar({ actions, onAction, onOpenHelp }: ResponsiveToolbarProps) {
  const t = useTranslations("Editor");
  const containerRef = useRef<HTMLDivElement>(null);
  const measurementRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [visibleCount, setVisibleCount] = useState(actions.length);

  useLayoutEffect(() => {
    function calculateVisibleActions() {
      const availableWidth = containerRef.current?.clientWidth ?? 0;
      const actionWidths = measurementRefs.current.map((element) => element?.getBoundingClientRect().width ?? 0);
      const moreWidth = 40;
      const gap = 4;
      let usedWidth = 0;
      let nextVisibleCount = 0;

      for (let index = 0; index < actionWidths.length; index += 1) {
        const actionWidth = actionWidths[index];
        const actionGap = nextVisibleCount > 0 ? gap : 0;
        const mustReserveMore = index < actionWidths.length - 1 ? moreWidth + gap : 0;

        if (usedWidth + actionGap + actionWidth + mustReserveMore > availableWidth) break;

        usedWidth += actionGap + actionWidth;
        nextVisibleCount += 1;
      }

      setVisibleCount(nextVisibleCount);
    }

    calculateVisibleActions();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(calculateVisibleActions);
    if (containerRef.current && observer) observer.observe(containerRef.current);
    return () => observer?.disconnect();
  }, []);

  const visibleActions = actions.slice(0, visibleCount);
  const overflowActions = actions.slice(visibleCount);

  function handleAction(action: ToolbarAction) {
    if (action.disabled) return;
    if (action.id === "helpCenter") {
      onOpenHelp();
      return;
    }
    onAction(action);
  }

  return (
    <nav aria-label={t("toolbar.ariaLabel")} className="ml-auto min-w-0 flex-1">
      <div className="relative flex justify-end gap-1" ref={containerRef}>
        <div aria-hidden="true" className="pointer-events-none absolute invisible flex gap-1 whitespace-nowrap">
          {actions.map(({ icon, label, id }, index) => (
            <span key={id} ref={(element) => { measurementRefs.current[index] = element; }}>
              <ActionButton icon={icon} label={label} variant="quiet" />
            </span>
          ))}
        </div>
        {visibleActions.map((action) => (
          <ActionButton disabled={action.disabled} icon={action.icon} key={action.id} label={action.label} onClick={() => handleAction(action)} variant="quiet" />
        ))}
        {overflowActions.length > 0 ? (
          <details className="relative shrink-0">
            <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg text-muted hover:bg-surface-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
              <MoreHorizontal aria-hidden="true" size={18} />
              <span className="sr-only">{t("toolbar.moreActions")}</span>
            </summary>
            <div className="absolute right-0 top-11 z-30 flex w-52 flex-col gap-1 rounded-xl border border-border bg-surface p-2 shadow-[0_16px_40px_rgba(32,36,43,0.16)]">
              {overflowActions.map((action) => (
                <ActionButton className="justify-start" disabled={action.disabled} icon={action.icon} key={action.id} label={action.label} onClick={() => handleAction(action)} variant="quiet" />
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </nav>
  );
}

type LayersViewProps = {
  layers: LayerDto[];
  ranges: RangeDto[];
  onCreateLayer: () => void;
  onCreateRange: () => void;
  onOpenProjectSettings: () => void;
  onOpenRangeProperties: (rangeId: string) => void;
};

function LayersView({ layers, onCreateLayer, onCreateRange, onOpenProjectSettings, onOpenRangeProperties, ranges }: LayersViewProps) {
  const t = useTranslations("Editor.layers");
  const rangesT = useTranslations("Editor.ranges");
  return (
    <section aria-label={t("title")} className="flex h-full w-1/3 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2"><Layers3 aria-hidden="true" className="shrink-0 text-accent" size={18} /><h1 className="truncate font-semibold">{t("title")}</h1></div>
        <div className="flex shrink-0 items-center gap-2"><ActionButton icon={Settings2} label={t("projectSettings")} onClick={onOpenProjectSettings} variant="quiet" /><ActionButton disabled={ranges.length === 0} icon={Plus} label={t("addLayer")} onClick={onCreateLayer} variant="primary" /></div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <section aria-labelledby="layers-list-heading" className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between gap-3"><h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted" id="layers-list-heading">{t("visualLayers")}</h2><span className="text-xs text-muted">{layers.length}</span></div>
          {layers.length === 0 ? <p className="mt-3 text-sm leading-6 text-muted">{t("emptyDescription")}</p> : <ul className="mt-3 space-y-2">{layers.map((layer) => <li className="rounded-lg border border-border bg-app px-3 py-2" key={layer.id}><p className="text-sm font-medium text-ink">{layer.name}</p><p className="mt-0.5 text-xs text-muted">{layer.type}</p></li>)}</ul>}
        </section>
        <section aria-labelledby="ranges-list-heading" className="max-h-[45%] shrink-0 overflow-y-auto border-t border-border p-4">
          <div className="flex items-center justify-between gap-3"><h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted" id="ranges-list-heading">{rangesT("title")}</h2><span className="text-xs text-muted">{ranges.length}</span></div>
          {ranges.length === 0 ? <p className="mt-3 text-sm leading-6 text-muted">{rangesT("emptyDescription")}</p> : <ul className="mt-3 space-y-2">{ranges.map((range) => <li key={range.id}><button className="flex w-full items-center justify-between rounded-lg border border-border bg-app px-3 py-2 text-left hover:border-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" onClick={() => onOpenRangeProperties(range.id)} type="button"><span className="text-sm font-medium text-ink">{range.name}</span><span className="rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-medium text-accent">{rangesT("type")}</span></button></li>)}</ul>}
          <ActionButton className="mt-4 w-full justify-center" icon={Plus} label={ranges.length === 0 ? t("createFirstRange") : rangesT("add")} onClick={onCreateRange} variant={ranges.length === 0 ? "primary" : "quiet"} />
        </section>
      </div>
    </section>
  );
}

type ProjectSettingsViewProps = {
  angleSnap: string; canvasHeight: string; canvasWidth: string; distanceSnap: string; snapEnabled: boolean;
  onAngleSnapChange: (value: string) => void; onBack: () => void; onCanvasHeightChange: (value: string) => void; onCanvasWidthChange: (value: string) => void; onDistanceSnapChange: (value: string) => void; onHistoryTransactionEnd: () => void; onHistoryTransactionStart: () => void; onSnapEnabledChange: (value: boolean) => void;
};

function ProjectSettingsView({ angleSnap, canvasHeight, canvasWidth, distanceSnap, onAngleSnapChange, onBack, onCanvasHeightChange, onCanvasWidthChange, onDistanceSnapChange, onHistoryTransactionEnd, onHistoryTransactionStart, onSnapEnabledChange, snapEnabled }: ProjectSettingsViewProps) {
  const t = useTranslations("Editor");
  return (
    <section aria-label={t("projectSettings.ariaLabel")} className="flex h-full w-1/3 flex-col">
      <div className="border-b border-border p-3"><ActionButton className="w-full justify-start" icon={ChevronRight} label={t("controls.backToLayers")} onClick={onBack} variant="quiet" /></div>
      <div className="overflow-y-auto p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">{t("projectSettings.eyebrow")}</p><h2 className="mt-1 text-xl font-semibold">{t("projectSettings.title")}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{t("projectSettings.description")}</p>
        <PropertyGroup title={t("projectSettings.canvas")}><RangePropertyRow label={t("projectSettings.width")} max={CANVAS_DIMENSION_MAX_MM} min={CANVAS_DIMENSION_MIN_MM} onChange={onCanvasWidthChange} onInteractionEnd={onHistoryTransactionEnd} onInteractionStart={onHistoryTransactionStart} step={1} suffix={t("controls.millimeters")} value={canvasWidth} /><RangePropertyRow label={t("projectSettings.height")} max={CANVAS_DIMENSION_MAX_MM} min={CANVAS_DIMENSION_MIN_MM} onChange={onCanvasHeightChange} onInteractionEnd={onHistoryTransactionEnd} onInteractionStart={onHistoryTransactionStart} step={1} suffix={t("controls.millimeters")} value={canvasHeight} /></PropertyGroup>
        <PropertyGroup title={t("projectSettings.snapping")}><label className="flex items-center justify-between gap-4 py-3 text-sm"><span className="text-muted">{t("projectSettings.enableSnapping")}</span><input aria-label={t("projectSettings.enableSnapping")} checked={snapEnabled} className="size-4 accent-accent" onChange={(event) => onSnapEnabledChange(event.target.checked)} type="checkbox" /></label><RangePropertyRow label={t("projectSettings.distanceIncrement")} max={20} min={1} onChange={onDistanceSnapChange} onInteractionEnd={onHistoryTransactionEnd} onInteractionStart={onHistoryTransactionStart} step={1} suffix={t("controls.millimeters")} value={distanceSnap} /><RangePropertyRow label={t("projectSettings.angleIncrement")} max={45} min={1} onChange={onAngleSnapChange} onInteractionEnd={onHistoryTransactionEnd} onInteractionStart={onHistoryTransactionStart} step={1} suffix={t("controls.degrees")} value={angleSnap} /></PropertyGroup>
      </div>
    </section>
  );
}

type PropertiesViewProps = { canvas: CanvasDto; centerX: string; centerY: string; openingAngle: string; radius: string; selectedName: string; selectedObject: EditorSelection; selectedRange: RangeDto | undefined; onBack: () => void; onCenterXChange: (value: string) => void; onCenterYChange: (value: string) => void; onHistoryTransactionEnd: () => void; onHistoryTransactionStart: () => void; onNameChange: (value: string) => void; onOpeningAngleChange: (value: string) => void; onRadiusChange: (value: string) => void };

function PropertiesView({ canvas, centerX, centerY, onBack, onCenterXChange, onCenterYChange, onHistoryTransactionEnd, onHistoryTransactionStart, onNameChange, onOpeningAngleChange, onRadiusChange, openingAngle, radius, selectedName, selectedObject, selectedRange }: PropertiesViewProps) {
  const t = useTranslations("Editor");
  const isRange = selectedObject?.collection !== "layers";
  const rangeFields = selectedRange ? new Range(selectedRange).getNumericPropertyDefinitions(canvas) : undefined;
  return (
    <section aria-label={isRange ? t("range.ariaLabel") : t("layers.propertiesAriaLabel")} className="flex h-full w-1/3 flex-col">
      <div className="border-b border-border p-3"><ActionButton className="w-full justify-start" icon={ChevronLeft} label={t("controls.backToLayers")} onClick={onBack} variant="quiet" /></div>
      <div className="overflow-y-auto p-4">
        {isRange && rangeFields ? <><p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">{t("range.eyebrow")}</p><h2 className="mt-1 text-xl font-semibold">{t("range.title")}</h2><p className="mt-2 text-sm leading-6 text-muted">{t("range.description")}</p><PropertyGroup title={t("controls.identity")}><TextPropertyRow label={t("controls.name")} onChange={onNameChange} onInteractionEnd={onHistoryTransactionEnd} onInteractionStart={onHistoryTransactionStart} value={selectedName} /></PropertyGroup><PropertyGroup title={t("range.position")}><RangePropertyRow label={t("range.centerX")} max={rangeFields.centerX.max} min={rangeFields.centerX.min} onChange={onCenterXChange} onInteractionEnd={onHistoryTransactionEnd} onInteractionStart={onHistoryTransactionStart} step={rangeFields.centerX.step} suffix={t("controls.millimeters")} value={centerX} /><RangePropertyRow label={t("range.centerY")} max={rangeFields.centerY.max} min={rangeFields.centerY.min} onChange={onCenterYChange} onInteractionEnd={onHistoryTransactionEnd} onInteractionStart={onHistoryTransactionStart} step={rangeFields.centerY.step} suffix={t("controls.millimeters")} value={centerY} /></PropertyGroup><PropertyGroup title={t("range.scale")}><RangePropertyRow label={t("range.radius")} max={rangeFields.radius.max} min={rangeFields.radius.min} onChange={onRadiusChange} onInteractionEnd={onHistoryTransactionEnd} onInteractionStart={onHistoryTransactionStart} step={rangeFields.radius.step} suffix={t("controls.millimeters")} value={radius} /><RangePropertyRow label={t("range.openingAngle")} max={rangeFields.openingAngle.max} min={rangeFields.openingAngle.min} onChange={onOpeningAngleChange} onInteractionEnd={onHistoryTransactionEnd} onInteractionStart={onHistoryTransactionStart} step={rangeFields.openingAngle.step} suffix={t("controls.degrees")} value={openingAngle} /></PropertyGroup></> : <><p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">{t("layers.eyebrow")}</p><h2 className="mt-1 text-xl font-semibold">{t("layers.propertiesTitle")}</h2><p className="mt-2 text-sm leading-6 text-muted">{t("layers.propertiesDescription")}</p><PropertyGroup title={t("controls.identity")}><TextPropertyRow label={t("controls.name")} onChange={onNameChange} onInteractionEnd={onHistoryTransactionEnd} onInteractionStart={onHistoryTransactionStart} value={selectedName} /></PropertyGroup></>}
      </div>
    </section>
  );
}

type CanvasPreviewProps = { canvasHeight: number; canvasWidth: number; hasRange: boolean; hasVisualLayer: boolean; onBrowseExamples: () => void; onCreateLayer: () => void; onCreateRange: () => void };

function CanvasPreview({ canvasHeight, canvasWidth, hasRange, hasVisualLayer, onBrowseExamples, onCreateLayer, onCreateRange }: CanvasPreviewProps) {
  const t = useTranslations("Editor");
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const isEmptyProject = !hasRange;
  const showsFirstLayerPrompt = hasRange && !hasVisualLayer;
  const canvasAspectRatio = hasVisualLayer ? `${canvasWidth} / ${canvasHeight}` : "1 / 1";
  const aspectRatio = hasVisualLayer ? canvasWidth / canvasHeight : 1;
  const frameWidth = viewportSize.width > 0 && viewportSize.height > 0 ? Math.min(viewportSize.width, viewportSize.height * aspectRatio) : undefined;
  const frameHeight = frameWidth ? frameWidth / aspectRatio : undefined;
  const zoomPercent = hasVisualLayer && frameWidth ? Math.round((frameWidth / (canvasWidth * (96 / 25.4))) * 100) : undefined;

  useLayoutEffect(() => {
    function measureViewport() {
      const viewport = viewportRef.current;
      if (!viewport) return;
      setViewportSize({ width: viewport.clientWidth, height: viewport.clientHeight });
    }

    measureViewport();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measureViewport);
    if (viewportRef.current && observer) observer.observe(viewportRef.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section aria-label={t("canvas.ariaLabel")} className="relative flex min-w-0 flex-1 overflow-hidden p-6 sm:p-10">
      <div className="flex size-full min-h-0 min-w-0 items-center justify-center" ref={viewportRef}>
        <div className="relative shrink-0 rounded-sm border border-border bg-white shadow-[0_20px_65px_rgba(32,36,43,0.1)]" data-testid="canvas-frame" style={{ aspectRatio: canvasAspectRatio, height: frameHeight, width: frameWidth }}>
          {isEmptyProject || showsFirstLayerPrompt ? <div className="absolute inset-0 grid place-items-center p-8 text-center">
            <div>
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-accent-subtle text-accent"><Plus aria-hidden="true" size={30} strokeWidth={1.6} /></div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">{showsFirstLayerPrompt ? t("canvas.rangeReadyTitle") : t("canvas.emptyTitle")}</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">{showsFirstLayerPrompt ? t("canvas.rangeReadyDescription") : t("canvas.emptyDescription")}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {showsFirstLayerPrompt ? <ActionButton icon={Plus} label={t("layers.createFirstLayer")} onClick={onCreateLayer} variant="primary" /> : <ActionButton icon={Plus} label={t("layers.createFirstRange")} onClick={onCreateRange} variant="primary" />}
                {isEmptyProject ? <ActionButton icon={BookOpen} label={t("canvas.browseExamples")} onClick={onBrowseExamples} /> : null}
              </div>
            </div>
          </div> : <svg aria-label={t("canvas.previewAriaLabel")} className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid meet" role="img" viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} xmlns="http://www.w3.org/2000/svg" />}
      </div>
      <p aria-label={t("canvas.previewDetailsAriaLabel")} className="pointer-events-none absolute bottom-5 left-5 z-10 rounded-lg border border-border bg-surface/95 px-3 py-2 text-xs font-medium text-muted shadow-[0_12px_30px_rgba(32,36,43,0.12)]">
        {zoomPercent ? <><span>{t("canvas.zoom", { value: zoomPercent })}</span><span aria-hidden="true" className="mx-2 text-border">•</span></> : null}<span>{t("canvas.dimensions", { width: canvasWidth, height: canvasHeight })}</span>
      </p>
      </div>
    </section>
  );
}

type PropertyGroupProps = { title: string; children: React.ReactNode };
function PropertyGroup({ title, children }: PropertyGroupProps) {
  return <section className="mt-7"><h3 className="border-b border-border pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">{title}</h3><div className="divide-y divide-border">{children}</div></section>;
}

type RangePropertyRowProps = { label: string; max: number; min: number; step: number; suffix: string; value: string; onChange: (value: string) => void; onInteractionEnd: () => void; onInteractionStart: () => void };
type TextPropertyRowProps = { label: string; value: string; onChange: (value: string) => void; onInteractionEnd: () => void; onInteractionStart: () => void };
function TextPropertyRow({ label, onChange, onInteractionEnd, onInteractionStart, value }: TextPropertyRowProps) {
  const inputId = useId();
  return <FieldRow htmlFor={inputId} label={label}><input aria-label={label} className="w-full rounded-md border border-border bg-app px-2 py-1.5 text-right text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30" id={inputId} onBlur={onInteractionEnd} onChange={(event) => onChange(event.target.value)} onFocus={onInteractionStart} required type="text" value={value} /></FieldRow>;
}

function RangePropertyRow({ label, max, min, onChange, onInteractionEnd, onInteractionStart, step, suffix, value }: RangePropertyRowProps) {
  const t = useTranslations("Editor.controls");
  const inputId = useId();
  function handleChange(nextValue: string) {
    const numericValue = Number(nextValue);
    if (!Number.isFinite(numericValue)) return;
    onChange(String(Math.min(max, Math.max(min, numericValue))));
  }

  return (
    <FieldRow htmlFor={inputId} label={label}>
      <span className="relative block"><input aria-label={label} className="w-full rounded-md border border-border bg-app py-1.5 pr-8 pl-2 text-right text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30" id={inputId} inputMode="decimal" max={max} min={min} onBlur={onInteractionEnd} onChange={(event) => handleChange(event.target.value)} onFocus={onInteractionStart} type="number" value={value} /><span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted">{suffix}</span></span>
      <input aria-label={t("adjust", { label })} className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-accent" max={max} min={min} onBlur={onInteractionEnd} onChange={(event) => handleChange(event.target.value)} onFocus={onInteractionStart} onPointerDown={onInteractionStart} onPointerUp={onInteractionEnd} step={step} type="range" value={value} />
    </FieldRow>
  );
}
