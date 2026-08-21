import type { TextStyleDto } from "@/features/project/project-dto/project-dto";

export function getTextStyleSvgAttributes(style: TextStyleDto): string {
  return [
    `fill="${style.color}"`,
    `font-family="${escapeXml(style.font.family)}"`,
    `font-size="${formatSvgNumber(style.sizeMm)}"`,
    style.bold ? 'font-weight="700"' : "",
    style.italic ? 'font-style="italic"' : "",
    style.underline ? 'text-decoration="underline"' : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character];
  });
}

export function formatSvgNumber(value: number): string {
  return Number(value.toFixed(3)).toString();
}
