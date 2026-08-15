"use client";

import { useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/store/store";

export function StoreProvider({ children, store: providedStore }: { children: ReactNode; store?: AppStore }) {
  const [store] = useState(() => providedStore ?? makeStore());
  return <Provider store={store}>{children}</Provider>;
}
