import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { DocsMarkdown, extractTableOfContents } from "@/app/docs/docs-markdown";
import { DocsSidebar } from "@/app/docs/docs-sidebar";
import { isSupportedLocale, SUPPORTED_LANGUAGES, type SupportedLocale } from "@/i18n/locales";
import { cn } from "@/lib/cn";

type DocsPageProps = { params: Promise<{ lang: string }> };

function validateLocale(locale: string): asserts locale is SupportedLocale {
  if (!isSupportedLocale(locale)) notFound();
}

async function getDocumentation(locale: SupportedLocale) {
  return readFile(join(process.cwd(), "content", "docs", `${locale}.md`), "utf8");
}

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map(({ locale }) => ({ lang: locale }));
}

export async function generateMetadata({ params }: DocsPageProps): Promise<Metadata> {
  const { lang } = await params;
  validateLocale(lang);
  const t = await getTranslations({ locale: lang, namespace: "Docs.metadata" });
  return { title: t("title"), description: t("description") };
}

export default async function DocsPage({ params }: DocsPageProps) {
  const { lang } = await params;
  validateLocale(lang);
  const t = await getTranslations({ locale: lang, namespace: "Docs" });
  const markdown = await getDocumentation(lang);
  const tableOfContents = extractTableOfContents(markdown);

  return (
    <main className="min-h-dvh bg-app xl:pl-64">
      <DocsSidebar
        closeLabel={t("closeNavigation")}
        items={tableOfContents}
        languageLabel={t("languageLabel")}
        locale={lang}
        navigationLabel={t("tableOfContentsAriaLabel")}
        openLabel={t("openNavigation")}
        tableOfContentsLabel={t("tableOfContents")}
      />
      <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10 sm:py-12 lg:px-12">
        <nav className="mb-12 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6 pl-12 xl:pl-0">
          <Link
            className={cn(
              "inline-flex items-center gap-2 rounded-md text-sm font-medium text-muted",
              "hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus",
            )}
            href="/"
          >
            <ArrowLeft aria-hidden="true" size={16} /> {t("backToHome")}
          </Link>
          <Link
            className={cn(
              "inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white",
              "hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            )}
            href="/app"
          >
            {t("openEditor")} <ExternalLink aria-hidden="true" size={15} />
          </Link>
        </nav>
        <article className="space-y-7">
          <DocsMarkdown markdown={markdown} />
        </article>
        <footer className="mt-16 border-t border-border py-8 text-sm text-muted">
          {t("footer")}
        </footer>
      </div>
    </main>
  );
}
