const DAY_MS = 24 * 60 * 60 * 1000;

export function toISODate(d: Date): string {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function getMondayOf(d: Date): Date {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function currentWeekId(): string {
  return toISODate(getMondayOf(new Date()));
}

export function weekDates(weekStart: string): string[] {
  const start = new Date(weekStart + "T00:00:00");
  return Array.from({ length: 7 }, (_, i) =>
    toISODate(new Date(start.getTime() + i * DAY_MS))
  );
}

export const WEEKDAY_LABELS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export function weekdayOf(dateISO: string): number {
  return new Date(dateISO + "T00:00:00").getDay();
}

export function currentSeasonForHemisphereSur(): "verano" | "invierno" {
  const month = new Date().getMonth() + 1;
  return [10, 11, 12, 1, 2, 3].includes(month) ? "verano" : "invierno";
}
