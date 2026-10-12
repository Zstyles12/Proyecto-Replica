import { streakDays, wordCount } from '../journal/store';
import type { Note } from '../journal/types';
import { MOODS, type Mood } from '../journal/moods';

// Solo datos reales: cada número sale de algo que el usuario escribió o eligió.

export const CLOTH_WEEKS = 12;

export type ClothDay = {
  date: Date;
  count: number;
  moods: Mood[];
  future: boolean;
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function key(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// Semanas de lunes a domingo; la última columna es la semana actual.
export function clothDays(notes: Note[], weeks = CLOTH_WEEKS): ClothDay[][] {
  const byDay = new Map<string, Note[]>();
  for (const n of notes) {
    const k = key(new Date(n.createdAt));
    byDay.set(k, [...(byDay.get(k) ?? []), n]);
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
      const list = byDay.get(key(date)) ?? [];
      column.push({
        date,
        count: list.length,
        moods: [...new Set(list.map((n) => n.mood).filter((m): m is Mood => !!m))],
        future: date > today,
      });
    }
    columns.push(column);
  }
  return columns;
}

export type MoodCount = { mood: Mood; days: number };

// Días (no notas) en que elegiste cada ánimo dentro del periodo.
export function moodDays(notes: Note[], days: number): MoodCount[] {
  const from = startOfDay(new Date());
  from.setDate(from.getDate() - (days - 1));
  const seen = new Map<Mood, Set<string>>();
  for (const n of notes) {
    const d = new Date(n.createdAt);
    if (!n.mood || d < from) continue;
    const set = seen.get(n.mood) ?? new Set<string>();
    set.add(key(d));
    seen.set(n.mood, set);
  }
  return MOODS.map((mood) => ({ mood, days: seen.get(mood)?.size ?? 0 }))
    .filter((m) => m.days > 0)
    .sort((a, b) => b.days - a.days);
}

export function topTags(notes: Note[], limit = 5) {
  const counts = new Map<string, number>();
  notes.forEach((n) => n.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

const MOMENTS = [
  { label: 'en la madrugada', from: 0, to: 5 },
  { label: 'en la mañana', from: 5, to: 12 },
  { label: 'en la tarde', from: 12, to: 19 },
  { label: 'en la noche', from: 19, to: 24 },
];

export function favoriteMoment(notes: Note[]) {
  if (notes.length < 3) return null;
  const counts = MOMENTS.map((m) => ({
    ...m,
    count: notes.filter((n) => {
      const h = new Date(n.createdAt).getHours();
      return h >= m.from && h < m.to;
    }).length,
  }));
  return counts.sort((a, b) => b.count - a.count)[0].label;
}

export function summary(notes: Note[]) {
  const days = new Set(notes.map((n) => key(new Date(n.createdAt))));
  return {
    streak: streakDays(notes),
    notes: notes.length,
    words: notes.reduce((sum, n) => sum + wordCount(n.text), 0),
    daysWritten: days.size,
  };
}

// Las métricas del perfil: lo que pasó en los últimos días, todo contado a partir de tus notas.
export function recentSummary(notes: Note[], days = 30) {
  const since = startOfDay(new Date());
  since.setDate(since.getDate() - (days - 1));
  const recent = notes.filter((n) => new Date(n.createdAt) >= since);
  const moodList = recent.flatMap((n) => (n.mood ? [n.mood] : []));
  const topMood = moodList.length ? dominant(moodList) : null;
  return {
    streak: streakDays(notes),
    notes: recent.length,
    daysWritten: new Set(recent.map((n) => key(new Date(n.createdAt)))).size,
    days,
    topMood,
    topMoodCount: topMood ? moodList.filter((m) => m === topMood).length : 0,
    moodNotes: moodList.length,
  };
}

// Posición de cada ánimo en una escala de agradable a difícil. No es un puntaje de salud mental:
// solo ordena en la curva los ánimos que la persona eligió.
export const MOOD_VALENCE: Record<Mood, number> = {
  alegria: 2,
  gratitud: 2,
  paz: 1,
  reflexion: 0,
  cansancio: -1,
  tristeza: -2,
  ansiedad: -2,
};

export type CurvePeriod = 'semana' | 'mes' | 'ano';

export type CurvePoint = {
  // Posición 0–1 en el eje horizontal.
  x: number;
  valence: number;
  mood: Mood;
  label: string;
  detail: string;
  notes: number;
};

export type CurveAxisLabel = { x: number; label: string; sub?: string };

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function dominant(moodList: Mood[]): Mood {
  const counts = new Map<Mood, number>();
  moodList.forEach((m) => counts.set(m, (counts.get(m) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function average(moodList: Mood[]) {
  return moodList.reduce((s, m) => s + MOOD_VALENCE[m], 0) / moodList.length;
}

// Curva del ánimo elegido: un punto por día (semana), por semana (mes) o por mes (año).
// Agrupar el mes por semanas evita un zigzag día a día que no se puede leer. Sin ánimo, no hay punto.
export function moodCurve(
  notes: Note[],
  period: CurvePeriod
): { points: CurvePoint[]; axis: CurveAxisLabel[] } {
  const today = startOfDay(new Date());
  if (period === 'ano') {
    const points: CurvePoint[] = [];
    const axis: CurveAxisLabel[] = [];
    for (let i = 11; i >= 0; i -= 1) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const x = (11 - i) / 11;
      const label = capitalize(month.toLocaleDateString('es', { month: 'short' }).replace('.', ''));
      axis.push({ x, label: label.charAt(0) });
      const list = notes.filter((n) => {
        const d = new Date(n.createdAt);
        return (
          n.mood && d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth()
        );
      });
      const moodList = list.map((n) => n.mood as Mood);
      if (moodList.length) {
        const mood = dominant(moodList);
        points.push({
          x,
          valence: average(moodList),
          mood,
          label: capitalize(month.toLocaleDateString('es', { month: 'long', year: 'numeric' })),
          detail: `${list.length} ${list.length === 1 ? 'nota' : 'notas'} · sobre todo ${MOOD_NAMES[mood]}`,
          notes: list.length,
        });
      }
    }
    return { points, axis };
  }

  if (period === 'mes') {
    // Cinco semanas de lunes a domingo: la actual y las cuatro anteriores.
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
      const short = `${start.getDate()} ${start.toLocaleDateString('es', { month: 'short' }).replace('.', '')}`;
      axis.push({ x, label: i === 0 ? 'Actual' : short });
      const list = notes.filter((n) => {
        const d = new Date(n.createdAt);
        return n.mood && d >= start && d < end;
      });
      const moodList = list.map((n) => n.mood as Mood);
      if (moodList.length) {
        const mood = dominant(moodList);
        points.push({
          x,
          valence: average(moodList),
          mood,
          label:
            i === 0
              ? 'Esta semana'
              : `Semana del ${start.getDate()} de ${start.toLocaleDateString('es', { month: 'long' })}`,
          detail: `${list.length} ${list.length === 1 ? 'nota' : 'notas'} · sobre todo ${MOOD_NAMES[mood]}`,
          notes: list.length,
        });
      }
    }
    return { points, axis };
  }

  const days = 7;
  const byDay = new Map<string, Note[]>();
  notes.forEach((n) => {
    if (!n.mood) return;
    const k = key(new Date(n.createdAt));
    byDay.set(k, [...(byDay.get(k) ?? []), n]);
  });
  const points: CurvePoint[] = [];
  const axis: CurveAxisLabel[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const x = (days - 1 - i) / (days - 1);
    const list = byDay.get(key(date)) ?? [];
    const moodList = list.map((n) => n.mood as Mood);
    const mood = moodList.length ? dominant(moodList) : null;
    axis.push({
      x,
      label: capitalize(date.toLocaleDateString('es', { weekday: 'short' }).replace('.', '')).slice(
        0,
        3
      ),
      sub: mood ? MOOD_NAMES[mood] : '—',
    });
    if (mood) {
      points.push({
        x,
        valence: average(moodList),
        mood,
        label: capitalize(
          date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
        ),
        detail: `${list.length} ${list.length === 1 ? 'nota' : 'notas'} · ${[...new Set(moodList)].map((m) => MOOD_NAMES[m]).join(', ')}`,
        notes: list.length,
      });
    }
  }
  return { points, axis };
}

const MOOD_NAMES: Record<Mood, string> = {
  paz: 'Paz',
  alegria: 'Alegría',
  gratitud: 'Gratitud',
  reflexion: 'Reflexión',
  cansancio: 'Cansancio',
  ansiedad: 'Ansiedad',
  tristeza: 'Tristeza',
};

export type Pattern = {
  id: string;
  title: string;
  // Una línea corta bajo el título: cuántas notas lo sostienen.
  subtitle: string;
  detail: string;
  count: number;
  mood: Mood | null;
};

// Patrones que salen de juntar etiquetas y ánimos. Solo se muestran si hay al menos 2 notas que los sostienen.
export function patterns(notes: Note[]): Pattern[] {
  const byTag = new Map<string, Note[]>();
  notes.forEach((n) => n.tags.forEach((t) => byTag.set(t, [...(byTag.get(t) ?? []), n])));
  const list: Pattern[] = [];
  byTag.forEach((tagNotes, tag) => {
    if (tagNotes.length < 2) return;
    const moodList = tagNotes.map((n) => n.mood).filter((m): m is Mood => !!m);
    if (!moodList.length) return;
    const mood = dominant(moodList);
    const withMood = moodList.filter((m) => m === mood).length;
    list.push({
      id: `tag-${tag}`,
      title: `#${tag} y ${MOOD_NAMES[mood].toLowerCase()}`,
      subtitle: `${tagNotes.length} notas · sobre todo ${MOOD_NAMES[mood]}`,
      detail: `Escribiste sobre #${tag} en ${tagNotes.length} notas; en ${withMood} de ellas elegiste ${MOOD_NAMES[mood]}.`,
      count: tagNotes.length,
      mood,
    });
  });
  const moment = favoriteMoment(notes);
  if (moment) {
    list.push({
      id: 'moment',
      title: `Escribes ${moment}`,
      subtitle: 'Tu momento del día',
      detail: `La mayoría de tus notas las escribiste ${moment}.`,
      count: notes.length,
      mood: null,
    });
  }
  return list.sort((a, b) => b.count - a.count).slice(0, 4);
}
