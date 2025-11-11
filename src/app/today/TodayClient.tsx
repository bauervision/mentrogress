"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/providers/AuthProvider";
import AppLayout from "@/components/AppLayout";
import LiftOnMount from "@/components/LiftOnMount";
import WeighInQuickCard from "@/components/WeighInQuickCard";
import WeighInNudge from "@/components/WeighInNudge";

export default function TodayClient() {
  const { logout } = useAuth();

  return (
    <ProtectedRoute>
      <AppLayout>
        <LiftOnMount>
          <main className="p-4 max-w-md mx-auto">
            <header className="flex items-center justify-between mb-4">
              <h2 className="accent-outline text-xl font-semibold">Today</h2>

              <button onClick={logout} className="text-sm opacity-80 underline">
                Logout
              </button>
            </header>

            <div className="rounded-xl border border-white/10 p-4 bg-white/5">
              <p className="opacity-90 mb-2">Welcome to Mentrogress.</p>
              <p className="text-sm opacity-70 mb-3">
                Create your first workout template to get started.
              </p>
              <a
                href="/templates"
                className="accent-btn inline-block text-sm rounded-xl px-3 py-2 bg-white text-black font-medium"
              >
                Create Templates
              </a>

              <WeighInNudge />
              <WeighInQuickCard />
            </div>
          </main>
        </LiftOnMount>
      </AppLayout>
    </ProtectedRoute>
  );
}
