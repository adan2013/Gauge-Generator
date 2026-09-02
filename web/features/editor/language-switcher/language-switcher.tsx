"use client";

import { useState } from "react";
import { Check, Flag, Languages, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ActionButton } from "@/components/atoms/action-button/action-button";
import { Modal } from "@/components/molecules/modal/modal";
import { ProjectOptionCard } from "@/features/editor/project-option-card/project-option-card";
import { setLocaleCookie } from "@/i18n/locale-cookie";
import { SUPPORTED_LANGUAGES, type SupportedLocale } from "@/i18n/locales";
import { cn } from "@/lib/cn";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("Editor");
  const [isOpen, setIsOpen] = useState(false);
  const selectedLanguage =
    SUPPORTED_LANGUAGES.find((language) => language.locale === locale) ?? SUPPORTED_LANGUAGES[0];

  function selectLanguage(nextLocale: SupportedLocale) {
    if (nextLocale !== locale) {
      setIsOpen(false);
      setLocaleCookie(nextLocale);
      router.refresh();
      return;
    }
    setIsOpen(false);
  }

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={t("language.trigger", { language: selectedLanguage.name })}
        className={cn(
          "flex shrink-0 items-center gap-1 rounded-md border border-border px-1.5 py-1 text-xs font-medium text-muted",
          "hover:bg-surface-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        )}
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <Flag aria-hidden="true" size={14} />
        <span>{selectedLanguage.name}</span>
      </button>
      {isOpen ? (
        <Modal.Root onClose={() => setIsOpen(false)}>
          <Modal.Header
            description={t("language.description")}
            icon={Languages}
            title={t("language.title")}
          />
          <Modal.Body>
            <p className="text-sm leading-5 text-muted">
              {t.rich("language.contribution", {
                github: (chunks) => (
                  <a
                    className="font-medium text-ink underline decoration-border underline-offset-2 hover:text-accent"
                    href="https://github.com/adan2013/Gauge-Generator"
                    rel="noreferrer"
                    target="_blank"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
            <ul className="mt-3 grid gap-2 p-2" role="list">
              {SUPPORTED_LANGUAGES.map((language) => {
                const isSelected = language.locale === selectedLanguage.locale;

                return (
                  <li key={language.locale}>
                    <ProjectOptionCard
                      accessibleLabel={t("language.select", { language: language.name })}
                      className="flex items-center gap-3 p-3"
                      onClick={() => selectLanguage(language.locale)}
                    >
                      <Flag aria-hidden="true" className="text-muted" size={20} />
                      <span className="min-w-0 flex-1 font-medium text-ink">{language.name}</span>
                      {isSelected ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
                          <Check aria-hidden="true" className="text-accent" size={17} />
                          {t("language.selected")}
                        </span>
                      ) : null}
                    </ProjectOptionCard>
                  </li>
                );
              })}
            </ul>
          </Modal.Body>
          <Modal.Actions>
            <ActionButton
              icon={X}
              label={t("confirmation.cancel")}
              onClick={() => setIsOpen(false)}
              variant="quiet"
            />
          </Modal.Actions>
        </Modal.Root>
      ) : null}
    </>
  );
}
