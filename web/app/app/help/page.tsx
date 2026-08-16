import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function HelpPage() {
  const t = await getTranslations("Help");
  const sections = ["gettingStarted", "interface", "layers", "projects", "examples"] as const;
  return (
    <main className="min-h-dvh bg-app px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          href="/app"
        >
          <ArrowLeft aria-hidden="true" size={16} /> {t("backToEditor")}
        </Link>
        <header className="mt-10 border-b border-border pb-8">
          <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-accent-subtle text-accent">
            <BookOpen aria-hidden="true" size={22} />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink">{t("title")}</h1>
          <p className="mt-3 text-muted">{t("description")}</p>
        </header>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {sections.map((section) => (
            <section className="rounded-xl border border-border bg-surface p-5" key={section}>
              <h2 className="font-semibold text-ink">{t(`sections.${section}.title`)}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {t(`sections.${section}.description`)}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
