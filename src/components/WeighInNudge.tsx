"use client";
import { readProfile } from "@/lib/profile";
import { listWeighIns } from "@/lib/weighIns";

export default function WeighInNudge() {
  const p = readProfile();
  if (!p.weighInDay) return null;

  const last = listWeighIns().slice(-1)[0];
  const today = new Date();
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][today.getDay()];
  const missing =
    dow === p.weighInDay &&
    (!last || last.isoDate !== new Date().toISOString().slice(0, 10));

  if (!missing) return null;

  return (
    <div className="rounded-lg border border-amber-400/30 bg-amber-500/15 text-amber-200 px-3 py-2 text-sm">
      Weigh-in day — log today’s weight to keep your trend accurate.
    </div>
  );
}
