"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpen, ChevronLeft, ChevronRight, Download, FileDown, FilePlus2, FolderOpen, HelpCircle, History, Layers3, MoreHorizontal, Plus, Redo2, Settings2, Undo2, Upload } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { StatusMessage } from "@/components/molecules/status-message/status-message";

type SidebarMode = "layers" | "properties" | "project-settings";
type ToolbarAction = { id: string; label: string; icon: LucideIcon };
type PrototypeRange = { id: string; name: string };
type PrototypeLayer = { id: string; name: string; rangeId: string; type: "Linear Scale" };
type SelectedObject = { collection: "layers" | "ranges"; id: string } | null;

export function EditorShell() {
  const router = useRouter();
  const t = useTranslations("Editor");
  const toolbarActions: ToolbarAction[] = [
    { id: "newProject", label: t("toolbar.newProject"), icon: FilePlus2 },
    { id: "open", label: t("toolbar.open"), icon: FolderOpen },
    { id: "download", label: t("toolbar.download"), icon: Download },
    { id: "import", label: t("toolbar.import"), icon: Upload },
    { id: "export", label: t("toolbar.export"), icon: FileDown },
    { id: "undo", label: t("toolbar.undo"), icon: Undo2 },
    { id: "redo", label: t("toolbar.redo"), icon: Redo2 },
    { id: "restore", label: t("toolbar.restore"), icon: History },
    { id: "examples", label: t("toolbar.examples"), icon: BookOpen },
    { id: "helpCenter", label: t("toolbar.helpCenter"), icon: HelpCircle },
  ];
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("layers");
  const [status, setStatus] = useState(t("status.prototype"));
  const [canvasWidth, setCanvasWidth] = useState("120");
  const [canvasHeight, setCanvasHeight] = useState("120");
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [distanceSnap, setDistanceSnap] = useState("2");
  const [angleSnap, setAngleSnap] = useState("10");
  const [rangeCenterX, setRangeCenterX] = useState("60");
  const [rangeCenterY, setRangeCenterY] = useState("60");
  const [rangeRadius, setRangeRadius] = useState("48");
  const [openingAngle, setOpeningAngle] = useState("240");
  const [layers, setLayers] = useState<PrototypeLayer[]>([]);
  const [ranges, setRanges] = useState<PrototypeRange[]>([]);
  const [selectedObject, setSelectedObject] = useState<SelectedObject>(null);

  function announce(action: string) {
    setStatus(t("status.placeholder", { action }));
  }

  function openRangeProperties(rangeId: string) {
    setSelectedObject({ collection: "ranges", id: rangeId });
    setSidebarMode("properties");
    setStatus(t("status.rangeOpened"));
  }

  function createRange() {
    const range: PrototypeRange = { id: crypto.randomUUID(), name: t("ranges.defaultName", { number: ranges.length + 1 }) };
    setRanges((currentRanges) => [...currentRanges, range]);
    openRangeProperties(range.id);
  }

  function createLayer() {
    const sourceRange = ranges[0];
    if (!sourceRange) {
      setStatus(t("status.rangeRequired"));
      return;
    }

    const layer: PrototypeLayer = {
      id: crypto.randomUUID(),
      name: t("layers.defaultName", { number: layers.length + 1 }),
      rangeId: sourceRange.id,
      type: "Linear Scale",
    };
    setLayers((currentLayers) => [...currentLayers, layer]);
    setSelectedObject({ collection: "layers", id: layer.id });
    setSidebarMode("properties");
    setStatus(t("status.layerOpened"));
  }

  function renameSelectedObject(name: string) {
    if (!selectedObject) return;

    if (selectedObject.collection === "ranges") {
      setRanges((currentRanges) => currentRanges.map((range) => range.id === selectedObject.id ? { ...range, name } : range));
      return;
    }

    setLayers((currentLayers) => currentLayers.map((layer) => layer.id === selectedObject.id ? { ...layer, name } : layer));
  }

  const selectedName = selectedObject?.collection === "ranges"
    ? ranges.find((range) => range.id === selectedObject.id)?.name ?? ""
    : layers.find((layer) => layer.id === selectedObject?.id)?.name ?? "";

  const sidebarTransform = {
    layers: "translateX(-33.333333%)",
    properties: "translateX(-66.666667%)",
    "project-settings": "translateX(0)",
  }[sidebarMode];

  return (
    <main className="flex min-h-dvh flex-col bg-app text-ink">
      <header className="flex min-h-16 items-center gap-3 border-b border-border bg-surface px-3 sm:px-5">
        <Link className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 font-semibold tracking-tight text-ink hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/">
          <span className="grid size-7 place-items-center rounded-md bg-accent text-xs font-bold text-white">GG</span>
          <span className="hidden lg:inline">{t("brand")}</span>
        </Link>

        <ResponsiveToolbar actions={toolbarActions} onAction={announce} onOpenHelp={() => router.push("/app/help")} />
      </header>

      <section className="flex min-h-0 flex-1 overflow-hidden">
        <aside aria-label={t("layers.sidebarAriaLabel")} className="w-[min(100%,23rem)] shrink-0 border-r border-border bg-surface">
          <div className="h-full overflow-hidden">
            <div className="flex h-full w-[300%] transition-transform duration-300 ease-out" style={{ transform: sidebarTransform }}>
              <ProjectSettingsView angleSnap={angleSnap} canvasHeight={canvasHeight} canvasWidth={canvasWidth} distanceSnap={distanceSnap} onAngleSnapChange={setAngleSnap} onBack={() => setSidebarMode("layers")} onCanvasHeightChange={setCanvasHeight} onCanvasWidthChange={setCanvasWidth} onDistanceSnapChange={setDistanceSnap} onSnapEnabledChange={setSnapEnabled} snapEnabled={snapEnabled} />
              <LayersView layers={layers} onCreateLayer={createLayer} onCreateRange={createRange} onOpenProjectSettings={() => setSidebarMode("project-settings")} onOpenRangeProperties={openRangeProperties} ranges={ranges} />
              <PropertiesView centerX={rangeCenterX} centerY={rangeCenterY} onBack={() => setSidebarMode("layers")} onCenterXChange={setRangeCenterX} onCenterYChange={setRangeCenterY} onNameChange={renameSelectedObject} onOpeningAngleChange={setOpeningAngle} onRadiusChange={setRangeRadius} openingAngle={openingAngle} radius={rangeRadius} selectedName={selectedName} selectedObject={selectedObject} />
            </div>
          </div>
        </aside>

        <CanvasPreview canvasHeight={canvasHeight} canvasWidth={canvasWidth} onBrowseExamples={() => announce(t("toolbar.examples"))} onCreateRange={createRange} />
      </section>

      <StatusMessage>{status}</StatusMessage>
    </main>
  );
}

type ResponsiveToolbarProps = { actions: ToolbarAction[]; onAction: (action: string) => void; onOpenHelp: () => void };

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
    if (action.id === "helpCenter") {
      onOpenHelp();
      return;
    }
    onAction(action.label);
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
          <ActionButton icon={action.icon} key={action.id} label={action.label} onClick={() => handleAction(action)} variant="quiet" />
        ))}
        {overflowActions.length > 0 ? (
          <details className="relative shrink-0">
            <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg text-muted hover:bg-surface-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
              <MoreHorizontal aria-hidden="true" size={18} />
              <span className="sr-only">{t("toolbar.moreActions")}</span>
            </summary>
            <div className="absolute right-0 top-11 z-30 flex w-52 flex-col gap-1 rounded-xl border border-border bg-surface p-2 shadow-[0_16px_40px_rgba(32,36,43,0.16)]">
              {overflowActions.map((action) => (
                <ActionButton className="justify-start" icon={action.icon} key={action.id} label={action.label} onClick={() => handleAction(action)} variant="quiet" />
              ))}
            </div>
          </details>
        ) : null}
      </div>
    </nav>
  );
}

type LayersViewProps = {
  layers: PrototypeLayer[];
  ranges: PrototypeRange[];
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
        <div className="flex shrink-0 items-center gap-2"><ActionButton icon={Settings2} label={t("projectSettings")} onClick={onOpenProjectSettings} variant="quiet" /><ActionButton icon={Plus} label={t("addLayer")} onClick={onCreateLayer} variant="primary" /></div>
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
  onAngleSnapChange: (value: string) => void; onBack: () => void; onCanvasHeightChange: (value: string) => void; onCanvasWidthChange: (value: string) => void; onDistanceSnapChange: (value: string) => void; onSnapEnabledChange: (value: boolean) => void;
};

function ProjectSettingsView({ angleSnap, canvasHeight, canvasWidth, distanceSnap, onAngleSnapChange, onBack, onCanvasHeightChange, onCanvasWidthChange, onDistanceSnapChange, onSnapEnabledChange, snapEnabled }: ProjectSettingsViewProps) {
  const t = useTranslations("Editor");
  return (
    <section aria-label={t("projectSettings.ariaLabel")} className="flex h-full w-1/3 flex-col">
      <div className="border-b border-border p-3"><ActionButton className="w-full justify-start" icon={ChevronRight} label={t("controls.backToLayers")} onClick={onBack} variant="quiet" /></div>
      <div className="overflow-y-auto p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">{t("projectSettings.eyebrow")}</p><h2 className="mt-1 text-xl font-semibold">{t("projectSettings.title")}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{t("projectSettings.description")}</p>
        <PropertyGroup title={t("projectSettings.canvas")}><RangePropertyRow label={t("projectSettings.width")} max={500} min={20} suffix={t("controls.millimeters")} value={canvasWidth} onChange={onCanvasWidthChange} /><RangePropertyRow label={t("projectSettings.height")} max={500} min={20} suffix={t("controls.millimeters")} value={canvasHeight} onChange={onCanvasHeightChange} /></PropertyGroup>
        <PropertyGroup title={t("projectSettings.snapping")}><label className="flex items-center justify-between gap-4 py-3 text-sm"><span className="text-muted">{t("projectSettings.enableSnapping")}</span><input aria-label={t("projectSettings.enableSnapping")} checked={snapEnabled} className="size-4 accent-accent" onChange={(event) => onSnapEnabledChange(event.target.checked)} type="checkbox" /></label><RangePropertyRow label={t("projectSettings.distanceIncrement")} max={20} min={1} suffix={t("controls.millimeters")} value={distanceSnap} onChange={onDistanceSnapChange} /><RangePropertyRow label={t("projectSettings.angleIncrement")} max={45} min={1} suffix={t("controls.degrees")} value={angleSnap} onChange={onAngleSnapChange} /></PropertyGroup>
      </div>
    </section>
  );
}

type PropertiesViewProps = { centerX: string; centerY: string; openingAngle: string; radius: string; selectedName: string; selectedObject: SelectedObject; onBack: () => void; onCenterXChange: (value: string) => void; onCenterYChange: (value: string) => void; onNameChange: (value: string) => void; onOpeningAngleChange: (value: string) => void; onRadiusChange: (value: string) => void };

function PropertiesView({ centerX, centerY, onBack, onCenterXChange, onCenterYChange, onNameChange, onOpeningAngleChange, onRadiusChange, openingAngle, radius, selectedName, selectedObject }: PropertiesViewProps) {
  const t = useTranslations("Editor");
  const isRange = selectedObject?.collection !== "layers";
  return (
    <section aria-label={isRange ? t("range.ariaLabel") : t("layers.propertiesAriaLabel")} className="flex h-full w-1/3 flex-col">
      <div className="border-b border-border p-3"><ActionButton className="w-full justify-start" icon={ChevronLeft} label={t("controls.backToLayers")} onClick={onBack} variant="quiet" /></div>
      <div className="overflow-y-auto p-4">
        {isRange ? <><p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">{t("range.eyebrow")}</p><h2 className="mt-1 text-xl font-semibold">{t("range.title")}</h2><p className="mt-2 text-sm leading-6 text-muted">{t("range.description")}</p><PropertyGroup title={t("controls.identity")}><TextPropertyRow label={t("controls.name")} onChange={onNameChange} value={selectedName} /></PropertyGroup><PropertyGroup title={t("range.position")}><RangePropertyRow label={t("range.centerX")} max={120} min={0} suffix={t("controls.millimeters")} value={centerX} onChange={onCenterXChange} /><RangePropertyRow label={t("range.centerY")} max={120} min={0} suffix={t("controls.millimeters")} value={centerY} onChange={onCenterYChange} /></PropertyGroup><PropertyGroup title={t("range.scale")}><RangePropertyRow label={t("range.radius")} max={60} min={1} suffix={t("controls.millimeters")} value={radius} onChange={onRadiusChange} /><RangePropertyRow label={t("range.openingAngle")} max={360} min={-360} suffix={t("controls.degrees")} value={openingAngle} onChange={onOpeningAngleChange} /></PropertyGroup></> : <><p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">{t("layers.eyebrow")}</p><h2 className="mt-1 text-xl font-semibold">{t("layers.propertiesTitle")}</h2><p className="mt-2 text-sm leading-6 text-muted">{t("layers.propertiesDescription")}</p><PropertyGroup title={t("controls.identity")}><TextPropertyRow label={t("controls.name")} onChange={onNameChange} value={selectedName} /></PropertyGroup></>}
      </div>
    </section>
  );
}

type CanvasPreviewProps = { canvasHeight: string; canvasWidth: string; onBrowseExamples: () => void; onCreateRange: () => void };

function CanvasPreview({ canvasHeight, canvasWidth, onBrowseExamples, onCreateRange }: CanvasPreviewProps) {
  const t = useTranslations("Editor");
  return (
    <section aria-label={t("canvas.ariaLabel")} className="relative flex min-w-0 flex-1 items-center justify-center overflow-auto p-6 sm:p-10">
      <div className="grid w-full max-w-[48rem] place-items-center">
        <div className="relative aspect-square w-full max-w-[min(68vh,42rem)] rounded-sm border border-border bg-white shadow-[0_20px_65px_rgba(32,36,43,0.1)]">
          <div className="absolute inset-0 grid place-items-center p-8 text-center">
            <div>
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-accent-subtle text-accent"><Plus aria-hidden="true" size={30} strokeWidth={1.6} /></div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">{t("canvas.emptyTitle")}</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">{t("canvas.emptyDescription")}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <ActionButton icon={Plus} label={t("layers.createFirstRange")} onClick={onCreateRange} variant="primary" />
                <ActionButton icon={BookOpen} label={t("canvas.browseExamples")} onClick={onBrowseExamples} />
              </div>
            </div>
          </div>
          <span className="absolute right-3 bottom-3 rounded bg-surface-subtle px-2 py-1 text-xs font-medium text-muted">{t("canvas.dimension", { width: canvasWidth || t("controls.unavailable"), height: canvasHeight || t("controls.unavailable"), unit: t("controls.millimeters") })}</span>
        </div>
      </div>
    </section>
  );
}

type PropertyGroupProps = { title: string; children: React.ReactNode };
function PropertyGroup({ title, children }: PropertyGroupProps) {
  return <section className="mt-7"><h3 className="border-b border-border pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">{title}</h3><div className="divide-y divide-border">{children}</div></section>;
}

type RangePropertyRowProps = { label: string; max: number; min: number; suffix: string; value: string; onChange: (value: string) => void };
type TextPropertyRowProps = { label: string; value: string; onChange: (value: string) => void };
function TextPropertyRow({ label, onChange, value }: TextPropertyRowProps) {
  return <label className="flex items-center justify-between gap-4 py-3 text-sm"><span className="text-muted">{label}</span><input aria-label={label} className="w-40 rounded-md border border-border bg-app px-2 py-1.5 text-right text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30" onChange={(event) => onChange(event.target.value)} required type="text" value={value} /></label>;
}

function RangePropertyRow({ label, max, min, suffix, value, onChange }: RangePropertyRowProps) {
  const t = useTranslations("Editor.controls");
  return (
    <label className="block py-3 text-sm">
      <span className="flex items-center justify-between gap-4">
        <span className="text-muted">{label}</span>
        <span className="relative"><input aria-label={label} className="w-24 rounded-md border border-border bg-app py-1.5 pr-8 pl-2 text-right text-sm text-ink outline-none focus:border-focus focus:ring-2 focus:ring-focus/30" inputMode="decimal" max={max} min={min} onChange={(event) => onChange(event.target.value)} type="number" value={value} /><span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted">{suffix}</span></span>
      </span>
      <input aria-label={t("adjust", { label })} className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-accent" max={max} min={min} onChange={(event) => onChange(event.target.value)} step="1" type="range" value={value} />
    </label>
  );
}
