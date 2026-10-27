import React from "react";
import { useCountdown } from "../hooks/useCountdown";
import { Clock, ShieldAlert } from "lucide-react";

export default function CountdownBadge({ targetDate, compact = false }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);

  if (isExpired || !targetDate) {
    return (
      <span className="badge badge-success gap-1.5 text-xs font-semibold py-2 px-3">
        <span className="w-2 h-2 rounded-full bg-white shrink-0"></span>
        Eligible to Donate
      </span>
    );
  }

  if (compact) {
    return (
      <div className="badge badge-warning gap-1 text-xs tabular-nums font-medium py-2 px-2">
        <Clock className="w-3 h-3 text-amber-800" />
        <span>
          {days}d {hours}h {minutes}m {seconds}s
        </span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3">
      <div className="flex items-center justify-between text-xs font-semibold text-amber-900 mb-2">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          3-Month Medical Cooldown
        </span>
        <span className="text-[10px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded font-bold">
          Resting Period
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-center tabular-nums">
        <div className="bg-white border border-amber-200/60 rounded-md py-1 px-1">
          <span className="block text-sm font-bold text-amber-950">{days}</span>
          <span className="text-[10px] text-zinc-500">Days</span>
        </div>
        <div className="bg-white border border-amber-200/60 rounded-md py-1 px-1">
          <span className="block text-sm font-bold text-amber-950">{hours}</span>
          <span className="text-[10px] text-zinc-500">Hours</span>
        </div>
        <div className="bg-white border border-amber-200/60 rounded-md py-1 px-1">
          <span className="block text-sm font-bold text-amber-950">{minutes}</span>
          <span className="text-[10px] text-zinc-500">Mins</span>
        </div>
        <div className="bg-white border border-amber-200/60 rounded-md py-1 px-1">
          <span className="block text-sm font-bold text-red-600">{seconds}</span>
          <span className="text-[10px] text-zinc-500">Secs</span>
        </div>
      </div>
      <p className="text-[11px] text-amber-800/80 text-center mt-2">
        Next eligible donation begins once countdown completes.
      </p>
    </div>
  );
}
