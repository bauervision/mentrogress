"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { readProfile } from "@/lib/profile";
import { storageKey } from "@/lib/storageKeys";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function contrastOn(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return L > 0.6 ? "#000000" : "#ffffff";
}
function applyFromProfile() {
  const p = readProfile();
  const tone = p.toneHex || "#ffffff";
  const [r, g, b] = hexToRgb(tone);
  const alpha = p.toneTintAlpha ?? 0.06;
  const bright = p.toneBrightness ?? 0.0;
  const root = document.documentElement;
  root.style.setProperty("--accent", tone);
  root.style.setProperty("--accent-contrast", contrastOn(tone));
  root.style.setProperty("--accent-r", String(r));
  root.style.setProperty("--accent-g", String(g));
  root.style.setProperty("--accent-b", String(b));
  root.style.setProperty("--bg-tint-alpha", String(alpha));
  root.style.setProperty("--bg-brightness", String(bright));
}

export default function ToneLoader() {
  const pathname = usePathname();

  useEffect(() => {
    applyFromProfile();

    const onTone = () => applyFromProfile();
    const onFocus = () => applyFromProfile();

    window.addEventListener(storageKey("tone"), onTone);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      window.removeEventListener(storageKey("tone"), onTone);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  useEffect(() => {
    applyFromProfile();
  }, [pathname]);

  return null;
}
