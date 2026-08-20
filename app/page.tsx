"use client";

import { useEffect, useMemo, useState } from "react";
import EntryComposer from "@/components/EntryComposer";
import StreakBadge from "@/components/StreakBadge";
import HistoryList from "@/components/HistoryList";
import CalendarView from "@/components/CalendarView";
import { Entry, Mood } from "@/lib/types";
import {
  addEntry,
  calculateStreak,
  deleteEntry,
  loadEntries,
  longestStreak,
  todayKey,
} from "@/lib/storage";

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("list");

  useEffect(() => {
    setEntries(loadEntries());
    setLoaded(true);
  }, []);

  const todayEntry = useMemo(
    () => entries.find((e) => e.date === todayKey()) ?? null,
    [entries]
  );

  const streak = useMemo(() => calculateStreak(entries), [entries]);
  const longest = useMemo(() => longestStreak(entries), [entries]);

  const handleSave = (text: string, mood: Mood) => {
    const isNewToday = !todayEntry;
    const entry: Entry = {
      id: todayEntry?.id ?? crypto.randomUUID(),
      date: todayKey(),
      text,
      mood,
      createdAt: new Date().toISOString(),
    };
    setEntries(addEntry(entry));
    if (isNewToday) {
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 1600);
    }
  };

  const handleDelete = (id: string) => {
    setEntries(deleteEntry(id));
  };

  if (!loaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-teal-50">
        <p className="text-slate-400">Loading your journal...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-teal-50">
      <div className="mx-auto max-w-md px-4 py-8 space-y-6">
        <header className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 via-pink-500 to-teal-500 bg-clip-text text-transparent">
            Gratitude Journal
          </h1>
          <p className="text-sm text-slate-500">
            A little daily habit for a brighter mind ✨
          </p>
        </header>

        <StreakBadge
          streak={streak}
          longest={longest}
          totalEntries={entries.length}
        />

        <EntryComposer
          existingEntry={todayEntry}
          onSave={handleSave}
          celebrating={celebrating}
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-700">Your journey</h2>
            <div className="flex rounded-full bg-white/70 p-1 border border-slate-200">
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  view === "list"
                    ? "bg-slate-800 text-white"
                    : "text-slate-500"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  view === "calendar"
                    ? "bg-slate-800 text-white"
                    : "text-slate-500"
                }`}
              >
                Calendar
              </button>
            </div>
          </div>

          {view === "list" ? (
            <HistoryList entries={entries} onDelete={handleDelete} />
          ) : (
            <CalendarView entries={entries} />
          )}
        </div>

        <footer className="text-center text-xs text-slate-400 pt-4">
          Entries are saved only in this browser, on this device.
        </footer>
      </div>
    </main>
  );
}
