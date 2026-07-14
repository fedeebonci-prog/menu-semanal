"use client";

import { Settings } from "@/lib/types";
import { WEEKDAY_LABELS } from "@/lib/dateUtils";

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

interface Props {
  settings: Settings;
  onSeasonChange: (season: Settings["season"]) => void;
  onGymDaysChange: (days: number[]) => void;
}

export default function SettingsPanel({ settings, onSeasonChange, onGymDaysChange }: Props) {
  function toggleDay(day: number) {
    const has = settings.gymDays.includes(day);
    const updated = has
      ? settings.gymDays.filter((d) => d !== day)
      : [...settings.gymDays, day];
    onGymDaysChange(updated.sort((a, b) => a - b));
  }

  return (
    <section className="space-y-3 rounded-2xl border border-border-app bg-card p-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-muted">Estación</span>
        <div className="flex gap-1.5">
          {(["verano", "invierno"] as const).map((season) => (
            <button
              key={season}
              onClick={() => onSeasonChange(season)}
              className="rounded-full border px-3 py-1 text-xs font-bold"
              style={
                settings.season === season
                  ? { background: "var(--brand)", borderColor: "var(--brand)", color: "var(--card)" }
                  : { background: "var(--card)", borderColor: "var(--border-input)", color: "var(--foreground)" }
              }
            >
              {season === "verano" ? "Verano" : "Invierno"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-wide text-muted">Días de gimnasio</span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {WEEK_ORDER.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className="rounded-full border px-3 py-1 text-xs font-bold"
              style={
                settings.gymDays.includes(day)
                  ? { background: "var(--brand)", borderColor: "var(--brand)", color: "var(--card)" }
                  : { background: "var(--card)", borderColor: "var(--border-input)", color: "var(--foreground)" }
              }
            >
              {WEEKDAY_LABELS[day].slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
