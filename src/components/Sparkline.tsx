"use client";
export default function Sparkline({ values }: { values: number[] }) {
  if (!values.length) return null;
  const w = 120,
    h = 36,
    pad = 4;
  const min = Math.min(...values),
    max = Math.max(...values) || 1;
  const sx = (i: number) =>
    pad + (i * (w - 2 * pad)) / (values.length - 1 || 1);
  const sy = (v: number) =>
    h -
    pad -
    (max === min ? 0.5 * h : ((v - min) / (max - min)) * (h - 2 * pad));
  const d = values.map((v, i) => `${i ? "L" : "M"}${sx(i)},${sy(v)}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-80">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
