import { dataService } from '../../services/data';
import { readString, writeString } from '../../lib/storage';
import { useSyncExternalStore } from 'react';

// Notas favoritas: las notas que quieres tener a mano. Es distinto de guardar una frase en el cofre.
const KEY = 'replica.noteFavorites';

function load(): string[] {
  if (dataService) return [];
  const raw = readString(KEY);
  if (!raw) return ['seed-1', 'seed-3', 'seed-9'];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

let ids: string[] = load();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function apply(next: string[]) {
  ids = next;
  if (!dataService) writeString(KEY, JSON.stringify(ids));
  listeners.forEach((l) => l());
}

export const noteFavorites = {
  clear() {
    apply([]);
  },
  hydrate(list: string[]) {
    apply(list);
  },
  // Una nota borrada deja de ser favorita. En el servidor se fue con la nota.
  forget(noteId: string) {
    if (ids.includes(noteId)) apply(ids.filter((id) => id !== noteId));
  },
  toggle(noteId: string) {
    const previous = ids;
    const adding = !ids.includes(noteId);
    apply(adding ? [noteId, ...ids] : ids.filter((id) => id !== noteId));
    dataService?.setNoteFavorite(noteId, adding).catch(() => apply(previous));
  },
};

export function useFavoriteNoteIds() {
  return useSyncExternalStore(subscribe, () => ids);
}

export function useIsFavoriteNote(noteId: string) {
  return useSyncExternalStore(subscribe, () => ids.includes(noteId));
}
