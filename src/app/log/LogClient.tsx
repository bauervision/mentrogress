"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LiftOnMount from "@/components/LiftOnMount";
import SetEntry from "@/components/SetEntry";

export default function LogClient() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <LiftOnMount>
          <main className="p-4 max-w-md mx-auto space-y-4">
            <h2 className="text-xl font-semibold accent-outline">Log</h2>

            {/* Example 1: No history yet */}
            <SetEntry label="Bicep Curl — Top Set" exerciseId="curl" />

            {/* Example 2: With a recent best (45 lb × 10 reps) */}
            <SetEntry
              label="Dumbbell Bench — Top Set"
              exerciseId="db-bench"
              recentSessionsForExercise={7}
            />
          </main>
        </LiftOnMount>
      </AppLayout>
    </ProtectedRoute>
  );
}
