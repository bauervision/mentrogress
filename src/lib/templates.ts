export type Exercise = {
  id: string; // e.g., "squat"
  name: string; // "Back Squat"
  notes?: string;
};

export type Template = {
  id: string; // "monday-legs"
  name: string; // "Monday Legs"
  exercises: Exercise[]; // order matters
  warmup: WarmupItem[];
  updatedAt: number;
  iconKey?: string;
};

export type WarmupItem = {
  id: string; // slug of text
  text: string; // e.g., "100 jumping jacks"
};

const KEY = "mentrogress_templates_v1";

export function readTemplates(): Template[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as any[]) : [];

    return list.map((t) => ({
      ...t,
      warmup: Array.isArray(t.warmup) ? t.warmup : [],
    })) as Template[];
  } catch {
    return [];
  }
}

export function writeTemplates(list: Template[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function upsertTemplate(t: Template) {
  const list = readTemplates();
  const idx = list.findIndex((x) => x.id === t.id);
  if (idx >= 0) list[idx] = t;
  else list.unshift(t);
  writeTemplates(list);
}

export function removeTemplate(id: string) {
  writeTemplates(readTemplates().filter((t) => t.id !== id));
}

export function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
