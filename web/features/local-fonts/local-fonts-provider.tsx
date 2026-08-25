"use client";

import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react";
import {
  queryLocalFontFamilies,
  type LocalFontAccessStatus,
} from "@/features/local-fonts/local-font-access";

type LocalFontsContextValue = {
  families: string[];
  loadLocalFonts: () => Promise<void>;
  status: LocalFontAccessStatus;
};

const LocalFontsContext = createContext<LocalFontsContextValue | null>(null);

export function LocalFontsProvider({ children }: { children: ReactNode }) {
  const [families, setFamilies] = useState<string[]>([]);
  const [status, setStatus] = useState<LocalFontAccessStatus>("idle");

  const loadLocalFonts = useCallback(async () => {
    setStatus("loading");
    const result = await queryLocalFontFamilies();
    setFamilies(result.families);
    setStatus(result.status);
  }, []);

  const value = useMemo(
    () => ({ families, loadLocalFonts, status }),
    [families, loadLocalFonts, status],
  );

  return <LocalFontsContext value={value}>{children}</LocalFontsContext>;
}

export function useLocalFonts(): LocalFontsContextValue {
  const context = use(LocalFontsContext);
  if (!context) throw new Error("useLocalFonts must be used within LocalFontsProvider");
  return context;
}
