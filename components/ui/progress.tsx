import * as React from "react";

function join(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Progress({ value = 0, className }: { value?: number; className?: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className={join("w-full overflow-hidden bg-paper-deep border-b border-ink-soft/40", className)}>
      <div className="h-full bg-ink transition-all" style={{ width: `${width}%` }} />
    </div>
  );
}
