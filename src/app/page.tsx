// app/page.tsx
import { Suspense } from "react";
import HomeGateClient from "./HomeGateClient";
import { BRAND_NAME } from "@/lib/brand";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold tracking-wide">
              {BRAND_NAME} initializing...
            </div>
            <div className="text-xs text-slate-400">
              Loading your workout data…
            </div>
          </div>
        </div>
      }
    >
      <HomeGateClient />
    </Suspense>
  );
}
