import { Coffee } from "lucide-react";
import { useTranslations } from "next-intl";
import { BuyMeACoffeeButton } from "@/components/atoms/buy-me-a-coffee-button/buy-me-a-coffee-button";

export function ExportSupportPanel() {
  const t = useTranslations("Editor.export");

  return (
    <aside className="flex min-h-64 flex-col justify-between rounded-xl border border-border bg-[linear-gradient(145deg,#fff8cc,var(--color-surface)_68%)] p-6 md:border-l md:p-7">
      <div>
        <span className="grid size-12 place-items-center rounded-xl bg-surface text-[#8a7400] shadow-sm">
          <Coffee aria-hidden="true" size={24} strokeWidth={2} />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#8a7400]">
          {t("support.eyebrow")}
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{t("support.title")}</h3>
        <p className="mt-3 text-sm leading-6 text-muted">{t("support.description")}</p>
      </div>
      <BuyMeACoffeeButton className="mt-8 self-center" label={t("support.action")} />
    </aside>
  );
}
