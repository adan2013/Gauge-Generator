"use client";

import { useEffect, useMemo, useState } from "react";
import { resolveLucideIconDefinitions, type SvgIconDefinition } from "./lucide-icon-resources";

export function useLucideIconDefinitions(
  requestedNames: readonly string[],
): ReadonlyMap<string, SvgIconDefinition> {
  const namesKey = [...new Set(requestedNames)].sort().join("\0");
  const names = useMemo(() => (namesKey ? namesKey.split("\0") : []), [namesKey]);
  const [definitions, setDefinitions] = useState<ReadonlyMap<string, SvgIconDefinition>>(
    () => new Map(),
  );

  useEffect(() => {
    let active = true;
    resolveLucideIconDefinitions(names).then((resolved) => {
      if (active) setDefinitions(resolved);
    });
    return () => {
      active = false;
    };
  }, [names]);

  return definitions;
}
