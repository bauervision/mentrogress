"use client";
import { useState } from "react";
import { addWeighIn, lastN } from "@/lib/weighIns";
import { readProfile, kgToLb, lbToKg } from "@/lib/profile";
import OnTrackBadge from "./OnTrackBadge";
import Sparkline from "./Sparkline";

const isoToday = () => new Date().toISOString().slice(0, 10);

export default function WeighInQuickCard() {
  const p = readProfile();
  const unit = p.unitSystem ?? "imperial";
  const [date, setDate] = useState(isoToday());
  const [w, setW] = useState<string>("");

  function submit() {
    const kg =
      unit === "imperial"
        ? w
          ? lbToKg(Number(w))
          : null
        : w
        ? Number(w)
        : null;
    if (kg == null) return;
    addWeighIn({ isoDate: date, weightKg: kg });
    setW("");
  }

  const recent = lastN(6);

  const data = lastN(10).map((w) => {
    const unit = readProfile().unitSystem ?? "imperial";
    return unit === "imperial" ? kgToLb(w.weightKg) : w.weightKg;
  });

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-80">Weekly weigh-in</div>
        <OnTrackBadge />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          className="rounded-xl px-3 py-2 bg-black/40 border border-white/10"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          placeholder={unit === "imperial" ? "lb" : "kg"}
          inputMode="decimal"
          className="rounded-xl px-3 py-2 bg-black/40 border border-white/10"
          value={w}
          onChange={(e) => setW(e.target.value)}
        />
      </div>

      <button
        onClick={submit}
        className="accent-btn w-full rounded-xl px-3 py-2 font-medium"
      >
        Save weigh-in
      </button>

      {/* mini list */}
      <div className="mt-1 grid grid-cols-3 gap-1 text-[11px] opacity-80">
        {recent.map((r) => {
          const val =
            unit === "imperial"
              ? `${kgToLb(r.weightKg).toFixed(1)} lb`
              : `${r.weightKg.toFixed(1)} kg`;
          return (
            <div
              key={r.isoDate}
              className="rounded border border-white/10 bg-black/30 px-2 py-1"
            >
              <div className="opacity-60">{r.isoDate.slice(5)}</div>
              <div className="font-medium">{val}</div>
            </div>
          );
        })}
      </div>

      <Sparkline values={data} />
    </div>
  );
}
