import type { RootState } from "@/store/store";
import { makeStore } from "@/store/store";

export function createTestStore(preloadedState?: Partial<RootState>) {
  return makeStore(preloadedState);
}
