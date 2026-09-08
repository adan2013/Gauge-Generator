import Image from "next/image";
import Link from "next/link";
import {
  Ellipse,
  Gauge,
  Hash,
  LineStyle,
  Rainbow,
  RectangleHorizontal,
  Shapes,
  Slash,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";

export type TableOfContentsItem = { depth: 2 | 3; id: string; label: string };

const EXPLICIT_HEADING_ID = /\s+\{#([a-z0-9][a-z0-9-]*)\}\s*$/;

function headingMetadata(value: string) {
  const match = EXPLICIT_HEADING_ID.exec(value);
  const label = (match ? value.slice(0, match.index) : value).trim();

  return {
    id:
      match?.[1] ??
      label
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-"),
    label,
  };
}

export function headingId(value: string) {
  return headingMetadata(value).id;
}

export function extractTableOfContents(markdown: string): TableOfContentsItem[] {
  return markdown.split("\n").flatMap((line) => {
    const match = /^(##|###)\s+(.+)$/.exec(line);
    if (!match) return [];
    const heading = headingMetadata(match[2].replace(/[*_`]/g, "").trim());
    return [
      {
        depth: match[1].length as 2 | 3,
        id: heading.id,
        label: heading.label,
      },
    ];
  });
}

function textFromChildren(children: ReactNode) {
  return Array.isArray(children) ? children.join("") : String(children);
}

const LAYER_HEADING_ICONS: Record<string, LucideIcon[]> = {
  "tick-scale": [LineStyle],
  "numeric-scale": [Hash],
  label: [Type],
  arc: [Rainbow],
  needle: [Gauge],
  "ellipse-and-rectangle": [Ellipse, RectangleHorizontal],
  line: [Slash],
  icon: [Shapes],
};

function MarkdownLink({ href = "", children, ...props }: ComponentPropsWithoutRef<"a">) {
  const className =
    "font-medium text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent";
  if (href.startsWith("/"))
    return (
      <Link className={className} href={href} {...props}>
        {children}
      </Link>
    );
  return (
    <a className={className} href={href} rel="noreferrer" target="_blank" {...props}>
      {children}
    </a>
  );
}

function MarkdownParagraph({ children, node }: ComponentPropsWithoutRef<"p"> & ExtraProps) {
  const link = node?.children.length === 1 ? node.children[0] : undefined;
  if (link?.type === "element" && link.tagName === "a") {
    const href = link.properties.href;
    const videoId =
      typeof href === "string"
        ? /^https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})$/.exec(href)?.[1]
        : undefined;
    const title = link.children
      .filter((child) => child.type === "text")
      .map((child) => child.value)
      .join("");

    if (videoId && title) {
      return (
        <figure className="my-8 space-y-3">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="aspect-video w-full rounded-xl border border-border bg-surface"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title={title}
          />
          <figcaption className="text-sm leading-6 text-muted">{children}</figcaption>
        </figure>
      );
    }
  }

  return <p className="my-5 leading-7 text-muted">{children}</p>;
}

export function DocsMarkdown({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      components={{
        a: MarkdownLink,
        blockquote: ({ children }) => (
          <blockquote className="my-7 rounded-r-xl border-l-4 border-accent bg-accent-subtle px-5 py-4 text-ink">
            {children}
          </blockquote>
        ),
        h1: ({ children }) => (
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2
            className="scroll-mt-8 border-t border-border pt-12 text-3xl font-semibold tracking-tight text-ink first:border-0"
            id={headingId(textFromChildren(children))}
          >
            {children}
          </h2>
        ),
        h3: ({ children }) => {
          const heading = headingMetadata(textFromChildren(children));
          const icons = LAYER_HEADING_ICONS[heading.id];
          return (
            <h3
              className="flex scroll-mt-8 items-center gap-3 pt-5 text-xl font-semibold tracking-tight text-ink"
              id={heading.id}
            >
              {icons ? (
                <span className="flex shrink-0 gap-1.5" role="presentation">
                  {icons.map((Icon, index) => (
                    <span
                      className="grid size-9 place-items-center rounded-lg bg-accent-subtle text-accent"
                      key={index}
                    >
                      <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                    </span>
                  ))}
                </span>
              ) : null}
              {heading.label}
            </h3>
          );
        },
        img: ({ alt = "", src }) =>
          typeof src === "string" ? (
            <Image
              alt={alt}
              className="my-8 h-auto w-full rounded-xl border border-border bg-surface shadow-[0_16px_45px_rgba(32,36,43,0.1)]"
              height={900}
              src={src}
              width={1440}
            />
          ) : null,
        li: ({ children }) => <li className="pl-1 marker:text-accent">{children}</li>,
        ol: ({ children }) => (
          <ol className="my-5 list-decimal space-y-2 pl-6 leading-7 text-muted">{children}</ol>
        ),
        p: MarkdownParagraph,
        strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
        table: ({ children }) => (
          <div className="my-7 overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-xl border-collapse text-left text-sm">{children}</table>
          </div>
        ),
        td: ({ children }) => (
          <td className="border-t border-border px-4 py-3 align-top leading-6 text-muted">
            {children}
          </td>
        ),
        th: ({ children }) => (
          <th className="bg-surface-subtle px-4 py-3 font-semibold text-ink">{children}</th>
        ),
        ul: ({ children }) => (
          <ul className="my-5 list-disc space-y-2 pl-6 leading-7 text-muted">{children}</ul>
        ),
      }}
      remarkPlugins={[remarkGfm]}
    >
      {markdown}
    </ReactMarkdown>
  );
}
