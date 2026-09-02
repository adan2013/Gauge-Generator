"use client";

import {
  Ellipse,
  Gauge,
  Hash,
  LineStyle,
  Rainbow,
  RectangleHorizontal,
  Shapes,
  Slash,
  Type,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { LAYER_TYPE, type LayerType } from "@/features/project/project-dto/project-dto";
import { cn } from "@/lib/cn";

type LayerTypePickerProps = { onCreateLayer: (type: LayerType) => void };

const LAYER_PICKER_ITEMS = {
  [LAYER_TYPE.tickScale]: {
    icon: LineStyle,
    titleKey: "types.tickScale",
  },
  [LAYER_TYPE.numericScale]: {
    icon: Hash,
    titleKey: "types.numericScale",
  },
  [LAYER_TYPE.arc]: {
    icon: Rainbow,
    titleKey: "types.arc",
  },
  [LAYER_TYPE.label]: {
    icon: Type,
    titleKey: "types.label",
  },
  [LAYER_TYPE.ellipse]: {
    icon: Ellipse,
    titleKey: "types.ellipse",
  },
  [LAYER_TYPE.rectangle]: {
    icon: RectangleHorizontal,
    titleKey: "types.rectangle",
  },
  [LAYER_TYPE.line]: {
    icon: Slash,
    titleKey: "types.line",
  },
  [LAYER_TYPE.icon]: {
    icon: Shapes,
    titleKey: "types.icon",
  },
  [LAYER_TYPE.needle]: {
    icon: Gauge,
    titleKey: "types.needle",
  },
} satisfies Record<LayerType, { icon: typeof LineStyle; titleKey: string }>;

export function LayerTypePicker({ onCreateLayer }: LayerTypePickerProps) {
  const t = useTranslations("Editor.layers");
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
        {t("picker.eyebrow")}
      </p>
      <h2 className="mt-1 text-xl font-semibold">{t("picker.title")}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{t("picker.description")}</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        {Object.entries(LAYER_PICKER_ITEMS).map(([type, { icon: Icon, titleKey }]) => (
          <button
            className={cn(
              "flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-lg",
              "border border-border bg-app p-3 text-center",
              "transition-colors hover:border-focus hover:bg-surface-subtle",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            )}
            key={type}
            onClick={() => onCreateLayer(type as LayerType)}
            type="button"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent-subtle text-accent">
              <Icon aria-hidden="true" size={24} />
            </span>
            <span className="text-sm font-semibold leading-5 text-ink">{t(titleKey)}</span>
          </button>
        ))}
      </div>
    </>
  );
}
