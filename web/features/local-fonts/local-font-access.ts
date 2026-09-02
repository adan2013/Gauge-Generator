export type LocalFontAccessStatus =
  "idle" | "loading" | "loaded" | "denied" | "unsupported" | "error";

type LocalFontData = {
  family: string;
};

type WindowWithLocalFontAccess = Window & {
  queryLocalFonts?: () => Promise<readonly LocalFontData[]>;
};

export type LocalFontQueryResult =
  | { families: string[]; status: "loaded" }
  | { families: []; status: "denied" | "unsupported" | "error" };

export function uniqueFontFamilies(fonts: readonly LocalFontData[]): string[] {
  return [...new Set(fonts.map((font) => font.family.trim()).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right),
  );
}

export async function queryLocalFontFamilies(): Promise<LocalFontQueryResult> {
  const queryLocalFonts = (window as WindowWithLocalFontAccess).queryLocalFonts;
  if (!queryLocalFonts) return { families: [], status: "unsupported" };

  try {
    const fonts = await queryLocalFonts.call(window);
    return { families: uniqueFontFamilies(fonts), status: "loaded" };
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      return { families: [], status: "denied" };
    }
    return { families: [], status: "error" };
  }
}
