import { Coffee } from "lucide-react";
import { useTranslations } from "next-intl";
import { ActionButton } from "@/components/atoms/action-button/action-button";

export function ExportSupportPanel() {
  const t = useTranslations("Editor.export");

  return (
    <aside className="flex min-h-64 flex-col justify-between rounded-xl border border-border bg-[linear-gradient(145deg,var(--color-accent-subtle),var(--color-surface)_68%)] p-6 md:border-l md:p-7">
      <div>
        <span className="grid size-12 place-items-center rounded-xl bg-surface text-accent shadow-sm">
          <Coffee aria-hidden="true" size={23} />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {t("support.eyebrow")}
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{t("support.title")}</h3>
        <p className="mt-3 text-sm leading-6 text-muted">{t("support.description")}</p>
      </div>
      <ActionButton
        className="mt-8 w-full"
        disabled
        icon={Coffee}
        label={t("support.comingSoon")}
        variant="secondary"
      />
    </aside>
  );
}
