"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/** ISO yyyy-mm-dd helpers */
function toISO(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fromISO(iso?: string | null) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}
function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function fmtLong(d: Date) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      d
    );
  } catch {
    return toISO(d);
  }
}

export default function DatePicker({
  value, // ISO "yyyy-mm-dd" or null
  onChange,
  minISO, // optional min date ISO
  maxISO, // optional max date ISO
  placeholder = "Pick a date",
}: {
  value: string | null;
  onChange: (iso: string | null) => void;
  minISO?: string;
  maxISO?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const selected = fromISO(value);
  const min = fromISO(minISO);
  const max = fromISO(maxISO);

  const [month, setMonth] = useState<Date>(() =>
    startOfMonth(selected ?? new Date())
  );

  useEffect(() => {
    if (selected) setMonth(startOfMonth(selected));
  }, [value]);

  // close on outside / ESC
  useEffect(() => {
    function onPointer(e: PointerEvent) {
      if (!anchorRef.current) return;
      if (!anchorRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer, { capture: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer, {
        capture: true,
      } as any);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const grid = useMemo(() => {
    const first = startOfMonth(month);
    const firstW = (first.getDay() + 7) % 7; // 0=Sun
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0
    ).getDate();
    const cells: Date[] = [];
    // prev month fillers
    for (let i = 0; i < firstW; i++) {
      const d = new Date(month.getFullYear(), month.getMonth(), -i);
      cells.unshift(d);
    }
    // this month
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push(new Date(month.getFullYear(), month.getMonth(), i));
    }
    // next month fillers to complete 6 rows
    while (cells.length % 7 !== 0 || cells.length < 42) {
      const last = cells[cells.length - 1];
      cells.push(
        new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)
      );
    }
    return cells;
  }, [month]);

  function isDisabled(d: Date) {
    if (min && d < min) return true;
    if (max && d > max) return true;
    return false;
  }

  return (
    <div ref={anchorRef} className="relative">
      {/* Button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-xl px-3 py-2 bg-black/40 border border-white/10 flex items-center justify-between"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 opacity-80" />
          <span className="text-sm opacity-90">
            {selected ? fmtLong(selected) : placeholder}
          </span>
        </span>
        <span
          className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          className="absolute z-50 mt-2 w-[min(92vw,22rem)] rounded-xl border border-white/10 bg-black p-2 shadow-lg"
        >
          {/* Month header */}
          <div className="flex items-center justify-between px-1 py-1.5">
            <button
              className="p-1 rounded-lg hover:bg-white/10"
              onClick={() => setMonth((m) => addMonths(m, -1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-sm font-medium">
              {new Intl.DateTimeFormat(undefined, {
                month: "long",
                year: "numeric",
              }).format(month)}
            </div>
            <button
              className="p-1 rounded-lg hover:bg-white/10"
              onClick={() => setMonth((m) => addMonths(m, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 text-[11px] opacity-70 px-1 pb-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1 px-1 pb-1">
            {grid.map((d, i) => {
              const inMonth = d.getMonth() === month.getMonth();
              const chosen = selected && sameDay(d, selected);
              const disabled = isDisabled(d);
              return (
                <button
                  key={`${d.toISOString()}-${i}`}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    onChange(toISO(d));
                    setOpen(false);
                  }}
                  className={[
                    "h-9 rounded-lg text-sm",
                    inMonth ? "opacity-90" : "opacity-40",
                    chosen
                      ? "bg-white text-black font-semibold"
                      : "bg-black/30 hover:bg-white/10 border border-white/10",
                    disabled ? "opacity-30 cursor-not-allowed" : "",
                  ].join(" ")}
                  title={fmtLong(d)}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {/* Clear / Today */}
          <div className="flex items-center justify-between px-1 pt-1">
            <button
              className="text-xs underline opacity-80"
              onClick={() => onChange(null)}
            >
              Clear
            </button>
            <button
              className="text-xs rounded-lg px-2 py-1 border border-white/15 hover:bg-white/10"
              onClick={() => {
                const t = new Date();
                onChange(toISO(t));
                setMonth(startOfMonth(t));
                setOpen(false);
              }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
