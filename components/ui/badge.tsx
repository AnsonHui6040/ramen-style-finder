import * as React from "react";

function join(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border border-stamp text-stamp font-code",
    secondary: "border border-ink-soft text-ink-soft bg-paper",
  } as const;

  return (
    <span
      className={join(
        "inline-flex items-center px-2 py-0.5 text-[10px] tracking-widest",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
