import React from "react";
import { useCountdown } from "../hooks/useCountdown";
import { Clock, ShieldAlert } from "lucide-react";
import { Badge } from "./ui";

export default function CountdownBadge({ targetDate, compact = false }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isExpired || !targetDate) {
    return (
      <Badge variant="success" className="gap-1.5 py-1 px-2.5 text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-white shrink-0 animate-pulse"></span>
        Eligible to Donate
      </Badge>
    );
  }

  if (compact) {
    return (
      <Badge variant="warning" className="gap-1.5 text-xs tabular-nums font-semibold py-1 px-2.5">
        <Clock className="w-3 h-3 text-amber-800" />
        <span>
          {days}d {hours}h {minutes}m {seconds}s
        </span>
      </Badge>
    );
  }

  return (
    <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 shadow-2xs">
      <div className="flex items-center justify-between text-xs font-semibold text-amber-900 mb-2">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          3-Month Medical Cooldown
        </span>
        <Badge variant="warning" size="sm">
          Resting Period
        </Badge>
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-center tabular-nums">
        <div className="bg-white border border-amber-200/70 rounded-lg py-1.5 px-1 shadow-2xs">
          <span className="block text-sm font-bold text-amber-950">{days}</span>
          <span className="text-[10px] text-zinc-500 font-medium">Days</span>
        </div>
        <div className="bg-white border border-amber-200/70 rounded-lg py-1.5 px-1 shadow-2xs">
          <span className="block text-sm font-bold text-amber-950">{hours}</span>
          <span className="text-[10px] text-zinc-500 font-medium">Hours</span>
        </div>
        <div className="bg-white border border-amber-200/70 rounded-lg py-1.5 px-1 shadow-2xs">
          <span className="block text-sm font-bold text-amber-950">{minutes}</span>
          <span className="text-[10px] text-zinc-500 font-medium">Mins</span>
        </div>
        <div className="bg-white border border-amber-200/70 rounded-lg py-1.5 px-1 shadow-2xs">
          <span className="block text-sm font-bold text-red-600">{seconds}</span>
          <span className="text-[10px] text-zinc-500 font-medium">Secs</span>
        </div>
      </div>
      <p className="text-[11px] text-amber-800/90 text-center mt-2 font-medium">
        Next eligible donation begins once countdown completes.
      </p>
    </div>
  );
}
