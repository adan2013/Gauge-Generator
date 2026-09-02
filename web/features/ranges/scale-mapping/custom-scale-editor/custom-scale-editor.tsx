"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { Tooltip } from "@/components/atoms/tooltip/tooltip";
import { FieldRow } from "@/components/molecules/field-row/field-row";
import { RangePropertyRow } from "@/features/editor/property-controls/property-controls";
import {
  CUSTOM_SCALE_POSITION_STEP,
  type RangeDto,
} from "@/features/project/project-dto/project-dto";
import { cn } from "@/lib/cn";
import {
  addCustomScalePoint,
  addCustomScalePointAtLargestGap,
  editCustomScalePoint,
  getCustomScalePointBounds,
  moveCustomScalePoint,
  removeCustomScalePoint,
  snapCustomScalePoint,
  type CustomScalePoint,
} from "../custom-scale-points";

const GRAPH_WIDTH = 320;
const GRAPH_HEIGHT = 190;
const PLOT = { left: 44, right: 12, top: 14, bottom: 32 } as const;

type CustomScaleEditorProps = {
  onChange: (points: CustomScalePoint[]) => void;
  onInteractionEnd: () => void;
  onInteractionStart: () => void;
  points: readonly CustomScalePoint[];
  snapEnabled: boolean;
  snapValueStep: number;
  valueDirection: RangeDto["valueDirection"];
};

export function CustomScaleEditor({
  onChange,
  onInteractionEnd,
  onInteractionStart,
  points,
  snapEnabled,
  snapValueStep,
  valueDirection,
}: CustomScaleEditorProps) {
  const t = useTranslations("Editor.range.customCurve");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) return null;
  const safeSelectedIndex = Math.min(selectedIndex, points.length - 1);
  const selectedPoint = points[safeSelectedIndex];
  const selectedBounds = getCustomScalePointBounds(points, safeSelectedIndex);
  const toDisplayedPosition = (position: number) =>
    valueDirection === "descending" ? 1 - position : position;
  const toStoredPosition = (position: number) =>
    valueDirection === "descending" ? 1 - position : position;
  const displayedPositionBounds =
    valueDirection === "descending"
      ? {
          min: formatPosition(1 - selectedBounds.position.max),
          max: formatPosition(1 - selectedBounds.position.min),
        }
      : selectedBounds.position;

  const plotWidth = GRAPH_WIDTH - PLOT.left - PLOT.right;
  const plotHeight = GRAPH_HEIGHT - PLOT.top - PLOT.bottom;
  const valueSpan = last.value - first.value;
  const toGraphPoint = (point: CustomScalePoint) => ({
    x: PLOT.left + ((point.value - first.value) / valueSpan) * plotWidth,
    y: PLOT.top + (1 - toDisplayedPosition(point.position)) * plotHeight,
  });
  const fromPointer = (clientX: number, clientY: number, element: SVGSVGElement) => {
    const bounds = element.getBoundingClientRect();
    const width = bounds.width || GRAPH_WIDTH;
    const height = bounds.height || GRAPH_HEIGHT;
    const x = ((clientX - bounds.left) / width) * GRAPH_WIDTH;
    const y = ((clientY - bounds.top) / height) * GRAPH_HEIGHT;
    return {
      value: first.value + clamp((x - PLOT.left) / plotWidth, 0, 1) * valueSpan,
      position: toStoredPosition(1 - clamp((y - PLOT.top) / plotHeight, 0, 1)),
    };
  };
  const path = points
    .map((point, index) => {
      const graphPoint = toGraphPoint(point);
      return `${index === 0 ? "M" : "L"} ${graphPoint.x} ${graphPoint.y}`;
    })
    .join(" ");

  const valueStep = Math.max(1, Math.round(snapValueStep));
  const snapOptions = {
    enabled: snapEnabled,
    valueStep,
  } as const;

  function addPointAtLargestGap() {
    const next = addCustomScalePointAtLargestGap(points, snapOptions);
    if (next.length === points.length) return;
    onChange(next);
    setSelectedIndex(findInsertedPointIndex(points, next));
  }

  function pointFromPointer(clientX: number, clientY: number, element: SVGSVGElement) {
    return snapCustomScalePoint(fromPointer(clientX, clientY, element), snapOptions);
  }

  function updateSelectedPoint(change: Partial<CustomScalePoint>) {
    if (!selectedPoint) return;
    const snapped = snapCustomScalePoint({ ...selectedPoint, ...change }, snapOptions);
    onChange(
      editCustomScalePoint(points, safeSelectedIndex, {
        value: change.value === undefined ? undefined : snapped.value,
        position: change.position === undefined ? undefined : snapped.position,
      }),
    );
  }

  function finishDrag() {
    if (dragIndex === null) return;
    setDragIndex(null);
    onInteractionEnd();
  }

  return (
    <div className="py-3">
      <p className="text-xs leading-5 text-muted">{t("description")}</p>
      <svg
        aria-label={t("ariaLabel")}
        className="mt-3 block w-full touch-none rounded-lg border border-border bg-app"
        onClick={(event) => {
          const next = addCustomScalePoint(
            points,
            pointFromPointer(event.clientX, event.clientY, event.currentTarget),
          );
          if (next.length === points.length) return;
          onChange(next);
          setSelectedIndex(findInsertedPointIndex(points, next));
        }}
        onPointerCancel={finishDrag}
        onPointerMove={(event) => {
          if (dragIndex === null) return;
          onChange(
            moveCustomScalePoint(
              points,
              dragIndex,
              pointFromPointer(event.clientX, event.clientY, event.currentTarget),
            ),
          );
        }}
        onPointerUp={finishDrag}
        role="group"
        viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
      >
        <title>{t("ariaLabel")}</title>
        {[0, 0.25, 0.5, 0.75, 1].map((position) => {
          const y = PLOT.top + (1 - position) * plotHeight;
          return (
            <g key={position}>
              <line
                stroke="#D8DCE2"
                strokeDasharray={position === 0 || position === 1 ? undefined : "3 3"}
                x1={PLOT.left}
                x2={GRAPH_WIDTH - PLOT.right}
                y1={y}
                y2={y}
              />
              <text fill="#626B77" fontSize="10" textAnchor="end" x={PLOT.left - 7} y={y + 3}>
                {formatNumber(position)}
              </text>
            </g>
          );
        })}
        <line
          stroke="#D8DCE2"
          x1={PLOT.left}
          x2={PLOT.left}
          y1={PLOT.top}
          y2={GRAPH_HEIGHT - PLOT.bottom}
        />
        <text
          fill="#626B77"
          fontSize="10"
          textAnchor="middle"
          x={PLOT.left + plotWidth / 2}
          y={GRAPH_HEIGHT - 8}
        >
          {t("valueAxis")}
        </text>
        <text fill="#626B77" fontSize="10" textAnchor="start" x={PLOT.left} y={GRAPH_HEIGHT - 19}>
          {formatNumber(first.value)}
        </text>
        <text
          fill="#626B77"
          fontSize="10"
          textAnchor="end"
          x={GRAPH_WIDTH - PLOT.right}
          y={GRAPH_HEIGHT - 19}
        >
          {formatNumber(last.value)}
        </text>
        <path d={path} fill="none" stroke="#C62828" strokeWidth="2" />
        {points.map((point, index) => {
          const graphPoint = toGraphPoint(point);
          const isEndpoint = index === 0 || index === points.length - 1;
          return (
            <circle
              aria-label={t(isEndpoint ? "lockedPoint" : "editablePoint", {
                value: formatNumber(point.value),
                position: formatNumber(toDisplayedPosition(point.position)),
              })}
              className={cn(
                "outline-none focus-visible:stroke-ink focus-visible:stroke-[3px]",
                isEndpoint ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
              )}
              cx={graphPoint.x}
              cy={graphPoint.y}
              fill={selectedIndex === index ? "#C62828" : "#FFFFFF"}
              key={index}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedIndex(index);
              }}
              onDoubleClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if ((event.key === "Delete" || event.key === "Backspace") && !isEndpoint) {
                  onChange(removeCustomScalePoint(points, index));
                  setSelectedIndex(Math.max(0, index - 1));
                }
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
                setSelectedIndex(index);
                if (isEndpoint) return;
                event.currentTarget.setPointerCapture?.(event.pointerId);
                setDragIndex(index);
                onInteractionStart();
              }}
              r={isEndpoint ? 5 : 6}
              role="button"
              stroke="#C62828"
              strokeWidth="2"
              tabIndex={0}
            />
          );
        })}
      </svg>
      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-muted">{t("pointCount", { count: points.length })}</p>
        <ActionButton
          icon={Plus}
          label={t("addPoint")}
          onClick={addPointAtLargestGap}
          variant="quiet"
        />
      </div>
      {selectedPoint ? (
        <div className="mt-2 grid grid-cols-2 gap-3 border-y border-border py-2">
          <RangePropertyRow
            className="grid-cols-1 gap-y-1 py-0"
            key={`value-${safeSelectedIndex}`}
            label={t("pointValue")}
            max={selectedBounds.value.max}
            min={selectedBounds.value.min}
            onChange={(value) => updateSelectedPoint({ value: Number(value) })}
            onInteractionEnd={onInteractionEnd}
            onInteractionStart={onInteractionStart}
            step={snapEnabled ? valueStep : 1}
            suffix=""
            value={formatNumber(selectedPoint.value)}
          />
          {safeSelectedIndex === 0 || safeSelectedIndex === points.length - 1 ? (
            <FieldRow className="grid-cols-1 gap-y-1 py-0" label={t("pointPosition")}>
              <output className="block rounded-md border border-border bg-surface-subtle px-2 py-1 text-right text-sm text-muted">
                {formatNumber(toDisplayedPosition(selectedPoint.position))} · {t("locked")}
              </output>
            </FieldRow>
          ) : (
            <RangePropertyRow
              className="grid-cols-1 gap-y-1 py-0"
              key={`position-${safeSelectedIndex}`}
              label={t("pointPosition")}
              max={displayedPositionBounds.max}
              min={displayedPositionBounds.min}
              onChange={(value) =>
                updateSelectedPoint({ position: toStoredPosition(Number(value)) })
              }
              onInteractionEnd={onInteractionEnd}
              onInteractionStart={onInteractionStart}
              step={CUSTOM_SCALE_POSITION_STEP}
              suffix=""
              value={formatNumber(toDisplayedPosition(selectedPoint.position))}
            />
          )}
        </div>
      ) : null}
      <ol className="mt-2 space-y-1" aria-label={t("pointsAriaLabel")}>
        {points.map((point, index) => {
          const isEndpoint = index === 0 || index === points.length - 1;
          return (
            <li
              className={cn(
                "flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs",
                selectedIndex === index ? "border-focus bg-accent-subtle" : "border-border bg-app",
              )}
              key={index}
            >
              <button
                className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-focus"
                onClick={() => setSelectedIndex(index)}
                type="button"
              >
                <span className="font-medium text-ink">{formatNumber(point.value)}</span>
                <span className="text-muted">
                  {" "}
                  → {formatNumber(toDisplayedPosition(point.position))}
                </span>
              </button>
              {isEndpoint ? (
                <span className="text-muted">{t("locked")}</span>
              ) : (
                <Tooltip content={t("removePoint")}>
                  <ActionButton
                    className="size-8 shrink-0 px-0"
                    icon={Trash2}
                    label={t("removePoint")}
                    labelVisibility="screen-reader-only"
                    onClick={() => {
                      onChange(removeCustomScalePoint(points, index));
                      setSelectedIndex(Math.max(0, index - 1));
                    }}
                    variant="quiet"
                  />
                </Tooltip>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function findInsertedPointIndex(
  previous: readonly CustomScalePoint[],
  next: readonly CustomScalePoint[],
) {
  return next.findIndex(
    (point, index) =>
      point.value !== previous[index]?.value || point.position !== previous[index]?.position,
  );
}

function formatNumber(value: number) {
  return Number(value.toFixed(3)).toString();
}

function formatPosition(value: number) {
  return Number(value.toFixed(2));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
