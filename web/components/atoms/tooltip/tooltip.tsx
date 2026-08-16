"use client";

import type { ReactElement } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/cn";

type TooltipProps = {
  children: ReactElement;
  content: string;
  delayDuration?: number;
  side?: "bottom" | "top";
};

/** Shared Radix tooltip trigger with the project's visual treatment. */
export function Tooltip({ children, content, delayDuration, side = "top" }: TooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          className={cn(
            "z-50 max-w-48 rounded-md bg-ink px-2 py-1 text-xs leading-4 text-white shadow-sm",
            "data-[state=closed]:opacity-0 data-[state=delayed-open]:opacity-100 data-[state=instant-open]:opacity-100",
          )}
          side={side}
          sideOffset={8}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-ink" height={5} width={8} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
