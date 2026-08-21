"use client";

import { Hash, LineStyle, Rainbow, Type } from "lucide-react";
import { useTranslations } from "next-intl";
import { LAYER_TYPE, type LayerType } from "@/features/project/project-dto/project-dto";
import { cn } from "@/lib/cn";

type LayerTypePickerProps = { onCreateLayer: (type: LayerType) => void };

const LAYER_PICKER_ITEMS = {
  [LAYER_TYPE.tickScale]: {
    descriptionKey: "picker.tickScaleDescription",
    icon: LineStyle,
    titleKey: "types.tickScale",
  },
  [LAYER_TYPE.numericScale]: {
    descriptionKey: "picker.numericScaleDescription",
    icon: Hash,
    titleKey: "types.numericScale",
  },
  [LAYER_TYPE.arc]: {
    descriptionKey: "picker.arcDescription",
    icon: Rainbow,
    titleKey: "types.arc",
  },
  [LAYER_TYPE.label]: {
    descriptionKey: "picker.labelDescription",
    icon: Type,
    titleKey: "types.label",
  },
} satisfies Record<LayerType, { descriptionKey: string; icon: typeof LineStyle; titleKey: string }>;

export function LayerTypePicker({ onCreateLayer }: LayerTypePickerProps) {
  const t = useTranslations("Editor.layers");
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">
        {t("picker.eyebrow")}
      </p>
      <h2 className="mt-1 text-xl font-semibold">{t("picker.title")}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{t("picker.description")}</p>
      <div className="mt-5 space-y-2">
        {Object.entries(LAYER_PICKER_ITEMS).map(
          ([type, { descriptionKey, icon: Icon, titleKey }]) => (
            <button
              className={cn(
                "flex w-full items-start gap-2.5 rounded-lg border border-border bg-app p-3 text-left",
                "transition-colors hover:border-focus hover:bg-surface-subtle",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              )}
              key={type}
              onClick={() => onCreateLayer(type as LayerType)}
              type="button"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent-subtle text-accent">
                <Icon aria-hidden="true" size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{t(titleKey)}</span>
                <span className="mt-0.5 block text-sm leading-5 text-muted">
                  {t(descriptionKey)}
                </span>
              </span>
            </button>
          ),
        )}
      </div>
    </>
  );
}
