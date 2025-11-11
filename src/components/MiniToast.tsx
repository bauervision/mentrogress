"use client";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function MiniToast({
  text,
  ms = 1400,
  gap = 16, // space above the bottom nav
}: {
  text: string;
  ms?: number;
  gap?: number;
}) {
  const [show, setShow] = useState(true);
  const [bottom, setBottom] = useState<number>(96);

  useEffect(() => {
    const id = setTimeout(() => setShow(false), ms);
    return () => clearTimeout(id);
  }, [ms]);

  useLayoutEffect(() => {
    function compute() {
      const nav = document.getElementById("bottom-nav");
      const navH = nav?.offsetHeight ?? 64;
      // safe-area inset for iOS
      const safe = getComputedStyle(document.documentElement)
        .getPropertyValue("env(safe-area-inset-bottom)")
        .trim();
      const safePx = safe && safe.endsWith("px") ? parseFloat(safe) : 0;
      setBottom(navH + gap + safePx);
    }
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("orientationchange", compute);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("orientationchange", compute);
    };
  }, [gap]);

  if (!show || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 z-9999 px-3 py-2 text-sm rounded-xl border border-white/15 bg-white/10 backdrop-blur shadow pointer-events-none"
      style={{ bottom }}
    >
      {text}
    </div>,
    document.body
  );
}
