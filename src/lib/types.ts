export type SavedSet = {
  exerciseId: string;
  isoDate: string;
  weightKg: number;
  reps: number;
};

export type TrackStatus = "green" | "amber" | "red";

export type WeighIn = { isoDate: string; weightKg: number; note?: string };

export type SetEntryLog = {
  id: string; // stable id for edit/remove
  isoDate: string; // YYYY-MM-DD
  weightKg: number;
  reps: number;
  createdAt: number; // tiebreaker inside same day
};

export type Store = Record<string, SetEntryLog[]>;
