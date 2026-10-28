import React from "react";
import { cn } from "../../lib/utils";

const buttonVariants = {
  variant: {
    default: "bg-red-600 text-white hover:bg-red-700 shadow-xs active:scale-[0.99]",
    destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-xs active:scale-[0.99]",
    outline: "border border-zinc-200 bg-white hover:bg-zinc-50 hover:text-zinc-900 text-zinc-700 shadow-2xs active:scale-[0.99]",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80 active:scale-[0.99]",
    ghost: "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
    link: "text-red-600 underline-offset-4 hover:underline p-0 h-auto",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs active:scale-[0.99]",
  },
  size: {
    default: "h-9.5 px-4 py-2 text-xs sm:text-sm",
    sm: "h-8 rounded-lg px-3 text-xs",
    lg: "h-11 rounded-xl px-6 text-sm font-semibold",
    icon: "h-9 w-9 p-0",
    "icon-sm": "h-7 w-7 p-0",
  },
};

export const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", asChild = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold rounded-xl select-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:border-red-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          buttonVariants.variant[variant] || buttonVariants.variant.default,
          buttonVariants.size[size] || buttonVariants.size.default,
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
