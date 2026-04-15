import * as React from "react";

function join(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Progress({ value = 0, className }: { value?: number; className?: string }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className={join("w-full overflow-hidden rounded-full bg-slate-200", className)}>
      <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${width}%` }} />
    </div>
  );
}
