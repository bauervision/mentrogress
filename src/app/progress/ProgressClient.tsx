"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LiftOnMount from "@/components/LiftOnMount";

export default function ProgressClient() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <LiftOnMount>
          <main className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-3 accent-outline">
              Progress
            </h2>
            <p className="opacity-80 text-sm">
              Charts and milestones coming soon.
            </p>
          </main>
        </LiftOnMount>
      </AppLayout>
    </ProtectedRoute>
  );
}
