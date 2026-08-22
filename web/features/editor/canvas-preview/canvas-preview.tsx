"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { LayerEditingOverlay } from "@/features/editor/layer-editing-overlay/layer-editing-overlay";
import { createLayerModel } from "@/features/layers/core/layer-registry";
import { RangeEditingOverlay } from "@/features/ranges/range/range-editing-overlay/range-editing-overlay";
import type { LayerDto, ProjectDto, RangeDto } from "@/features/project/project-dto/project-dto";
import type { LayerPreviewModifiers } from "@/store/editor-slice";

type CanvasPreviewProps = {
  hoveredLayerId: string | null;
  layerPreviewModifiers: LayerPreviewModifiers;
  project: ProjectDto;
  onBrowseExamples: () => void;
  onCreateRange: () => void;
  onLayerChange: (layer: LayerDto) => void;
  onLayerInteractionEnd: () => void;
  onLayerInteractionStart: () => void;
  onSelectLayer: (layerId: string) => void;
  onRangeChange: (range: RangeDto) => void;
  onRangeInteractionEnd: () => void;
  onRangeInteractionStart: () => void;
  selectedLayer: LayerDto | undefined;
  selectedRange: RangeDto | undefined;
  snapping: { enabled: boolean; distanceMm: number; angleDegrees: number };
};

const CSS_PIXELS_PER_MILLIMETER = 96 / 25.4;

export function CanvasPreview({
  hoveredLayerId,
  layerPreviewModifiers,
  onBrowseExamples,
  onCreateRange,
  onLayerChange,
  onLayerInteractionEnd,
  onLayerInteractionStart,
  onSelectLayer,
  onRangeChange,
  onRangeInteractionEnd,
  onRangeInteractionStart,
  project,
  selectedLayer,
  selectedRange,
  snapping,
}: CanvasPreviewProps) {
  const t = useTranslations("Editor");
  const { canvas } = project;
  const { heightMm: canvasHeight, widthMm: canvasWidth } = canvas;
  const hasRange = project.ranges.length > 0;
  const renderContext = {
    project,
    rangeById: new Map(project.ranges.map((range) => [range.id, range])),
  };
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const showWelcome = !hasRange && !selectedRange;
  const aspectRatio = hasRange || selectedRange ? canvasWidth / canvasHeight : 1;
  const frameWidth =
    viewportSize.width > 0 && viewportSize.height > 0
      ? Math.min(viewportSize.width, viewportSize.height * aspectRatio)
      : undefined;
  const frameHeight = frameWidth ? frameWidth / aspectRatio : undefined;
  const zoomPercent =
    (hasRange || selectedRange) && frameWidth
      ? Math.round((frameWidth / (canvasWidth * (96 / 25.4))) * 100)
      : undefined;
  const overlayScale = getOverlayDisplayScale(frameWidth, canvasWidth);
  useLayoutEffect(() => {
    function measure() {
      const viewport = viewportRef.current;
      if (viewport) setViewportSize({ width: viewport.clientWidth, height: viewport.clientHeight });
    }
    measure();
    const observer =
      typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    if (viewportRef.current && observer) observer.observe(viewportRef.current);
    return () => observer?.disconnect();
  }, []);

  return (
    <section
      aria-label={t("canvas.ariaLabel")}
      className="relative flex min-w-0 flex-1 overflow-hidden px-6 pt-6 pb-20 sm:px-10 sm:pt-10 sm:pb-24"
    >
      <div className="flex size-full min-h-0 min-w-0 items-center justify-center" ref={viewportRef}>
        <div
          className="relative shrink-0 rounded-sm border border-border shadow-[0_20px_65px_rgba(32,36,43,0.1)]"
          data-testid="canvas-frame"
          style={{
            aspectRatio: hasRange || selectedRange ? `${canvasWidth} / ${canvasHeight}` : "1 / 1",
            backgroundColor: showWelcome
              ? "#FFFFFF"
              : canvas.transparentBackground
                ? "transparent"
                : canvas.background,
            height: frameHeight,
            width: frameWidth,
          }}
        >
          {showWelcome ? (
            <div className="absolute inset-0 grid place-items-center p-8 text-center">
              <div>
                <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-accent-subtle text-accent">
                  <Plus aria-hidden="true" size={30} strokeWidth={1.6} />
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                  {t("canvas.emptyTitle")}
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
                  {t("canvas.emptyDescription")}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <ActionButton
                    icon={Plus}
                    label={t("layers.createFirstRange")}
                    onClick={onCreateRange}
                    variant="primary"
                  />
                  <ActionButton
                    icon={BookOpen}
                    label={t("canvas.browseExamples")}
                    onClick={onBrowseExamples}
                  />
                </div>
              </div>
            </div>
          ) : null}
          {selectedRange ? (
            <svg
              aria-label={t("canvas.previewAriaLabel")}
              className="absolute inset-0 size-full select-none"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <VisualLayers
                hoveredLayerId={hoveredLayerId}
                layers={project.layers}
                previewModifiers={layerPreviewModifiers}
                renderContext={renderContext}
                selectedLayerId={selectedLayer?.id}
                onSelectLayer={onSelectLayer}
              />
              <RangeEditingOverlay
                canvas={canvas}
                displayScale={overlayScale}
                onInteractionEnd={onRangeInteractionEnd}
                onInteractionStart={onRangeInteractionStart}
                onRangeChange={onRangeChange}
                range={selectedRange}
                snapping={snapping}
              />
            </svg>
          ) : !showWelcome ? (
            <svg
              aria-label={t("canvas.previewAriaLabel")}
              className="absolute inset-0 size-full select-none"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <VisualLayers
                hoveredLayerId={hoveredLayerId}
                layers={project.layers}
                previewModifiers={layerPreviewModifiers}
                renderContext={renderContext}
                selectedLayerId={selectedLayer?.id}
                onSelectLayer={onSelectLayer}
              />
              {selectedLayer && layerPreviewModifiers.showEditingOverlay ? (
                <LayerEditingOverlay
                  canvas={canvas}
                  displayScale={overlayScale}
                  layer={selectedLayer}
                  onInteractionEnd={onLayerInteractionEnd}
                  onInteractionStart={onLayerInteractionStart}
                  onLayerChange={onLayerChange}
                  project={project}
                  snapping={snapping}
                />
              ) : null}
            </svg>
          ) : null}
        </div>
      </div>
      <p
        aria-label={t("canvas.previewDetailsAriaLabel")}
        className="pointer-events-none absolute bottom-5 left-5 z-10 rounded-lg border border-border bg-surface/95 px-3 py-2 text-xs font-medium text-muted shadow-[0_12px_30px_rgba(32,36,43,0.12)]"
      >
        {zoomPercent ? (
          <>
            <span>{t("canvas.zoom", { value: zoomPercent })}</span>
            <span aria-hidden="true" className="mx-2 text-border">
              •
            </span>
          </>
        ) : null}
        <span>{t("canvas.dimensions", { width: canvasWidth, height: canvasHeight })}</span>
      </p>
    </section>
  );
}

export function getOverlayDisplayScale(
  frameWidthPx: number | undefined,
  canvasWidthMm: number,
): number {
  return frameWidthPx ? CSS_PIXELS_PER_MILLIMETER / (frameWidthPx / canvasWidthMm) : 1;
}

function VisualLayers({
  hoveredLayerId,
  layers,
  previewModifiers,
  renderContext,
  selectedLayerId,
  onSelectLayer,
}: {
  hoveredLayerId: string | null;
  layers: LayerDto[];
  previewModifiers: LayerPreviewModifiers;
  renderContext: { project: ProjectDto; rangeById: ReadonlyMap<string, RangeDto> };
  selectedLayerId: string | undefined;
  onSelectLayer: (layerId: string) => void;
}) {
  const isolatedLayerId =
    previewModifiers.showOnlySelectedLayer && selectedLayerId ? selectedLayerId : hoveredLayerId;
  const previewLayers = isolatedLayerId
    ? layers.filter((layer) => layer.id === isolatedLayerId)
    : layers;
  const orderedLayers =
    previewModifiers.bringSelectedLayerToFront && selectedLayerId && !isolatedLayerId
      ? [
          ...previewLayers.filter((layer) => layer.id !== selectedLayerId).toReversed(),
          ...previewLayers.filter((layer) => layer.id === selectedLayerId),
        ]
      : previewLayers.toReversed();
  return orderedLayers
    .map((layer) => ({ id: layer.id, svg: createLayerModel(layer).toSvg(renderContext) }))
    .filter((layer) => layer.svg)
    .map((layer) => (
      <g
        className="cursor-pointer"
        dangerouslySetInnerHTML={{ __html: layer.svg }}
        data-layer-id={layer.id}
        key={layer.id}
        onClick={() => onSelectLayer(layer.id)}
      />
    ));
}
