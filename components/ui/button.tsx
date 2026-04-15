import * as React from "react";

function join(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type Variant = "default" | "secondary" | "outline";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  asChild?: boolean;
}

export function Button({ className, variant = "default", disabled, asChild = false, children, ...props }: ButtonProps) {
  const variants: Record<Variant, string> = {
    default: "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300",
    outline: "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100",
  };

  const mergedClassName = join(
    "inline-flex min-h-12 select-none touch-manipulation items-center justify-center px-4 py-3 text-sm font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    className,
  );

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      className: join(mergedClassName, child.props.className),
      ...(disabled ? { "aria-disabled": true } : {}),
    });
  }

  return (
    <button className={mergedClassName} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
