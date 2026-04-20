import * as React from "react";
import { twMerge } from "tailwind-merge";

function join(...parts: Array<string | undefined>) {
  return twMerge(parts.filter(Boolean).join(" "));
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={join("border border-ink-soft bg-paper transition-[box-shadow,transform] hover:shadow-[3px_3px_0_oklch(0.4_0.02_60/0.12)] hover:-translate-y-px", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={join("p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={join("font-hand font-semibold tracking-tight text-ink", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={join("text-sm text-ink-soft", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={join("px-6 pb-6", className)} {...props} />;
}
