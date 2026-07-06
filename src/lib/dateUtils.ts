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

export function addDays(dateISO: string, days: number): string {
  const d = new Date(dateISO + "T00:00:00");
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/**
 * Sábado y domingo son día de planificación: por defecto conviene mostrar
 * la semana que arranca el lunes siguiente, no la que ya está terminando.
 */
export function defaultWeekStart(): string {
  const today = new Date();
  const monday = getMondayOf(today);
  if (today.getDay() === 6 || today.getDay() === 0) {
    monday.setDate(monday.getDate() + 7);
  }
  return toISODate(monday);
}

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(start.getTime() + 6 * DAY_MS);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} al ${end.getDate()} de ${MONTHS[start.getMonth()]}`;
  }
  return `${start.getDate()} de ${MONTHS[start.getMonth()]} al ${end.getDate()} de ${MONTHS[end.getMonth()]}`;
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
