"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { FieldRow } from "@/components/molecules/field-row/field-row";
import {
  CANVAS_DIMENSION_MAX_MM,
  CANVAS_DIMENSION_MIN_MM,
} from "@/features/project/project-dto/project-dto";
import { cn } from "@/lib/cn";
import {
  PropertyGroup,
  RangePropertyRow,
} from "@/features/editor/property-controls/property-controls";

export type ProjectSettingsPanelProps = {
  angleSnap: string;
  background: string;
  canvasHeight: string;
  canvasWidth: string;
  distanceSnap: string;
  snapEnabled: boolean;
  transparentBackground: boolean;
  onAngleSnapChange: (value: string) => void;
  onBack: () => void;
  onBackgroundChange: (value: string) => void;
  onCanvasHeightChange: (value: string) => void;
  onCanvasWidthChange: (value: string) => void;
  onDistanceSnapChange: (value: string) => void;
  onHistoryTransactionEnd: () => void;
  onHistoryTransactionStart: () => void;
  onSnapEnabledChange: (value: boolean) => void;
  onTransparentBackgroundChange: (value: boolean) => void;
};

export function ProjectSettingsPanel({
  angleSnap,
  background,
  canvasHeight,
  canvasWidth,
  distanceSnap,
  onAngleSnapChange,
  onBack,
  onBackgroundChange,
  onCanvasHeightChange,
  onCanvasWidthChange,
  onDistanceSnapChange,
  onHistoryTransactionEnd,
  onHistoryTransactionStart,
  onSnapEnabledChange,
  onTransparentBackgroundChange,
  snapEnabled,
  transparentBackground,
}: ProjectSettingsPanelProps) {
  const t = useTranslations("Editor");
  return (
    <section aria-label={t("projectSettings.ariaLabel")} className="flex h-full w-1/3 flex-col">
      <div className="border-b border-border p-2">
        <ActionButton
          className="w-full justify-start"
          icon={ChevronRight}
          label={t("controls.backToLayers")}
          onClick={onBack}
          variant="quiet"
        />
      </div>
      <div className="overflow-y-auto p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
          {t("projectSettings.eyebrow")}
        </p>
        <h2 className="mt-1 text-xl font-semibold">{t("projectSettings.title")}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{t("projectSettings.description")}</p>
        <PropertyGroup title={t("projectSettings.canvas")}>
          <RangePropertyRow
            label={t("projectSettings.width")}
            max={CANVAS_DIMENSION_MAX_MM}
            min={CANVAS_DIMENSION_MIN_MM}
            onChange={onCanvasWidthChange}
            onInteractionEnd={onHistoryTransactionEnd}
            onInteractionStart={onHistoryTransactionStart}
            step={1}
            suffix={t("controls.millimeters")}
            value={canvasWidth}
          />
          <RangePropertyRow
            label={t("projectSettings.height")}
            max={CANVAS_DIMENSION_MAX_MM}
            min={CANVAS_DIMENSION_MIN_MM}
            onChange={onCanvasHeightChange}
            onInteractionEnd={onHistoryTransactionEnd}
            onInteractionStart={onHistoryTransactionStart}
            step={1}
            suffix={t("controls.millimeters")}
            value={canvasHeight}
          />
          <label className="flex items-center justify-between gap-4 py-3 text-sm">
            <span className="text-muted">{t("projectSettings.transparentBackground")}</span>
            <input
              aria-label={t("projectSettings.transparentBackground")}
              checked={transparentBackground}
              className="size-4 accent-accent"
              onChange={(event) => onTransparentBackgroundChange(event.target.checked)}
              type="checkbox"
            />
          </label>
          <FieldRow htmlFor="canvas-background" label={t("projectSettings.background")}>
            <span className="flex items-center justify-end gap-2">
              <input
                aria-label={t("projectSettings.background")}
                className="size-9 cursor-pointer rounded border border-border bg-app p-1 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={transparentBackground}
                id="canvas-background"
                onChange={(event) => onBackgroundChange(event.target.value.toUpperCase())}
                type="color"
                value={background}
              />
              <output
                className={cn(
                  "font-mono text-xs text-muted",
                  transparentBackground && "opacity-40",
                )}
              >
                {background}
              </output>
            </span>
          </FieldRow>
        </PropertyGroup>
        <PropertyGroup title={t("projectSettings.snapping")}>
          <label className="flex items-center justify-between gap-4 py-3 text-sm">
            <span className="text-muted">{t("projectSettings.enableSnapping")}</span>
            <input
              aria-label={t("projectSettings.enableSnapping")}
              checked={snapEnabled}
              className="size-4 accent-accent"
              onChange={(event) => onSnapEnabledChange(event.target.checked)}
              type="checkbox"
            />
          </label>
          <RangePropertyRow
            label={t("projectSettings.distanceIncrement")}
            max={20}
            min={1}
            onChange={onDistanceSnapChange}
            onInteractionEnd={onHistoryTransactionEnd}
            onInteractionStart={onHistoryTransactionStart}
            step={1}
            suffix={t("controls.millimeters")}
            value={distanceSnap}
          />
          <RangePropertyRow
            label={t("projectSettings.angleIncrement")}
            max={45}
            min={1}
            onChange={onAngleSnapChange}
            onInteractionEnd={onHistoryTransactionEnd}
            onInteractionStart={onHistoryTransactionStart}
            step={1}
            suffix={t("controls.degrees")}
            value={angleSnap}
          />
        </PropertyGroup>
      </div>
    </section>
  );
}
