import dynamicIconImports from "lucide-react/dynamicIconImports.mjs";

const SVG_ICON_TAGS = ["circle", "ellipse", "line", "path", "polygon", "polyline", "rect"] as const;
const SVG_ICON_ATTRIBUTES = [
  "cx",
  "cy",
  "d",
  "fill",
  "height",
  "points",
  "r",
  "rx",
  "ry",
  "width",
  "x",
  "x1",
  "x2",
  "y",
  "y1",
  "y2",
] as const;

export type SvgIconTag = (typeof SVG_ICON_TAGS)[number];
export type SvgIconNode = readonly [SvgIconTag, Readonly<Record<string, string>>];
export type SvgIconDefinition = {
  nodes: readonly SvgIconNode[];
  viewBox: readonly [minX: number, minY: number, width: number, height: number];
};

export const lucideIconNames = Object.keys(dynamicIconImports).sort() as Array<
  keyof typeof dynamicIconImports
>;

const iconNameSet = new Set<string>(lucideIconNames);
const definitionCache = new Map<string, Promise<SvgIconDefinition | null>>();

export function isLucideIconName(name: string): boolean {
  return iconNameSet.has(name);
}

export function resolveLucideIconDefinition(name: string): Promise<SvgIconDefinition | null> {
  const cached = definitionCache.get(name);
  if (cached) return cached;
  const request = loadLucideIconDefinition(name);
  definitionCache.set(name, request);
  return request;
}

export async function resolveLucideIconDefinitions(
  names: readonly string[],
): Promise<ReadonlyMap<string, SvgIconDefinition>> {
  const uniqueNames = [...new Set(names)];
  const definitions = await Promise.all(
    uniqueNames.map(async (name) => [name, await resolveLucideIconDefinition(name)] as const),
  );
  return new Map(
    definitions.filter((entry): entry is readonly [string, SvgIconDefinition] => entry[1] !== null),
  );
}

async function loadLucideIconDefinition(name: string): Promise<SvgIconDefinition | null> {
  if (!isLucideIconName(name)) return null;
  const loader = dynamicIconImports[name as keyof typeof dynamicIconImports];
  const iconModule = await loader();
  return {
    nodes: iconModule.__iconNode.map(([tag, attributes]) => normalizeNode(tag, attributes)),
    viewBox: [0, 0, 24, 24],
  };
}

function normalizeNode(tag: string, attributes: Record<string, string>): SvgIconNode {
  if (!SVG_ICON_TAGS.includes(tag as SvgIconTag)) throw new Error(`Unsupported Lucide tag: ${tag}`);
  const normalizedAttributes = Object.fromEntries(
    Object.entries(attributes).filter(
      ([name]) =>
        name !== "key" &&
        SVG_ICON_ATTRIBUTES.includes(name as (typeof SVG_ICON_ATTRIBUTES)[number]),
    ),
  );
  return [tag as SvgIconTag, normalizedAttributes];
}
