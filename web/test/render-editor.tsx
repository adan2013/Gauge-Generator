import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ConfirmationProvider } from "@/components/providers/confirmation-provider/confirmation-provider";
import messages from "@/messages/en.json";
import { makeStore, type AppStore } from "@/store/store";
import { StoreProvider } from "@/store/store-provider/store-provider";

export function renderEditor(ui: ReactNode, store: AppStore = makeStore()) {
  return {
    ...render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <ConfirmationProvider>
          <StoreProvider store={store}>{ui}</StoreProvider>
        </ConfirmationProvider>
      </NextIntlClientProvider>,
    ),
    store,
  };
}
