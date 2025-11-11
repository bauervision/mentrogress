"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LiftOnMount from "@/components/LiftOnMount";

export default function LogClient() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <LiftOnMount>
          <main className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-3 accent-outline">Log</h2>
            <p className="opacity-80 text-sm">
              Workout logging will live here.
            </p>
          </main>
        </LiftOnMount>
      </AppLayout>
    </ProtectedRoute>
  );
}
