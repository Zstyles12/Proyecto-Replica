import { readString, writeString } from '../../lib/storage';
import { useSyncExternalStore } from 'react';

// Notas favoritas: las notas que quieres tener a mano. Es distinto de guardar una frase en el cofre.
const KEY = 'replica.noteFavorites';

function load(): string[] {
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

export const noteFavorites = {
  clear() {
    ids = [];
    writeString(KEY, JSON.stringify(ids));
    listeners.forEach((l) => l());
  },
  toggle(noteId: string) {
    ids = ids.includes(noteId) ? ids.filter((id) => id !== noteId) : [noteId, ...ids];
    writeString(KEY, JSON.stringify(ids));
    listeners.forEach((l) => l());
  },
};

export function useFavoriteNoteIds() {
  return useSyncExternalStore(subscribe, () => ids);
}

export function useIsFavoriteNote(noteId: string) {
  return useSyncExternalStore(subscribe, () => ids.includes(noteId));
}
