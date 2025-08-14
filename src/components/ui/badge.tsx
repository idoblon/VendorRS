import type * as React from "react";

function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(" ");
}

// Simple variant system without external dependencies
const badgeVariants = {
  default:
    "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-900/80",
  secondary:
    "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80",
  destructive:
    "border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80",
  outline: "text-slate-950 border-slate-200",
};

const baseClasses =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(baseClasses, badgeVariants[variant], className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
