"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import LiftOnMount from "@/components/LiftOnMount";
import { useEffect, useState } from "react";
import {
  Exercise,
  Template,
  WarmupItem,
  readTemplates,
  removeTemplate,
  slugify,
  upsertTemplate,
} from "@/lib/templates";

import MiniToast from "@/components/MiniToast";
import { IconForName } from "@/lib/iconForName";
import IconPicker from "@/components/IconPicker";
import { safeStorage } from "@/lib/safeStorage";
import { storageKey } from "@/lib/storageKeys";

export default function TemplatesClient() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState("");
  const [exName, setExName] = useState("");
  const [warmText, setWarmText] = useState(""); // NEW
  const [editing, setEditing] = useState<Template | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const LIST_OPEN_KEY = storageKey("templates");
  const [listOpen, setListOpen] = useState<boolean>(false);
  const [iconKey, setIconKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = safeStorage.get(LIST_OPEN_KEY);
      if (raw != null) setListOpen(raw === "1");
    } catch {}
  }, []);

  function toggleList() {
    setListOpen((v) => {
      const next = !v;
      try {
        safeStorage.set(LIST_OPEN_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }

  useEffect(() => setTemplates(readTemplates()), []);

  function refresh() {
    setTemplates(readTemplates());
  }

  // Ensure we have an editing template (create one if needed)
  function ensureEditing(): Template {
    if (editing) return editing;
    const id = slugify(name || "Unnamed");
    const t: Template = {
      id,
      name: name || "Unnamed",
      warmup: [],
      exercises: [],
      updatedAt: Date.now(),
      iconKey,
    };
    setEditing(t);
    return t;
  }

  function saveTemplate() {
    const base = ensureEditing();
    const t: Template = {
      ...base,
      name: name || base.name,
      iconKey,
      updatedAt: Date.now(),
    };
    upsertTemplate(t);
    setEditing(t);
    refresh();

    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1200);

    setToast("Template saved ✓");
    setTimeout(() => setToast(null), 1500);
  }

  function addExercise() {
    if (!exName.trim()) return;
    const base = ensureEditing();
    const ex: Exercise = { id: slugify(exName), name: exName.trim() };
    const t: Template = {
      ...base,
      exercises: [...base.exercises, ex],
      updatedAt: Date.now(),
    };
    upsertTemplate(t);
    setEditing(t);
    refresh();
    setExName("");

    setToast("Exercise added");
    setTimeout(() => setToast(null), 1200);
  }

  function removeExerciseById(id: string) {
    if (!editing) return;
    const t: Template = {
      ...editing,
      exercises: editing.exercises.filter((e) => e.id !== id),
      updatedAt: Date.now(),
    };
    upsertTemplate(t);
    setEditing(t);
    refresh();

    setToast("Exercise removed");
    setTimeout(() => setToast(null), 1200);
  }

  // ---- Warm-up handlers ----
  function addWarmup() {
    if (!warmText.trim()) return;
    const base = ensureEditing();
    const item: WarmupItem = { id: slugify(warmText), text: warmText.trim() };
    const t: Template = {
      ...base,
      warmup: [...base.warmup, item],
      updatedAt: Date.now(),
    };
    upsertTemplate(t);
    setEditing(t);
    refresh();
    setWarmText("");

    setToast("Warm-up added");
    setTimeout(() => setToast(null), 1200);
  }

  function removeWarmupById(id: string) {
    if (!editing) return;
    const t: Template = {
      ...editing,
      warmup: editing.warmup.filter((w) => w.id !== id),
      updatedAt: Date.now(),
    };
    upsertTemplate(t);
    setEditing(t);
    refresh();

    setToast("Warm-up removed");
    setTimeout(() => setToast(null), 1200);
  }

  function startNew() {
    setName("");
    setExName("");
    setWarmText("");
    setIconKey(undefined);
    setEditing(null);
  }

  function editTemplate(t: Template) {
    setEditing(t);
    setName(t.name);
    setExName("");
    setWarmText("");
    setIconKey(t.iconKey);
  }

  function deleteTemplate(id: string) {
    removeTemplate(id);
    refresh();
    if (editing?.id === id) startNew();

    setToast("Template deleted");
    setTimeout(() => setToast(null), 1400);
  }

  const list = editing?.exercises ?? ([] as Exercise[]); // typed
  const warm = editing?.warmup ?? ([] as WarmupItem[]); // typed

  const count = templates.length;
  const plural = (n: number, s: string, p?: string) =>
    n === 1 ? s : p ?? s + "s";

  return (
    <ProtectedRoute>
      <AppLayout>
        <LiftOnMount>
          <main className="p-4 max-w-md mx-auto">
            <header className="flex items-center justify-between mb-4">
              <h2
                className="justify-self-start text-3xl accent-outline"
                style={{
                  fontFamily: "var(--font-brand), system-ui, sans-serif",
                }}
              >
                Templates
              </h2>
              <div className="flex items-center gap-3">
                <button
                  className="accent-btn text-sm rounded-xl border border-white/15 px-3 py-1.5 bg-white/5 hover:bg-white/10"
                  onClick={startNew}
                  aria-label="Create a new template"
                  title="Create a new template"
                >
                  +New
                </button>
              </div>
            </header>

            {/* Existing list */}
            <div
              role="group"
              aria-labelledby="tmpl-legend"
              className="mb-5 rounded-xl border border-white/10 bg-white/5"
            >
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <span
                    id="tmpl-legend"
                    className="px-1 text-sm uppercase tracking-wide opacity-70"
                  >
                    My Templates
                  </span>
                  {!listOpen && (
                    <span
                      className="text-xs rounded-md border border-white/15 bg-black/30 px-2 py-0.5 opacity-80"
                      aria-live="polite"
                    >
                      {count} {plural(count, "template")}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={toggleList}
                  aria-controls="tmpl-panel"
                  aria-expanded={listOpen}
                  aria-label={
                    listOpen
                      ? "Collapse templates list"
                      : `Expand templates list (${count} ${plural(
                          count,
                          "template"
                        )})`
                  }
                  className="text-xs rounded-lg border border-white/15 px-2 py-1 bg-black/20 hover:bg-black/30"
                >
                  {listOpen ? "Collapse" : "Expand"}
                </button>
              </div>

              {/* Collapsible panel */}
              <div id="tmpl-panel" hidden={!listOpen} className="px-3 pb-3">
                {templates.length === 0 ? (
                  <p className="text-sm opacity-80 p-2">
                    No templates yet. Click <b>New Template</b> to create your
                    first one.
                  </p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {templates.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-xl border border-white/10 bg-black/20 p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            <div className="font-medium flex items-center gap-2">
                              <IconForName
                                name={t.name}
                                className="w-5 h-5 opacity-90"
                              />
                              <span className="accent-outline">{t.name}</span>
                            </div>
                          </div>
                          <div className="text-xs opacity-70">
                            {t.warmup.length} warm-up • {t.exercises.length}{" "}
                            exercises
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="text-xs rounded border border-white/15 px-2 py-1"
                            onClick={() => editTemplate(t)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-xs rounded border border-white/15 px-2 py-1 opacity-80"
                            onClick={() => deleteTemplate(t.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Editor */}
            <section className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-3 relative">
                <h3 className="font-semibold accent-outline">
                  {editing ? "Edit Template" : "New Template"}
                </h3>
                <div className="absolute left-1/2 -translate-x-1/2"></div>
                <button
                  className="text-xs underline opacity-80"
                  onClick={startNew}
                >
                  Discard &amp; New
                </button>
              </div>

              <label className="grid gap-1 mb-3">
                <span className="text-sm opacity-80">Template name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='e.g., "Monday Legs"'
                  className="w-full rounded-xl px-3 py-2 bg-black/40 border border-white/10"
                />

                <label className="grid gap-1 mb-3">
                  <span className="text-sm opacity-80">
                    Icon (optional override)
                  </span>
                  <div className="flex items-center gap-2">
                    <IconPicker
                      value={iconKey}
                      onChange={(k) => setIconKey(k)}
                    />
                    {/* Live glyph preview beside the select */}
                    <div className="w-10 h-10 rounded-lg border border-white/10 bg-black/30 flex items-center justify-center">
                      <IconForName
                        name={name || editing?.name || ""}
                        iconKey={iconKey}
                        className="w-5 h-5 opacity-90"
                      />
                    </div>
                  </div>
                </label>
              </label>

              {/* Warm-up */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Warm-up</span>
                  <span className="text-xs opacity-70">
                    {warm.length} items
                  </span>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    value={warmText}
                    onChange={(e) => setWarmText(e.target.value)}
                    placeholder='e.g., "100 jumping jacks"'
                    className="flex-1 rounded-xl px-3 py-2 bg-black/40 border border-white/10"
                  />
                  <button
                    onClick={addWarmup}
                    className="accent-btn rounded-xl px-3 py-2 bg-white text-black text-xl font-medium"
                  >
                    +
                  </button>
                </div>
                <ul className="space-y-2">
                  {warm.map((w) => (
                    <li
                      key={w.id}
                      className="rounded-lg border border-white/10 px-3 py-2 flex items-center justify-between"
                    >
                      <span>{w.text}</span>
                      <button
                        className="text-xs opacity-80 underline"
                        onClick={() => removeWarmupById(w.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Exercises */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Exercises</span>
                  <span className="text-xs opacity-70">
                    {list.length} items
                  </span>
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    value={exName}
                    onChange={(e) => setExName(e.target.value)}
                    placeholder="Add exercise (e.g., Squat)"
                    className="flex-1 rounded-xl px-3 py-2 bg-black/40 border border-white/10"
                  />
                  <button
                    onClick={addExercise}
                    className="accent-btn rounded-xl px-3 py-2 bg-white text-black text-xl font-medium"
                  >
                    +
                  </button>
                </div>

                <ul className="space-y-2">
                  {list.map((ex) => (
                    <li
                      key={ex.id}
                      className="rounded-lg border border-white/10 px-3 py-2 flex items-center justify-between"
                    >
                      <span>{ex.name}</span>
                      {/* TS fix: id is typed as string via `list: Exercise[]` above */}
                      <button
                        className="text-xs opacity-80 underline"
                        onClick={() => removeExerciseById(ex.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                <p className="text-xs opacity-70 mt-2">
                  Save this template, then use <b>New Template</b> to create
                  another.
                </p>

                <button
                  onClick={saveTemplate}
                  className={`accent-btn rounded-xl px-3 py-2 text-sm font-medium ${
                    justSaved
                      ? "bg-emerald-500 text-black"
                      : "bg-white text-black"
                  } transition-colors`}
                >
                  {justSaved ? "Saved ✓" : "Save Template"}
                </button>
              </div>
            </section>

            <p className="text-xs opacity-70 mt-3">
              Tip: Every training day should include a warm-up. Example Leg Day:{" "}
              <b>100 jumping jacks</b> → light mobility → then first exercise
              warm-up sets.
            </p>

            {toast && <MiniToast text={toast} />}
          </main>
        </LiftOnMount>
      </AppLayout>
    </ProtectedRoute>
  );
}
