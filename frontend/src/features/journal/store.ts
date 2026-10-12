import { seedNotes } from './seed';
import type { Learning, NewNote, Note, ReplyMode } from './types';
import { getProfile } from '../profile/store';
import { replyService } from '../../services/ai';
import { readString, writeString } from '../../lib/storage';
import { dayKey } from '../../lib/format';
import { useSyncExternalStore } from 'react';

// Almacén local del diario (datos simulados hasta que exista Supabase).
// v2: la réplica pasó de texto plano a { titular, análisis, preguntas }. v3: réplicas de ejemplo más variadas.
// v4: la réplica trae su aprendizaje destilado.
const KEY = 'replica.notes.v4';

function load(): Note[] {
  const raw = readString(KEY);
  if (!raw) return seedNotes();
  try {
    const parsed = JSON.parse(raw) as Note[];
    // Una réplica que quedó a medias al cerrar la app se puede volver a pedir.
    return parsed.map((n) =>
      n.replyStatus === 'streaming' ? { ...n, replyStatus: 'none', reply: null } : n
    );
  } catch {
    return seedNotes();
  }
}

let notes: Note[] = load();
const listeners = new Set<() => void>();
const streams = new Map<string, () => void>();

function persist() {
  // El borrador de la réplica en curso no se guarda.
  writeString(KEY, JSON.stringify(notes.map(({ replyDraft: _draft, ...n }) => n)));
}

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function patch(id: string, change: (note: Note) => Note, save: boolean) {
  notes = notes.map((n) => (n.id === id ? change(n) : n));
  if (save) persist();
  emit();
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const journal = {
  // Al eliminar la cuenta: sin notas y sin réplicas en curso.
  clear() {
    streams.forEach((cancel) => cancel());
    streams.clear();
    notes = [];
    persist();
    emit();
  },

  add(input: NewNote): Note {
    const note: Note = {
      ...input,
      id: newId(),
      createdAt: new Date().toISOString(),
      reply: null,
      replyStatus: 'none',
    };
    notes = [note, ...notes];
    persist();
    emit();
    return note;
  },

  // El titular llega primero y el análisis palabra por palabra; solo se guarda en disco al terminar.
  requestReply(id: string) {
    const note = notes.find((n) => n.id === id);
    if (!note || streams.has(id)) return;
    patch(
      id,
      (n) => ({
        ...n,
        reply: null,
        replyDraft: { headline: '', body: '' },
        replyStatus: 'streaming',
      }),
      false
    );
    const cancel = replyService.streamReply(
      {
        noteId: id,
        text: note.text,
        mood: note.mood,
        tone: getProfile().replyTone,
        name: getProfile().name,
      },
      {
        onHeadline: (headline) =>
          patch(
            id,
            (n) => ({ ...n, replyDraft: { headline, body: n.replyDraft?.body ?? '' } }),
            false
          ),
        onWord: (word) =>
          patch(
            id,
            (n) => {
              const body = n.replyDraft?.body;
              return {
                ...n,
                replyDraft: {
                  headline: n.replyDraft?.headline ?? '',
                  body: body ? `${body} ${word}` : word,
                },
              };
            },
            false
          ),
        onDone: (reply) => {
          streams.delete(id);
          patch(id, (n) => ({ ...n, reply, replyDraft: undefined, replyStatus: 'done' }), true);
        },
        onError: () => {
          streams.delete(id);
          patch(id, (n) => ({ ...n, replyDraft: undefined, replyStatus: 'error' }), true);
        },
      }
    );
    streams.set(id, cancel);
  },
};

// El cofre se deriva de las notas: cada réplica terminada deja un aprendizaje. La lista solo cambia de
// referencia cuando cambian los aprendizajes (no con cada palabra de una réplica que está llegando).
let learningsCache: { source: Note[] | null; value: Learning[] } = { source: null, value: [] };

function getLearnings() {
  if (learningsCache.source === notes) return learningsCache.value;
  const next: Learning[] = notes.flatMap((n) =>
    n.reply?.learning
      ? [
          {
            noteId: n.id,
            text: n.reply.learning,
            createdAt: n.createdAt,
            source: noteTitle(n.text, 40),
          },
        ]
      : []
  );
  const prev = learningsCache.value;
  const same =
    prev.length === next.length &&
    prev.every((l, i) => l.noteId === next[i].noteId && l.text === next[i].text);
  learningsCache = { source: notes, value: same ? prev : next };
  return learningsCache.value;
}

export function useNotes() {
  return useSyncExternalStore(subscribe, () => notes);
}

export function useNote(id: string | null) {
  return useSyncExternalStore(subscribe, () =>
    id ? (notes.find((n) => n.id === id) ?? null) : null
  );
}

export function useLearnings() {
  return useSyncExternalStore(subscribe, getLearnings);
}

// La clave del día sale de lib/format.ts (hora local), igual en toda la web.
export { dayKey };

// Replica no es un chat: se escribe cuanto se quiera, pero responde dos veces al día. La primera nota
// (que no sea privada) recibe su réplica al momento; las demás se leen juntas en la réplica del día.
export function replyModeOf(note: Note): ReplyMode {
  return note.replyMode ?? 'instant';
}

// Cómo se responderá una nota nueva, según lo que ya se escribió hoy.
export function nextReplyMode(list: Note[], isPrivate: boolean): ReplyMode {
  if (isPrivate) return 'private';
  return notesToday(list).some((n) => replyModeOf(n) !== 'private') ? 'day' : 'instant';
}

// Las notas de hoy que lee la réplica del día (todas menos las privadas), en orden de escritura.
export function dayNotes(list: Note[]) {
  return dayNotesOf(list, dayKey(new Date()));
}

// Lo mismo para cualquier día (clave de dayKey).
export function dayNotesOf(list: Note[], day: string) {
  return list
    .filter((n) => dayKey(new Date(n.createdAt)) === day && replyModeOf(n) !== 'private')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

// El día (clave) en que se escribió una nota.
export function noteDay(note: Note) {
  return dayKey(new Date(note.createdAt));
}

export function notesToday(list: Note[]) {
  return list.filter((n) => isToday(n.createdAt));
}

export function isToday(iso: string) {
  return dayKey(new Date(iso)) === dayKey(new Date());
}

// Días seguidos con al menos una nota, contando hasta hoy (o hasta ayer si hoy aún no escribes).
export function streakDays(list: Note[]) {
  const days = new Set(list.map((n) => dayKey(new Date(n.createdAt))));
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

// Un título para la nota: su primera frase, recortada.
export function noteTitle(text: string, max = 48) {
  const first = text.split(/[.!?\n]/)[0]?.trim() || text.trim();
  return first.length > max ? `${first.slice(0, max).replace(/\s+\S*$/, '')}…` : first;
}

// Lo que sigue después de la primera frase, para el extracto bajo el título.
export function noteRest(text: string) {
  const match = text.match(/[.!?\n]/);
  return match?.index !== undefined
    ? text
        .slice(match.index + 1)
        .replace(/^[.!?\s]+/, '')
        .trim()
    : '';
}
