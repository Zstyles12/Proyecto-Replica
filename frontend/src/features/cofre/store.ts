import { findLibraryPhrase, type LibraryPhrase } from './library';
import { useLearnings } from '../journal/store';
import type { Learning } from '../journal/types';
import { dataService } from '../../services/data';
import { readString, writeString } from '../../lib/storage';
import * as React from 'react';
import { useSyncExternalStore } from 'react';

// Una frase del cofre, venga de donde venga: destilada de una réplica o del día (aliento o cita).
export type Phrase = {
  // "nota:<id>" para las de una réplica; "dia:<id>" para las de la biblioteca.
  key: string;
  text: string;
  kind: 'replica' | 'aliento' | 'cita';
  author?: string;
  noteId?: string;
  // Título de la nota de la que salió.
  source?: string;
  // Fecha de la nota (solo en las de réplica).
  date?: string;
};

export const noteKey = (noteId: string) => `nota:${noteId}`;
export const dayKey = (id: string) => `dia:${id}`;

export function phraseFromLearning(l: Learning): Phrase {
  return {
    key: noteKey(l.noteId),
    text: l.text,
    kind: 'replica',
    noteId: l.noteId,
    source: l.source,
    date: l.createdAt,
  };
}

export function phraseFromLibrary(p: LibraryPhrase): Phrase {
  return { key: dayKey(p.id), text: p.text, kind: p.author ? 'cita' : 'aliento', author: p.author };
}

// Favoritos: las frases que la persona guardó con el corazón, con la fecha en que las guardó.
type Saved = { key: string; savedAt: string };

const KEY = 'replica.favorites.v2';
const LEGACY_KEY = 'replica.favorites';

function seed(): Saved[] {
  const now = Date.now();
  return ['nota:seed-1', 'nota:seed-6', 'dia:a07'].map((key, i) => ({
    key,
    savedAt: new Date(now - i * 86_400_000).toISOString(),
  }));
}

function load(): Saved[] {
  if (dataService) return [];
  const raw = readString(KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as Saved[];
    } catch {
      return seed();
    }
  }
  // Antes solo se guardaban ids de notas.
  const legacy = readString(LEGACY_KEY);
  if (legacy) {
    try {
      const ids = JSON.parse(legacy) as string[];
      const now = new Date().toISOString();
      return ids.map((id) => ({ key: noteKey(id), savedAt: now }));
    } catch {
      return seed();
    }
  }
  return seed();
}

let saved: Saved[] = load();
let keys: string[] = saved.map((s) => s.key);
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function apply(next: Saved[]) {
  saved = next;
  keys = saved.map((s) => s.key);
  if (!dataService) writeString(KEY, JSON.stringify(saved));
  listeners.forEach((l) => l());
}

export const favorites = {
  clear() {
    apply([]);
  },
  hydrate(list: Saved[]) {
    apply(list);
  },
  // La réplica de una nota borrada sale del cofre. En el servidor se fue con la nota.
  forget(key: string) {
    if (keys.includes(key)) apply(saved.filter((s) => s.key !== key));
  },
  toggle(key: string) {
    const previous = saved;
    const adding = !keys.includes(key);
    const savedAt = new Date().toISOString();
    apply(adding ? [{ key, savedAt }, ...saved] : saved.filter((s) => s.key !== key));
    // Si no llega al servidor, la frase vuelve a como estaba: el corazón no promete lo que no pasó.
    dataService?.setPhraseSaved(key, adding, savedAt).catch(() => apply(previous));
  },
};

export function useFavoriteKeys() {
  return useSyncExternalStore(subscribe, () => keys);
}

export function useIsFavorite(key: string) {
  return useSyncExternalStore(subscribe, () => keys.includes(key));
}

// Todas las frases de tus réplicas, de la más reciente a la más antigua.
export function useReplyPhrases() {
  const learnings = useLearnings();
  return React.useMemo(() => learnings.map(phraseFromLearning), [learnings]);
}

// Tus favoritas, la última que guardaste primero. Si la nota de una se borró, esa frase se omite.
export function useFavoritePhrases() {
  const favoriteKeys = useFavoriteKeys();
  const replies = useReplyPhrases();
  return React.useMemo(
    () =>
      favoriteKeys.flatMap((key): Phrase[] => {
        if (key.startsWith('dia:')) {
          const p = findLibraryPhrase(key.slice(4));
          return p ? [phraseFromLibrary(p)] : [];
        }
        const reply = replies.find((r) => r.key === key);
        return reply ? [reply] : [];
      }),
    [favoriteKeys, replies]
  );
}

// Una frase por su clave (para la hoja de compartir).
export function usePhrase(key: string | undefined): Phrase | null {
  const replies = useReplyPhrases();
  return React.useMemo(() => {
    if (!key) return null;
    if (key.startsWith('dia:')) {
      const p = findLibraryPhrase(key.slice(4));
      return p ? phraseFromLibrary(p) : null;
    }
    return replies.find((r) => r.key === key) ?? null;
  }, [key, replies]);
}
