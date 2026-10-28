import React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = {
  variant: {
    default: "bg-red-600 text-white border-transparent",
    secondary: "bg-zinc-100 text-zinc-900 border-zinc-200",
    destructive: "bg-rose-50 text-rose-700 border-rose-200",
    outline: "text-zinc-800 border-zinc-200 bg-white",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-900 border-amber-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
  },
};

export const Badge = ({ className, variant = "default", children, ...props }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors select-none",
        badgeVariants.variant[variant] || badgeVariants.variant.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
