"use client";

import { onTrackStatus } from "@/lib/weighIns";

// adjust path to where you placed it

export default function OnTrackBadge() {
  const res = onTrackStatus();
  if (!res) return null;

  const tone =
    res.status === "green"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
      : res.status === "amber"
      ? "bg-amber-500/20 text-amber-300 border-amber-400/30"
      : "bg-rose-500/20 text-rose-300 border-rose-400/30";

  return (
    <div className={`rounded-lg border px-2 py-1 text-xs ${tone}`}>
      {res.msg}
    </div>
  );
}
