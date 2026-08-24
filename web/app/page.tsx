import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Coffee,
  Download,
  Ellipse,
  ExternalLink,
  FileJson,
  Gauge,
  GitFork,
  Hash,
  History,
  Languages,
  Layers3,
  LibraryBig,
  LineStyle,
  LockKeyhole,
  MonitorSmartphone,
  MousePointer2,
  Rainbow,
  RectangleHorizontal,
  RotateCw,
  Ruler,
  ShieldCheck,
  Shapes,
  Slash,
  Sparkles,
  Type,
  UserRoundX,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Gauge Generator — Free browser-based gauge designer",
  description:
    "Design precise gauges and instrument faces in your browser. Free, open source, no registration, and local-first with editable JSON project files.",
  keywords: [
    "gauge designer",
    "gauge generator",
    "instrument face",
    "dial designer",
    "vector editor",
    "open source",
  ],
  authors: [{ name: "Gauge Generator contributors" }],
  creator: "Gauge Generator contributors",
  openGraph: {
    title: "Gauge Generator — Design precise gauges in your browser",
    description:
      "A free, open-source and local-first vector editor for gauges, dials, and instrument faces.",
    locale: "en_US",
    siteName: "Gauge Generator",
    type: "website",
  },
  robots: { index: true, follow: true },
  twitter: {
    card: "summary_large_image",
    title: "Gauge Generator — Free browser-based gauge designer",
    description: "Free, open source, no account, and no project data sent to a server.",
  },
};

const GITHUB_URL = "https://github.com/adan2013/Gauge-Generator";

const principles: Array<{
  description: string;
  icon: LucideIcon;
  title: string;
}> = [
  {
    icon: ShieldCheck,
    title: "Free and open source",
    description: "Use every editor feature without a subscription, paywall, or trial period.",
  },
  {
    icon: UserRoundX,
    title: "No registration",
    description: "Open the editor and start building. There is no account to create or sign in to.",
  },
  {
    icon: LockKeyhole,
    title: "Your project stays local",
    description: "Project data and autosaves remain in your browser instead of going to a cloud.",
  },
  {
    icon: FileJson,
    title: "Readable JSON files",
    description: "Download an open, plain-text project file that you can inspect and keep forever.",
  },
];

const capabilities: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: Ruler,
    title: "Precise ranges",
    description:
      "Build circular or rounded-square value paths with linear, logarithmic, or custom mapping.",
  },
  {
    icon: Layers3,
    title: "A real layer workflow",
    description: "Combine ticks, numbers, arcs, labels, needles, shapes, lines, and Lucide icons.",
  },
  {
    icon: MousePointer2,
    title: "Visual editing",
    description:
      "Adjust properties and drag editing handles while the fitted canvas updates immediately.",
  },
  {
    icon: Download,
    title: "Useful exports",
    description: "Keep the editable JSON source or export finished artwork as SVG, PNG, and PDF.",
  },
  {
    icon: LibraryBig,
    title: "Editable examples",
    description:
      "Open complete projects, inspect how they work, and turn them into your own design.",
  },
  {
    icon: Languages,
    title: "Community translations",
    description: "The language catalogues are open for contributors to translate and improve.",
  },
];

const layerIcons: Array<{
  className: string;
  icon: LucideIcon;
  label: string;
}> = [
  { className: "left-[8%] top-[16%] -rotate-6", icon: LineStyle, label: "Tick scale" },
  { className: "left-[31%] top-[6%] rotate-3", icon: Hash, label: "Numeric scale" },
  { className: "right-[14%] top-[14%] rotate-6", icon: Type, label: "Label" },
  { className: "left-[18%] top-[45%] rotate-3", icon: Rainbow, label: "Arc" },
  { className: "left-[44%] top-[34%] z-10 -rotate-3", icon: Gauge, label: "Needle" },
  { className: "right-[8%] top-[47%] -rotate-6", icon: Ellipse, label: "Ellipse" },
  {
    className: "bottom-[7%] left-[5%] rotate-6",
    icon: RectangleHorizontal,
    label: "Rectangle",
  },
  { className: "bottom-[3%] left-[38%] -rotate-6", icon: Slash, label: "Line" },
  { className: "bottom-[8%] right-[15%] rotate-3", icon: Shapes, label: "Icon" },
];

const softwareApplicationData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Gauge Generator",
  applicationCategory: "DesignApplication",
  operatingSystem: "Any operating system with a modern web browser",
  description:
    "A free, open-source, browser-based vector editor for gauges, dials, and instrument faces.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  isAccessibleForFree: true,
};

function PrincipleCard({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <article className="border-t border-border py-6">
      <Icon aria-hidden="true" className="mb-5 text-accent" size={24} strokeWidth={1.8} />
      <h3 className="font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{description}</p>
    </article>
  );
}

function CapabilityCard({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-6 shadow-[0_12px_35px_rgba(32,36,43,0.05)]">
      <span className="grid size-10 place-items-center rounded-xl bg-accent-subtle text-accent">
        <Icon aria-hidden="true" size={21} strokeWidth={1.8} />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </article>
  );
}

function LayerIconCloud() {
  return (
    <div
      aria-label="Gauge Generator layer types: scales, labels, arcs, needles, shapes, lines, and icons"
      className="relative min-h-80 overflow-hidden rounded-2xl border border-border bg-app"
      role="img"
    >
      <div className="absolute inset-12 rounded-full bg-accent-subtle blur-3xl" />
      {layerIcons.map(({ className, icon: Icon, label }) => (
        <div
          className={cn(
            "absolute grid size-20 place-items-center rounded-2xl border border-border bg-surface",
            "text-accent shadow-[0_16px_36px_rgba(32,36,43,0.12)] sm:size-24",
            className,
          )}
          key={label}
        >
          <Icon aria-hidden="true" size={32} strokeWidth={1.65} />
          <span className="sr-only">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-dvh overflow-hidden bg-app">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationData) }}
        type="application/ld+json"
      />

      <header className="border-b border-border bg-surface/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <Link aria-label="Gauge Generator home" className="flex min-w-0 items-center" href="/">
            <Image
              alt=""
              className="size-9 sm:hidden"
              height={512}
              priority
              src="/brand/gauge-generator-mark.svg"
              width={512}
            />
            <Image
              alt=""
              className="hidden h-11 w-auto sm:block"
              height={300}
              priority
              src="/brand/gauge-generator-logo-horizontal.svg"
              width={1180}
            />
          </Link>
          <nav
            aria-label="Primary navigation"
            className="flex shrink-0 items-center gap-1 sm:gap-2"
          >
            <a
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface-subtle hover:text-ink md:inline-flex"
              href="#features"
            >
              Features
            </a>
            <Link
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface-subtle hover:text-ink sm:inline-flex"
              href="/docs/en"
            >
              Help center
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:px-4"
              href="/app"
            >
              <span className="hidden min-[420px]:inline">Open editor</span>
              <span className="min-[420px]:hidden">Editor</span>
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:px-10 lg:py-24">
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.16em] text-accent">
            Open source · local first · completely free
          </p>
          <h1 className="max-w-2xl text-balance text-5xl font-semibold tracking-[-0.045em] text-ink sm:text-6xl lg:text-7xl">
            Design precise gauges. Keep every file yours.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-muted">
            A focused vector editor for gauges, dials, and instrument faces. It runs entirely in
            your browser, needs no account, and stores editable projects as readable JSON.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              href="/app"
            >
              Try the editor — it&apos;s free <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              href="/docs/en"
            >
              <BookOpen aria-hidden="true" size={17} /> Read the guide
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-full bg-accent-subtle/80 blur-3xl" />
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_28px_80px_rgba(32,36,43,0.16)]">
            <div className="border-b border-border bg-surface-subtle px-3 py-3 sm:px-4">
              <div className="flex items-center gap-2.5">
                <div className="mr-1 hidden items-center gap-1.5 sm:flex">
                  <span className="size-2.5 rounded-full bg-accent/70" />
                  <span className="size-2.5 rounded-full bg-border" />
                  <span className="size-2.5 rounded-full bg-border" />
                </div>
                <div className="flex items-center gap-1 text-muted">
                  <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.8} />
                  <ArrowRight
                    aria-hidden="true"
                    className="opacity-45"
                    size={16}
                    strokeWidth={1.8}
                  />
                  <RotateCw aria-hidden="true" className="ml-1" size={14} strokeWidth={1.8} />
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-center rounded-lg border border-border bg-surface px-3 py-1.5 text-[11px] font-medium text-muted shadow-sm">
                  <LockKeyhole aria-hidden="true" className="mr-2 shrink-0" size={12} />
                  <span className="truncate">gauge-generator · /app</span>
                </div>
              </div>
            </div>
            <Image
              alt="Gauge Generator editor with a complete gauge project and layer controls"
              className="h-auto w-full"
              height={900}
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              src="/docs/editor-overview.png"
              width={1440}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="principles-title" className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1.28fr_0.72fr] lg:gap-16 lg:px-10 lg:py-16">
          <div className="max-w-md lg:order-2 lg:justify-self-end lg:pt-5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
              The promise
            </p>
            <h2
              id="principles-title"
              className="mt-3 text-3xl font-semibold tracking-tight text-ink"
            >
              A tool you can simply use.
            </h2>
            <p className="mt-4 leading-7 text-muted">
              No onboarding maze, locked features, or hidden storage model. Just a focused tool with
              clear ownership of your work.
            </p>
          </div>
          <div className="grid gap-x-10 sm:grid-cols-2 lg:order-1">
            {principles.map((principle) => (
              <PrincipleCard key={principle.title} {...principle} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto max-w-7xl scroll-mt-8 px-5 py-20 sm:px-8 sm:py-24 lg:px-10"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
            Made for real projects
          </p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            More than a picture of a dial.
          </h2>
          <p className="mt-5 text-pretty text-lg leading-8 text-muted">
            Define the value system once, then build a complete design from reusable vector layers.
            Every change stays editable and every preview updates live.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((capability) => (
            <CapabilityCard key={capability.title} {...capability} />
          ))}
        </div>

        <div className="mt-16 grid items-center gap-10 rounded-3xl border border-border bg-surface p-5 shadow-[0_20px_60px_rgba(32,36,43,0.07)] sm:p-8 lg:grid-cols-[1.08fr_0.92fr] lg:p-10">
          <LayerIconCloud />
          <div className="lg:pl-4">
            <span className="grid size-11 place-items-center rounded-xl bg-accent-subtle text-accent">
              <Sparkles aria-hidden="true" size={23} strokeWidth={1.8} />
            </span>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-ink">
              Built around the way gauges work.
            </h2>
            <p className="mt-4 leading-7 text-muted">
              Shared Ranges keep ticks, numbers, arcs, labels, and needles aligned. Layer controls
              provide precision, while on-canvas handles make experimentation feel immediate.
            </p>
            <Link
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover"
              href="/docs/en#visual-layer-types"
            >
              Explore every layer type <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:px-10">
          <div>
            <span className="grid size-11 place-items-center rounded-xl bg-accent-subtle text-accent">
              <History aria-hidden="true" size={23} strokeWidth={1.8} />
            </span>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-accent">
              Rebuilt from scratch
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              A 2019 desktop idea, reimagined for the web.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-8 text-muted">
            <p>
              Gauge Generator began as a PC application in 2019. This edition keeps the original
              goal—making custom gauges approachable—but rewrites the project for the browser with a
              broader layer system, live editing, modern exports, and a cleaner project format.
            </p>
            <p>
              It remains a small independent project: practical, transparent, and built for people
              who would rather make something than create another account.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="grid gap-10 rounded-3xl bg-ink px-6 py-10 text-white sm:px-10 sm:py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-14">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.14em] text-white/60">
              <GitFork aria-hidden="true" size={20} /> Open source by default
            </div>
            <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Inspect the code. Keep your files. Help shape what comes next.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-white/70">
              The editor, documentation, and language catalogues are developed in public. You can
              report an issue, improve a translation, add a new language, or contribute code.
            </p>
          </div>
          <a
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            href={GITHUB_URL}
            rel="noreferrer"
            target="_blank"
          >
            View on GitHub <ExternalLink aria-hidden="true" size={16} />
          </a>
        </div>
      </section>

      <section className="border-y border-border bg-accent-subtle">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-5 py-20 text-center sm:px-8 sm:py-24">
          <span className="grid size-12 place-items-center rounded-2xl bg-accent text-white">
            <MonitorSmartphone aria-hidden="true" size={25} strokeWidth={1.8} />
          </span>
          <h2 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Your next gauge can start right now.
          </h2>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-muted">
            Open an example, move a few layers, and export the result. There is nothing to install,
            nothing to sign up for, and nothing to pay for.
          </p>
          <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              href="/app"
            >
              Try Gauge Generator <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-subtle"
              href="/docs/en"
            >
              <BookOpen aria-hidden="true" size={17} /> Help center
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="coffee-title"
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10"
      >
        <div className="flex flex-col gap-6 rounded-2xl border border-dashed border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-subtle text-muted">
              <Coffee aria-hidden="true" size={22} strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Support the project
              </p>
              <h2 id="coffee-title" className="mt-1 text-xl font-semibold text-ink">
                Buy me a coffee
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                A simple way to support future development will appear here.
              </p>
            </div>
          </div>
          <span className="w-fit rounded-full bg-surface-subtle px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
            Coming soon
          </span>
        </div>
      </section>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <Image
            alt="Gauge Generator"
            className="h-11 w-auto"
            height={300}
            src="/brand/gauge-generator-logo-horizontal.svg"
            width={1180}
          />
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link className="hover:text-ink" href="/app">
              Editor
            </Link>
            <Link className="hover:text-ink" href="/docs/en">
              Help center
            </Link>
            <a className="hover:text-ink" href={GITHUB_URL} rel="noreferrer" target="_blank">
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
