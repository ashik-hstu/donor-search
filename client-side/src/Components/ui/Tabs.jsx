import React from "react";
import { cn } from "../../lib/utils";

export const TabsList = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-2xl bg-zinc-100 p-1 text-zinc-600 gap-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const TabsTrigger = ({ active, onClick, className, children, ...props }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
        active
          ? "bg-white text-zinc-950 shadow-xs font-extrabold"
          : "text-zinc-600 hover:text-zinc-950 hover:bg-white/50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
