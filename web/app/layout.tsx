import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { ConfirmationProvider } from "@/components/providers/confirmation-provider/confirmation-provider";
import { TooltipProvider } from "@/components/providers/tooltip-provider/tooltip-provider";
import { StoreProvider } from "@/store/store-provider/store-provider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return { title: t("title"), description: t("description") };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full font-sans antialiased">
        <NextIntlClientProvider>
          <TooltipProvider>
            <ConfirmationProvider>
              <StoreProvider>{children}</StoreProvider>
            </ConfirmationProvider>
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
