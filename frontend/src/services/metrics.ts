import type { Entry } from "./journal";

export const CLOTH_WEEKS = 12;

export type ClothDay = {
  date: Date;
  count: number;
  moods: string[];
  future: boolean;
};

export type CurvePeriod = "semana" | "mes" | "ano";

export type CurvePoint = {
  x: number; // 0 a 1
  valence: number; // -2 a +2
  mood: string;
  label: string;
  detail: string;
  notes: number;
};

export type CurveAxisLabel = {
  x: number;
  label: string;
  sub?: string;
};

export type MoodCount = {
  mood: string;
  days: number;
};

export type Pattern = {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  count: number;
  mood: string | null;
};

export const MOOD_VALENCE: Record<string, number> = {
  alegria: 2,
  gratitud: 2,
  paz: 1,
  reflexion: 0,
  cansancio: -1,
  tristeza: -2,
  ansiedad: -2,
};

export const MOOD_NAMES: Record<string, string> = {
  paz: "Paz",
  alegria: "Alegría",
  gratitud: "Gratitud",
  reflexion: "Reflexión",
  cansancio: "Cansancio",
  ansiedad: "Ansiedad",
  tristeza: "Tristeza",
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function dominantMood(moodList: string[]): string {
  const counts = new Map<string, number>();
  moodList.forEach((m) => counts.set(m, (counts.get(m) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function averageValence(moodList: string[]): number {
  if (!moodList.length) return 0;
  const sum = moodList.reduce((acc, m) => acc + (MOOD_VALENCE[m] ?? 0), 0);
  return sum / moodList.length;
}

export function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function streakDays(entries: Entry[]): number {
  if (!entries.length) return 0;
  const dayKeys = new Set(entries.map((e) => dateKey(new Date(e.created_at))));
  const today = startOfDay(new Date());
  let current = new Date(today);

  // Si hoy no se ha escrito todavía, comprobamos si la racha venía de ayer
  if (!dayKeys.has(dateKey(current))) {
    current.setDate(current.getDate() - 1);
    if (!dayKeys.has(dateKey(current))) return 0;
  }

  let streak = 0;
  while (dayKeys.has(dateKey(current))) {
    streak += 1;
    current.setDate(current.getDate() - 1);
  }
  return streak;
}

// 12 semanas (84 días) de lunes a domingo para la cuadrícula "Tu tela"
export function clothDays(entries: Entry[], weeks = CLOTH_WEEKS): ClothDay[][] {
  const byDay = new Map<string, Entry[]>();
  for (const e of entries) {
    const k = dateKey(new Date(e.created_at));
    byDay.set(k, [...(byDay.get(k) ?? []), e]);
  }

  const today = startOfDay(new Date());
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const columns: ClothDay[][] = [];
  for (let w = weeks - 1; w >= 0; w -= 1) {
    const column: ClothDay[] = [];
    for (let d = 0; d < 7; d += 1) {
      const date = new Date(monday);
      date.setDate(monday.getDate() - w * 7 + d);
      const list = byDay.get(dateKey(date)) ?? [];
      column.push({
        date,
        count: list.length,
        moods: [...new Set(list.map((n) => n.mood).filter(Boolean))],
        future: date > today,
      });
    }
    columns.push(column);
  }
  return columns;
}

// Conteo de días únicos por cada ánimo dentro del período
export function moodDays(entries: Entry[], days: number): MoodCount[] {
  const from = startOfDay(new Date());
  from.setDate(from.getDate() - (days - 1));
  const seen = new Map<string, Set<string>>();

  for (const e of entries) {
    const d = new Date(e.created_at);
    if (!e.mood || d < from) continue;
    const set = seen.get(e.mood) ?? new Set<string>();
    set.add(dateKey(d));
    seen.set(e.mood, set);
  }

  return Object.keys(MOOD_VALENCE)
    .map((mood) => ({ mood, days: seen.get(mood)?.size ?? 0 }))
    .filter((m) => m.days > 0)
    .sort((a, b) => b.days - a.days);
}

// Resumen global de escritura
export function summary(entries: Entry[]) {
  const days = new Set(entries.map((e) => dateKey(new Date(e.created_at))));
  return {
    streak: streakDays(entries),
    notes: entries.length,
    words: entries.reduce((sum, e) => sum + wordCount(e.content), 0),
    daysWritten: days.size,
  };
}

// Resumen del último mes (30 días)
export function recentSummary(entries: Entry[], days = 30) {
  const since = startOfDay(new Date());
  since.setDate(since.getDate() - (days - 1));
  const recent = entries.filter((e) => new Date(e.created_at) >= since);
  const moodList = recent.flatMap((e) => (e.mood ? [e.mood] : []));
  const topMood = moodList.length ? dominantMood(moodList) : null;

  return {
    streak: streakDays(entries),
    notes: recent.length,
    daysWritten: new Set(recent.map((e) => dateKey(new Date(e.created_at)))).size,
    days,
    topMood,
    topMoodCount: topMood ? moodList.filter((m) => m === topMood).length : 0,
    moodNotes: moodList.length,
  };
}

// Curva emocional (Semana: 7 días individuales | Mes: 5 semanas agrupadas | Año: 12 meses)
export function moodCurve(
  entries: Entry[],
  period: CurvePeriod
): { points: CurvePoint[]; axis: CurveAxisLabel[] } {
  const today = startOfDay(new Date());

  if (period === "ano") {
    const points: CurvePoint[] = [];
    const axis: CurveAxisLabel[] = [];
    for (let i = 11; i >= 0; i -= 1) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const x = (11 - i) / 11;
      const label = capitalize(
        month.toLocaleDateString("es-ES", { month: "short" }).replace(".", "")
      );
      axis.push({ x, label: label.charAt(0).toUpperCase() });

      const list = entries.filter((e) => {
        const d = new Date(e.created_at);
        return (
          e.mood &&
          d.getFullYear() === month.getFullYear() &&
          d.getMonth() === month.getMonth()
        );
      });
      const moodList = list.map((e) => e.mood);
      if (moodList.length) {
        const mood = dominantMood(moodList);
        points.push({
          x,
          valence: averageValence(moodList),
          mood,
          label: capitalize(
            month.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
          ),
          detail: `${list.length} ${list.length === 1 ? "nota" : "notas"} · sobre todo ${MOOD_NAMES[mood] || mood}`,
          notes: list.length,
        });
      }
    }
    return { points, axis };
  }

  if (period === "mes") {
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const points: CurvePoint[] = [];
    const axis: CurveAxisLabel[] = [];

    for (let i = 4; i >= 0; i -= 1) {
      const start = new Date(monday);
      start.setDate(monday.getDate() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      const x = (4 - i) / 4;
      const short = `${start.getDate()} ${start
        .toLocaleDateString("es-ES", { month: "short" })
        .replace(".", "")}`;
      axis.push({ x, label: i === 0 ? "Actual" : short });

      const list = entries.filter((e) => {
        const d = new Date(e.created_at);
        return e.mood && d >= start && d < end;
      });
      const moodList = list.map((e) => e.mood);
      if (moodList.length) {
        const mood = dominantMood(moodList);
        points.push({
          x,
          valence: averageValence(moodList),
          mood,
          label:
            i === 0
              ? "Esta semana"
              : `Semana del ${start.getDate()} de ${start.toLocaleDateString("es-ES", {
                  month: "long",
                })}`,
          detail: `${list.length} ${list.length === 1 ? "nota" : "notas"} · sobre todo ${MOOD_NAMES[mood] || mood}`,
          notes: list.length,
        });
      }
    }
    return { points, axis };
  }

  // Período: semana (7 días individuales)
  const days = 7;
  const byDay = new Map<string, Entry[]>();
  entries.forEach((e) => {
    if (!e.mood) return;
    const k = dateKey(new Date(e.created_at));
    byDay.set(k, [...(byDay.get(k) ?? []), e]);
  });

  const points: CurvePoint[] = [];
  const axis: CurveAxisLabel[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const x = (days - 1 - i) / (days - 1);
    const list = byDay.get(dateKey(date)) ?? [];
    const moodList = list.map((e) => e.mood);
    const mood = moodList.length ? dominantMood(moodList) : null;

    axis.push({
      x,
      label: capitalize(
        date.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "")
      ).slice(0, 3),
      sub: mood ? MOOD_NAMES[mood] : "—",
    });

    if (mood) {
      points.push({
        x,
        valence: averageValence(moodList),
        mood,
        label: capitalize(
          date.toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })
        ),
        detail: `${list.length} ${list.length === 1 ? "nota" : "notas"} · ${[
          ...new Set(moodList),
        ]
          .map((m) => MOOD_NAMES[m] || m)
          .join(", ")}`,
        notes: list.length,
      });
    }
  }

  return { points, axis };
}

const MOMENTS = [
  { label: "en la madrugada", from: 0, to: 5 },
  { label: "en la mañana", from: 5, to: 12 },
  { label: "en la tarde", from: 12, to: 19 },
  { label: "en la noche", from: 19, to: 24 },
];

export function favoriteMoment(entries: Entry[]): string | null {
  if (entries.length < 3) return null;
  const counts = MOMENTS.map((m) => ({
    ...m,
    count: entries.filter((e) => {
      const h = new Date(e.created_at).getHours();
      return h >= m.from && h < m.to;
    }).length,
  }));
  return counts.sort((a, b) => b.count - a.count)[0].label;
}

// Patrones descubiertos entre temas y ánimos
export function patterns(entries: Entry[]): Pattern[] {
  const byTag = new Map<string, Entry[]>();
  entries.forEach((e) => {
    if (e.tag) {
      byTag.set(e.tag, [...(byTag.get(e.tag) ?? []), e]);
    }
  });

  const list: Pattern[] = [];
  byTag.forEach((tagEntries, tag) => {
    if (tagEntries.length < 2) return;
    const moodList = tagEntries.map((e) => e.mood).filter(Boolean);
    if (!moodList.length) return;
    const mood = dominantMood(moodList);
    const withMood = moodList.filter((m) => m === mood).length;
    list.push({
      id: `tag-${tag}`,
      title: `#${tag} y ${MOOD_NAMES[mood]?.toLowerCase() || mood}`,
      subtitle: `${tagEntries.length} notas · sobre todo ${MOOD_NAMES[mood] || mood}`,
      detail: `Escribiste sobre #${tag} en ${tagEntries.length} notas; en ${withMood} de ellas elegiste ${MOOD_NAMES[mood] || mood}.`,
      count: tagEntries.length,
      mood,
    });
  });

  const moment = favoriteMoment(entries);
  if (moment) {
    list.push({
      id: "moment",
      title: `Escribes ${moment}`,
      subtitle: "Tu momento del día",
      detail: `La mayoría de tus notas las escribiste ${moment}.`,
      count: entries.length,
      mood: null,
    });
  }

  return list.sort((a, b) => b.count - a.count).slice(0, 4);
}
