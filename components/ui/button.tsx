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
    default: "bg-stamp text-white hover:opacity-90 active:opacity-75",
    secondary: "bg-paper-light text-ink border border-ink-soft hover:bg-paper-deep",
    outline: "border border-ink-soft bg-paper text-ink hover:bg-paper-light",
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
