type StatusMessageProps = { children?: string };

export function StatusMessage({ children }: StatusMessageProps) {
  if (!children) return null;
  return <p aria-live="polite" className="fixed right-5 bottom-5 z-20 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted shadow-[0_12px_30px_rgba(32,36,43,0.12)]">{children}</p>;
}
