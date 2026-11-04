import { seedNotes } from './seed';
import type { Learning, NewNote, Note, ReplyMode } from './types';
import { getProfile } from '../profile/store';
import { replyService } from '../../services/ai';
import { dataService } from '../../services/data';
import { readString, writeString } from '../../lib/storage';
import { offline } from '../../lib/offline';
import { dayKey } from '../../lib/format';
import { useSyncExternalStore } from 'react';

// El diario. Con Supabase es una caché en memoria de lo que hay en el servidor, y las notas se envían
// al guardarlas. Sin él, datos simulados que viven en el navegador.
// v2: la réplica pasó de texto plano a { titular, análisis, preguntas }. v3: réplicas de ejemplo más variadas.
// v4: la réplica trae su aprendizaje destilado.
const KEY = 'replica.notes.v4';

function load(): Note[] {
  if (dataService) return [];
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
// La nota que se está enviando: pedir su réplica espera a que exista en el servidor.
const saves = new Map<string, Promise<void>>();
// La bandeja: las notas que no se pudieron enviar, por cuenta, en IndexedDB (lib/offline). Una nota no
// puede terminar en la cuenta de quien entre después.
let userId: string | null = null;
let waiting: Note[] = [];
let copyTimer: ReturnType<typeof setTimeout> | null = null;

function persist() {
  if (dataService) {
    saveCopy();
    return;
  }
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
  return dataService
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// Lo escrito también queda en la copia sin conexión, sin guardarla con cada palabra de una réplica.
function saveCopy() {
  if (!userId) return;
  const id = userId;
  if (copyTimer) clearTimeout(copyTimer);
  copyTimer = setTimeout(() => void offline.saveNotes(id, notes), 800);
}

function outbox() {
  return waiting;
}

function setOutbox(list: Note[]) {
  waiting = list;
  if (userId) void offline.writeOutbox(userId, list);
}

// Envía la nota una sola vez, por más que se pida su réplica. El servidor confirma cuándo se escribió
// y cómo se responde. Si no llega, queda en la bandeja y se reintenta al volver la conexión; desde la
// bandeja lleva la hora en que se escribió.
function send(note: Note) {
  const current = saves.get(note.id);
  if (current) return current;
  const late = outbox().some((n) => n.id === note.id);
  const saving = dataService!
    .createNote(note, note.replyMode === 'private', late ? note.createdAt : undefined)
    .then((saved) => {
      setOutbox(outbox().filter((n) => n.id !== note.id));
      patch(note.id, (n) => ({ ...n, ...saved }), true);
    })
    .catch((error: Error) => {
      saves.delete(note.id);
      if (!outbox().some((n) => n.id === note.id)) {
        setOutbox([...outbox(), note]);
        emit();
      }
      throw error;
    });
  saves.set(note.id, saving);
  return saving;
}

function flushOutbox() {
  outbox().forEach((note) => send(note).catch(() => {}));
}

if (dataService) window.addEventListener('online', flushOutbox);

export const journal = {
  // Al eliminar la cuenta: sin notas y sin réplicas en curso. Al cerrar sesión con Supabase también se
  // vacía la caché, para que la próxima cuenta no vea nada de esta.
  clear() {
    streams.forEach((cancel) => cancel());
    streams.clear();
    saves.clear();
    if (copyTimer) clearTimeout(copyTimer);
    userId = null;
    waiting = [];
    notes = [];
    persist();
    emit();
  },

  // Al entrar: lo que hay en el servidor (o su copia, sin conexión), más lo que aún no se pudo enviar
  // desde este navegador.
  hydrate(id: string, list: Note[], pending: Note[]) {
    userId = id;
    const sent = new Set(list.map((n) => n.id));
    setOutbox(pending.filter((n) => !sent.has(n.id)));
    notes = [...outbox(), ...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    emit();
    flushOutbox();
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
    if (dataService) send(note).catch(() => {});
    return note;
  },

  // Borrar una nota (DESIGN-WEB.md §11): primero en el servidor, y solo si se pudo, aquí. Una que todavía
  // esperaba en la bandeja nunca llegó: basta con sacarla. Dice si se borró.
  async remove(id: string): Promise<boolean> {
    const pending = outbox().some((n) => n.id === id);
    if (dataService && !pending) {
      await saves.get(id)?.catch(() => {});
      try {
        await dataService.deleteNote(id);
      } catch {
        return false;
      }
    }
    streams.get(id)?.();
    streams.delete(id);
    saves.delete(id);
    if (pending) setOutbox(outbox().filter((n) => n.id !== id));
    notes = notes.filter((n) => n.id !== id);
    persist();
    emit();
    return true;
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
    if (!dataService) {
      streams.set(id, startReply(note));
      return;
    }
    let stop: (() => void) | null = null;
    let cancelled = false;
    streams.set(id, () => {
      cancelled = true;
      stop?.();
    });
    send(note)
      .then(() => {
        if (cancelled) return;
        // Otro dispositivo escribió primero: esta nota la lee la réplica del día.
        if (notes.find((n) => n.id === id)?.replyMode !== 'instant') {
          streams.delete(id);
          patch(id, (n) => ({ ...n, replyDraft: undefined, replyStatus: 'none' }), false);
          return;
        }
        stop = startReply(note);
      })
      .catch(() => {
        streams.delete(id);
        patch(id, (n) => ({ ...n, replyDraft: undefined, replyStatus: 'error' }), false);
      });
  },
};

function startReply(note: Note) {
  const { id } = note;
  return replyService.streamReply(
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
}

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

// Una lectura puntual, fuera de React (el recordatorio simulado).
export function getNotes() {
  return notes;
}

// Si la nota sigue en la bandeja, esperando la conexión.
export function useWaiting(id: string) {
  return useSyncExternalStore(subscribe, () => waiting.some((n) => n.id === id));
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

// Cómo se responderá una nota nueva, según lo que ya se escribió hoy. La cuenta de demostración (el
// administrador) recibe réplica en cada nota; el servidor decide lo mismo (DESIGN.md, reglas de producto).
export function nextReplyMode(list: Note[], isPrivate: boolean, demo = false): ReplyMode {
  if (isPrivate) return 'private';
  if (demo) return 'instant';
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
