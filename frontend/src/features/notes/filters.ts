import type { Note } from '../journal/types';
import type { Mood } from '../journal/moods';

// Filtros de Notas: se combinan entre sí y con la búsqueda.
export type NoteFilter = {
  // Solo tus notas favoritas.
  favorites: boolean;
  mood: Mood | null;
  tag: string | null;
};

export const NO_FILTER: NoteFilter = { favorites: false, mood: null, tag: null };

// Solo se ofrecen ánimos y temas que existen en tus notas: nada de categorías vacías.
export function filterValues(notes: Note[]) {
  const moods = new Set<Mood>();
  const tags = new Set<string>();
  for (const n of notes) {
    if (n.mood) moods.add(n.mood);
    n.tags.forEach((t) => tags.add(t));
  }
  return { moods: [...moods], tags: [...tags].sort() };
}

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function applyFilters(
  notes: Note[],
  filter: NoteFilter,
  query: string,
  favoriteIds: string[]
) {
  const q = normalize(query.trim());
  return notes.filter((n) => {
    if (filter.favorites && !favoriteIds.includes(n.id)) return false;
    if (filter.mood && n.mood !== filter.mood) return false;
    if (filter.tag && !n.tags.includes(filter.tag)) return false;
    if (!q) return true;
    const reply = n.reply ? `${n.reply.headline} ${n.reply.body} ${n.reply.learning}` : '';
    return normalize(`${n.text} ${reply} ${n.tags.join(' ')}`).includes(q);
  });
}
