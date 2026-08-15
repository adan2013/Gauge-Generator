import Link from "next/link";
import { ArrowRight, Gauge } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("Home");
  return (
    <main className="grid min-h-dvh place-items-center bg-app px-6 py-12">
      <section className="w-full max-w-xl rounded-2xl border border-border bg-surface p-8 shadow-[0_18px_50px_rgba(32,36,43,0.08)] sm:p-12">
        <div className="mb-8 flex size-12 items-center justify-center rounded-xl bg-accent-subtle text-accent">
          <Gauge aria-hidden="true" size={26} strokeWidth={1.8} />
        </div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-accent">{t("eyebrow")}</p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink">{t("title")}</h1>
        <p className="mt-4 max-w-md text-pretty leading-7 text-muted">{t("description")}</p>
        <Link className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" href="/app">
          {t("openEditor")} <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </section>
    </main>
  );
}
