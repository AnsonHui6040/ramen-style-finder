import * as React from "react";

function join(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-900 text-white",
    secondary: "bg-slate-100 text-slate-700",
  } as const;

  return <span className={join("inline-flex items-center px-2.5 py-1 text-xs font-medium", variants[variant], className)} {...props} />;
}
