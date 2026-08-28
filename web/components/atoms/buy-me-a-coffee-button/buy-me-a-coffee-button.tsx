import Image from "next/image";
import { BUY_ME_A_COFFEE_URL } from "@/lib/external-links";
import { cn } from "@/lib/cn";

const BUY_ME_A_COFFEE_BUTTON_URL = "https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png";

export function BuyMeACoffeeButton({ className, label }: { className?: string; label: string }) {
  return (
    <a
      aria-label={label}
      className={cn(
        "inline-block w-[217px] max-w-full rounded-lg transition-opacity hover:opacity-90",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        className,
      )}
      href={BUY_ME_A_COFFEE_URL}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Image
        alt="Buy Me a Coffee"
        className="h-auto max-w-full"
        height={60}
        src={BUY_ME_A_COFFEE_BUTTON_URL}
        width={217}
      />
    </a>
  );
}
