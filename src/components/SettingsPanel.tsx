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
    <section className="space-y-3 rounded-lg border border-brand-light bg-brand-light/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-brand-dark">Estación:</span>
        <div className="flex overflow-hidden rounded-full border border-brand-light text-sm">
          {(["verano", "invierno"] as const).map((season) => (
            <button
              key={season}
              onClick={() => onSeasonChange(season)}
              className={`px-3 py-1 ${
                settings.season === season
                  ? "bg-brand text-white"
                  : "bg-white text-brand-dark"
              }`}
            >
              {season === "verano" ? "Verano" : "Invierno"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-sm font-medium text-brand-dark">Días de gimnasio:</span>
        <div className="mt-1 flex flex-wrap gap-2">
          {WEEK_ORDER.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`rounded-full border px-3 py-1 text-xs ${
                settings.gymDays.includes(day)
                  ? "border-brand bg-brand text-white"
                  : "border-brand-light bg-white text-brand-dark"
              }`}
            >
              {WEEKDAY_LABELS[day].slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
