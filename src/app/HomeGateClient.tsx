// app/HomeGateClient.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { BRAND_NAME } from "@/lib/brand";

export default function HomeGateClient() {
  const { user, authReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authReady) return; // don’t move until we know auth state

    const target = user ? "/today" : "/login";
    router.replace(target);
  }, [authReady, user, router]);

  // While we’re waiting on auth, show a stable splash.
  // After authReady flips true, the effect will fire and navigate away.
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold tracking-wide">{BRAND_NAME}</p>
        <p className="text-xs text-slate-400">Warming up your last session…</p>
      </div>
    </div>
  );
}
