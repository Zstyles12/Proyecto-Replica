import { dayKey, dayNotes, dayNotesOf, noteDay, replyModeOf } from './store';
import type { DayReply, Note } from './types';
import { getProfile } from '../profile/store';
import { replyService } from '../../services/ai';
import { readString, writeString } from '../../lib/storage';
import { useSyncExternalStore } from 'react';

// La réplica del día, una por día: llega a la hora elegida (20:00 o 22:00) y lee todo lo que se
// escribió ese día, salvo las notas privadas. Con Supabase la generará el servidor a esa hora.
const KEY = 'replica.dayReplies';

function load(): Record<string, DayReply> {
  const raw = readString(KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, DayReply>;
    // Una réplica que quedó a medias al cerrar la app se vuelve a pedir.
    for (const k of Object.keys(parsed)) {
      if (parsed[k].replyStatus === 'streaming') delete parsed[k];
    }
    return parsed;
  } catch {
    return {};
  }
}

let replies: Record<string, DayReply> = load();
const listeners = new Set<() => void>();
let cancel: (() => void) | null = null;
// Las notas con que se pidió la última puesta al día: al terminar una réplica se sigue con la próxima.
let catchUpList: Note[] | null = null;

function persist() {
  const saved: Record<string, DayReply> = {};
  for (const [k, v] of Object.entries(replies)) {
    const { replyDraft: _draft, ...rest } = v;
    saved[k] = rest;
  }
  writeString(KEY, JSON.stringify(saved));
}

function set(day: string, change: (current: DayReply) => DayReply, save: boolean) {
  const current = replies[day];
  if (!current) return;
  replies = { ...replies, [day]: change(current) };
  if (save) persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Hace falta al menos una nota además de la primera: con una sola, ya tuvo su réplica.
export const DAY_REPLY_MIN_NOTES = 2;

// ¿Ya es hora de la réplica de hoy? Hay notas suficientes y pasó la hora elegida.
export function dayReplyDue(list: Note[], now = new Date()) {
  return (
    dayNotes(list).length >= DAY_REPLY_MIN_NOTES && now.getHours() >= getProfile().dayReplyHour
  );
}

// La última réplica de un día se guarda junto a las demás, con su propia clave.
const lateKey = (day: string) => `${day}:ultima`;

// Las notas que se escribieron después de la réplica de la noche (las que ella no leyó). Las lee la
// última réplica, a medianoche. Sin réplica de la noche todavía, no hay notas tardías.
export function lateNotesOf(list: Note[], day: string) {
  const night = replies[day];
  if (night?.replyStatus !== 'done') return [];
  return dayNotesOf(list, day).filter((n) => !night.noteIds.includes(n.id));
}

// Los días que ya deberían tener su réplica: los anteriores a hoy con alguna nota que la espera
// (escrita después de la primera del día) y hoy, si ya pasó la hora. Del más reciente al más antiguo.
function dueDays(list: Note[]) {
  const today = dayKey(new Date());
  const days = new Map<string, string>();
  for (const n of list) {
    if (replyModeOf(n) !== 'day') continue;
    const day = noteDay(n);
    if (day === today && !dayReplyDue(list)) continue;
    if (!days.has(day) || n.createdAt > days.get(day)!) days.set(day, n.createdAt);
  }
  return [...days.entries()].sort((a, b) => b[1].localeCompare(a[1])).map(([day]) => day);
}

type Kind = 'day' | 'late';

export const dayReplies = {
  // Pide las réplicas que falten, una a la vez: la del día de hoy (pasada la hora), las de días en
  // que no se abrió la app a esa hora (para que ninguna nota se quede esperando para siempre) y las
  // últimas réplicas de días ya terminados. Con Supabase las generará el servidor a su hora.
  catchUp(list: Note[]) {
    catchUpList = list;
    if (cancel) return;
    const days = dueDays(list);
    const day = days.find((d) => !replies[d]);
    if (day) {
      dayReplies.request(list, day);
      return;
    }
    // La última réplica llega a medianoche: solo para días que ya terminaron.
    const today = dayKey(new Date());
    const late = days.find(
      (d) => d !== today && !replies[lateKey(d)] && lateNotesOf(list, d).length > 0
    );
    if (late) dayReplies.request(list, late, 'late');
  },

  // Pide la réplica de un día (hoy por defecto) si todavía no existe. 'late': la última réplica, que
  // lee solo lo escrito después de la de la noche.
  request(list: Note[], day = dayKey(new Date()), kind: Kind = 'day') {
    const key = kind === 'late' ? lateKey(day) : day;
    if (replies[key] || cancel) return;
    const notes =
      kind === 'late'
        ? lateNotesOf(list, day)
        : day === dayKey(new Date())
          ? dayNotes(list)
          : dayNotesOf(list, day);
    if (notes.length < (kind === 'late' ? 1 : DAY_REPLY_MIN_NOTES)) return;
    replies = {
      ...replies,
      [key]: {
        day,
        kind,
        noteIds: notes.map((n) => n.id),
        reply: null,
        replyDraft: { headline: '', body: '' },
        replyStatus: 'streaming',
      },
    };
    listeners.forEach((l) => l());
    const profile = getProfile();
    const next = () => {
      if (catchUpList) dayReplies.catchUp(catchUpList);
    };
    cancel = replyService.streamReply(
      {
        noteId: `dia-${key}`,
        kind,
        count: notes.length,
        text: notes.map((n) => n.text).join('\n\n'),
        notes: notes.map((n) => ({ id: n.id, text: n.text })),
        tone: profile.replyTone,
        name: profile.name,
      },
      {
        onHeadline: (headline) =>
          set(
            key,
            (r) => ({ ...r, replyDraft: { headline, body: r.replyDraft?.body ?? '' } }),
            false
          ),
        onWord: (word) =>
          set(
            key,
            (r) => {
              const body = r.replyDraft?.body;
              return {
                ...r,
                replyDraft: {
                  headline: r.replyDraft?.headline ?? '',
                  body: body ? `${body} ${word}` : word,
                },
              };
            },
            false
          ),
        onDone: (reply) => {
          cancel = null;
          set(key, (r) => ({ ...r, reply, replyDraft: undefined, replyStatus: 'done' }), true);
          next();
        },
        onError: () => {
          cancel = null;
          set(key, (r) => ({ ...r, replyDraft: undefined, replyStatus: 'error' }), true);
          next();
        },
      }
    );
  },

  // Volver a intentarlo después de un error.
  retry(list: Note[], day = dayKey(new Date()), kind: Kind = 'day') {
    const key = kind === 'late' ? lateKey(day) : day;
    if (replies[key]?.replyStatus !== 'error') return;
    const { [key]: _failed, ...rest } = replies;
    replies = rest;
    dayReplies.request(list, day, kind);
  },

  // Al eliminar la cuenta.
  clear() {
    cancel?.();
    cancel = null;
    catchUpList = null;
    replies = {};
    persist();
    listeners.forEach((l) => l());
  },
};

export function useDayReply(day: string) {
  return useSyncExternalStore(subscribe, () => replies[day] ?? null);
}

// La última réplica de un día (la de medianoche), si la hubo.
export function useLateReply(day: string) {
  return useSyncExternalStore(subscribe, () => replies[lateKey(day)] ?? null);
}

// Todas las réplicas del día guardadas, por clave (para la lista de Notas).
export function useAllDayReplies() {
  return useSyncExternalStore(subscribe, () => replies);
}

// La réplica de la noche y la última (si la hubo) de un día, dentro de todas las guardadas.
export function repliesOfDay(all: Record<string, DayReply>, day: string) {
  return { night: all[day] ?? null, late: all[lateKey(day)] ?? null };
}
