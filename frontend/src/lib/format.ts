// Fechas y horas en hora local, como en la app (lib/format.ts). Nunca `toISOString().slice(0, 10)`:
// en Venezuela (UTC−4) eso pasa al día siguiente todo lo escrito después de las 20:00.

// Clave de un día en hora local: "año-mes-día", con el mes desde 0 (igual que la app).
export function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// La fecha de una clave de día.
export function dateFromDayKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m, d);
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function sameDay(a: string, b: string) {
  return dayKey(new Date(a)) === dayKey(new Date(b));
}

// "Hoy", "Ayer" o "Martes 21 de septiembre".
export function dayLabel(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(date) === dayKey(today)) return "Hoy";
  if (dayKey(date) === dayKey(yesterday)) return "Ayer";
  return capitalize(date.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" }));
}

export function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("es", { hour: "numeric", minute: "2-digit" });
}

// Para listas: la hora si es de hoy, "Ayer", o la fecha corta.
export function shortWhen(iso: string) {
  const label = dayLabel(iso);
  if (label === "Hoy") return timeLabel(iso);
  if (label === "Ayer") return "Ayer";
  return new Date(iso).toLocaleDateString("es", { day: "numeric", month: "short" });
}

export function sessionLabel(iso: string) {
  const date = new Date(iso);
  return `${capitalize(date.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" }))}, ${timeLabel(iso)}`;
}

// "Hoy", "ayer" o "el martes 21 de septiembre", para frases como "Escribiste hoy a las 7:16".
export function whenInSentence(iso: string) {
  const label = dayLabel(iso);
  if (label === "Hoy") return "hoy";
  if (label === "Ayer") return "ayer";
  return `el ${label.charAt(0).toLowerCase()}${label.slice(1)}`;
}
