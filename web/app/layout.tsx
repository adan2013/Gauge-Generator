import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { ConfirmationProvider } from "@/components/providers/confirmation-provider/confirmation-provider";
import { StatusMessageProvider } from "@/components/providers/status-message-provider/status-message-provider";
import { TooltipProvider } from "@/components/providers/tooltip-provider/tooltip-provider";
import { StoreProvider } from "@/store/store-provider/store-provider";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.CF_PAGES_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    applicationName: "Gauge Generator",
    category: "design",
    description: t("description"),
    metadataBase: new URL(siteUrl),
    title: t("title"),
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="h-full">
      <body className="min-h-full font-sans antialiased">
        <NextIntlClientProvider>
          <TooltipProvider>
            <ConfirmationProvider>
              <StatusMessageProvider>
                <StoreProvider>{children}</StoreProvider>
              </StatusMessageProvider>
            </ConfirmationProvider>
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
