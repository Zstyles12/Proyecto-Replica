// La agenda semanal de un psicólogo dicha en palabras, y si un momento cae dentro de ella.
// Los días van de 0 (domingo) a 6 (sábado), como Date.getDay().

export type WeeklySchedule = { days: number[]; from: string; to: string };

const NAMES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
// La semana como se piensa: de lunes a domingo.
const ORDER = [1, 2, 3, 4, 5, 6, 0];

function list(items: string[]) {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} y ${items.at(-1)}` : (items[0] ?? "");
}

// "de lunes a viernes, de 15:00 a 19:00", "lunes, miércoles y viernes, de 9:00 a 13:00".
export function describeSchedule({ days, from, to }: WeeklySchedule) {
  const sorted = ORDER.filter((d) => days.includes(d));
  const positions = sorted.map((d) => ORDER.indexOf(d));
  const consecutive = positions.every((p, i) => i === 0 || p === positions[i - 1] + 1);
  const dayText =
    sorted.length === 7
      ? "todos los días"
      : consecutive && sorted.length >= 3
        ? `de ${NAMES[sorted[0]]} a ${NAMES[sorted.at(-1) ?? 0]}`
        : list(sorted.map((d) => NAMES[d]));
  return `${dayText}, de ${from} a ${to}`;
}

// day: "2026-11-06" y hour: "16:30", en hora local.
export function withinSchedule(schedule: WeeklySchedule, day: string, hour: string) {
  const date = new Date(`${day}T${hour}`);
  if (Number.isNaN(date.getTime())) return true;
  return schedule.days.includes(date.getDay()) && hour >= schedule.from && hour < schedule.to;
}
