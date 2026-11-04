import { findPsychologist, SIMULATED_REPLIES } from './data';
import type { Appointment, CareRequest, Conversation, DiaryShare, Message, MessageEvent } from './types';
import type { Note } from '../journal/types';
import { dataService, type CareData } from '../../services/data';
import { readString, writeString } from '../../lib/storage';
import { useSyncExternalStore } from 'react';

// Chat con psicólogos, sesiones y permisos del diario. Con Supabase es una caché de lo que hay en el
// servidor, y los mensajes llegan en tiempo real (RF-43). Sin él, datos simulados.
// v2: las sesiones las agenda el psicólogo y hay un solo psicólogo activo. Desde la Fase 16, el
// acompañamiento empieza con una solicitud y solo aceptarla abre la conversación.
const KEY = 'replica.care.v2';

type State = {
  conversations: Conversation[];
  messages: Message[];
  appointments: Appointment[];
  shares: DiaryShare[];
  requests: CareRequest[];
  typing: Record<string, boolean>;
};

function id() {
  return dataService
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

function inDaysAt(days: number, hour: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function seed(): State {
  const conversationId = 'conv-seed';
  return {
    conversations: [
      {
        id: conversationId,
        psychologistId: 'psi-valeria',
        createdAt: hoursAgo(50),
        lastReadAt: hoursAgo(47),
      },
    ],
    messages: [
      {
        id: 'm0',
        conversationId,
        from: 'system',
        kind: 'event',
        event: 'accepted',
        text: 'Valeria aceptó acompañarte.',
        createdAt: hoursAgo(50),
      },
      {
        id: 'm1',
        conversationId,
        from: 'user',
        kind: 'text',
        text: 'Hola, Valeria. Llevo unas semanas con mucha ansiedad por el trabajo y me gustaría empezar terapia.',
        createdAt: hoursAgo(49),
      },
      {
        id: 'm2',
        conversationId,
        from: 'psychologist',
        kind: 'text',
        text: 'Hola, gracias por escribirme. Podemos empezar con una primera sesión por Meet para conocernos. ¿Te parece?',
        createdAt: hoursAgo(48),
      },
      {
        id: 'm3',
        conversationId,
        from: 'user',
        kind: 'text',
        text: 'Sí, me parece bien. Las mañanas me quedan mejor.',
        createdAt: hoursAgo(30),
      },
      {
        id: 'm4',
        conversationId,
        from: 'psychologist',
        kind: 'text',
        text: 'Perfecto. Te agendé la primera sesión; si ese horario no te funciona, escríbeme y lo cambio.',
        createdAt: hoursAgo(20),
      },
      {
        id: 'm5',
        conversationId,
        from: 'system',
        kind: 'session',
        text: '',
        appointmentId: 'apt-seed',
        createdAt: hoursAgo(20),
      },
    ],
    appointments: [
      {
        id: 'apt-seed',
        conversationId,
        psychologistId: 'psi-valeria',
        startsAt: inDaysAt(2, 10),
        meetLink: 'https://meet.google.com/abc-defg-hij',
        minutes: 50,
      },
    ],
    shares: [],
    requests: [
      {
        id: 'req-seed',
        psychologistId: 'psi-valeria',
        message: '',
        status: 'accepted',
        createdAt: hoursAgo(52),
        respondedAt: hoursAgo(50),
      },
    ],
    typing: {},
  };
}

const EMPTY: State = { conversations: [], messages: [], appointments: [], shares: [], requests: [], typing: {} };

function load(): State {
  if (dataService) return EMPTY;
  const raw = readString(KEY);
  if (!raw) return seed();
  try {
    // Lo guardado antes de las solicitudes no las trae, y las sesiones no traían su duración.
    const saved = JSON.parse(raw) as Omit<State, 'typing'>;
    return {
      ...saved,
      requests: saved.requests ?? [],
      appointments: saved.appointments.map((a) => ({ ...a, minutes: a.minutes ?? 50 })),
      typing: {},
    };
  } catch {
    return seed();
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function update(patch: Partial<State>, save = true) {
  state = { ...state, ...patch };
  if (save && !dataService) {
    const { typing: _typing, ...persisted } = state;
    writeString(KEY, JSON.stringify(persisted));
  }
  listeners.forEach((l) => l());
}

function addMessage(message: Omit<Message, 'id' | 'createdAt'>) {
  const full: Message = { ...message, id: id(), createdAt: new Date().toISOString() };
  update({ messages: [...state.messages, full] });
  return full;
}

// Sin servidor, los avisos los escribe la simulación con el mismo texto que el servidor.
function addEvent(conversationId: string, event: MessageEvent, text: string) {
  addMessage({ conversationId, from: 'system', kind: 'event', event, text });
}

function firstNameOf(psychologistId: string) {
  return findPsychologist(psychologistId)?.name.split(' ')[0] ?? 'tu psicólogo';
}

// Reemplaza o agrega por id. Lo que llega en tiempo real puede ser eco de lo que se acaba de enviar.
function upsert<T extends { id: string }>(list: T[], item: T) {
  return list.some((x) => x.id === item.id)
    ? list.map((x) => (x.id === item.id ? { ...x, ...item } : x))
    : [...list, item];
}

let replyTurn = 0;
// Los mensajes que todavía van camino al servidor: una vuelta completa no los borra.
const sendingIds = new Set<string>();
// Una sola vuelta al servidor a la vez: si llegan varios avisos juntos, se trae una vez más al final.
let resyncing: Promise<void> | null = null;
let resyncAgain = false;

export const care = {
  clear() {
    update(EMPTY);
  },

  hydrate(data: CareData) {
    update(data);
  },

  // Vuelve a traer todo el chat: cambió una conversación o una solicitud, o el tiempo real se volvió
  // a conectar y pudo perderse algo. Los mensajes que se están enviando no se pierden.
  async resync() {
    if (!dataService) return;
    if (resyncing) {
      resyncAgain = true;
      return resyncing;
    }
    resyncing = (async () => {
      do {
        resyncAgain = false;
        try {
          const data = await dataService.loadCare();
          const ids = new Set(data.messages.map((m) => m.id));
          const sending = state.messages.filter((m) => !ids.has(m.id) && m.from === 'user' && m.kind === 'text' && sendingIds.has(m.id));
          update({ ...data, messages: [...data.messages, ...sending] });
        } catch {
          // Sin conexión: se intenta de nuevo cuando el canal vuelva.
        }
      } while (resyncAgain);
    })().finally(() => {
      resyncing = null;
    });
    return resyncing;
  },

  // Lo que llega solo, en tiempo real. Solo lo de sus propias conversaciones: una cuenta de psicólogo
  // también recibe las de su consulta, y esas no son su diario. Una sesión llega sin psicólogo: lo
  // trae su conversación.
  receiveMessage(message: Message) {
    if (!state.conversations.some((c) => c.id === message.conversationId)) return;
    update({
      messages: upsert(state.messages, message).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    });
  },
  receiveAppointment(appointment: Appointment) {
    const conversation = state.conversations.find((c) => c.id === appointment.conversationId);
    if (!conversation) return;
    update({
      appointments: upsert(state.appointments, {
        ...appointment,
        psychologistId: conversation.psychologistId,
      }),
    });
  },

  // Pide acompañamiento. Solo hay un psicólogo a la vez, contando las solicitudes: con otro activo o
  // una pendiente, no se pide. Dice si se pudo.
  async request(psychologistId: string, message: string) {
    if (activeConversation(state) || pendingRequest(state)) return false;
    const request: CareRequest = {
      id: id(),
      psychologistId,
      message: message.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    update({ requests: [...state.requests, request] });
    if (!dataService) return true;
    try {
      const saved = await dataService.requestCare(request);
      update({ requests: upsert(state.requests, saved) });
      return true;
    } catch {
      update({ requests: state.requests.filter((r) => r.id !== request.id) });
      return false;
    }
  },

  async withdraw(requestId: string) {
    const previous = state.requests;
    update({
      requests: state.requests.map((r) =>
        r.id === requestId && r.status === 'pending'
          ? { ...r, status: 'withdrawn', respondedAt: new Date().toISOString() }
          : r
      ),
    });
    if (!dataService) return true;
    try {
      await dataService.withdrawCare(requestId);
      return true;
    } catch {
      update({ requests: previous });
      return false;
    }
  },

  // Solo sin servidor y en desarrollo: lo que haría el psicólogo desde su panel.
  simulateAnswer(accept: boolean) {
    const request = pendingRequest(state);
    if (!request || dataService) return;
    const now = new Date().toISOString();
    update({
      requests: state.requests.map((r) =>
        r.id === request.id ? { ...r, status: accept ? 'accepted' : 'declined', respondedAt: now } : r
      ),
    });
    if (!accept) return;
    const previous = state.conversations.find((c) => c.psychologistId === request.psychologistId);
    const conversation: Conversation = previous
      ? { ...previous, endedAt: undefined, endedBy: undefined }
      : { id: id(), psychologistId: request.psychologistId, createdAt: now, lastReadAt: now };
    update({ conversations: upsert(state.conversations, conversation) });
    addEvent(conversation.id, 'accepted', `${firstNameOf(request.psychologistId)} aceptó acompañarte.`);
  },

  markRead(conversationId: string) {
    const now = new Date().toISOString();
    update({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, lastReadAt: now } : c
      ),
    });
    dataService?.markRead(conversationId).catch(() => {});
  },

  // Envía el mensaje y dice si llegó: uno que no salió no se queda en el chat como enviado. Sin
  // servidor, simula que el psicólogo escribe y responde.
  async send(conversationId: string, text: string, entryId?: string) {
    const message = addMessage({ conversationId, from: 'user', kind: 'text', text, entryId });
    if (dataService) {
      sendingIds.add(message.id);
      try {
        await dataService.sendMessage(message);
        return true;
      } catch {
        update({ messages: state.messages.filter((m) => m.id !== message.id) });
        return false;
      } finally {
        sendingIds.delete(message.id);
      }
    }
    setTimeout(() => update({ typing: { ...state.typing, [conversationId]: true } }, false), 700);
    setTimeout(() => {
      update({ typing: { ...state.typing, [conversationId]: false } }, false);
      addMessage({
        conversationId,
        from: 'psychologist',
        kind: 'text',
        text: SIMULATED_REPLIES[replyTurn++ % SIMULATED_REPLIES.length],
      });
    }, 2400);
    return true;
  },

  // Comparte una nota suelta en el chat (RF-44), ya confirmada. Nunca una privada: tampoco la acepta el
  // servidor, que copia el texto de la nota misma.
  async shareNote(conversationId: string, note: Note) {
    if (note.replyMode === 'private') return false;
    return care.send(conversationId, note.text, note.id);
  },

  // Terminar el proceso con el psicólogo actual, para poder elegir a otro. El historial se conserva.
  end(conversationId: string) {
    const conversation = state.conversations.find((c) => c.id === conversationId);
    if (!conversation) return;
    const now = new Date().toISOString();
    update({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, endedAt: now, endedBy: 'user' } : c
      ),
      // Si el diario estaba compartido, deja de estarlo.
      shares: state.shares.map((sh) =>
        sh.psychologistId === conversation.psychologistId
          ? { ...sh, active: false, changedAt: now }
          : sh
      ),
    });
    if (dataService) {
      dataService.endConversation(conversationId).catch(() => void care.resync());
      return;
    }
    addEvent(conversationId, 'ended_user', `Terminaste tu proceso con ${firstNameOf(conversation.psychologistId)}.`);
  },

  setDiaryShare(psychologistId: string, active: boolean) {
    const changedAt = new Date().toISOString();
    const others = state.shares.filter((s) => s.psychologistId !== psychologistId);
    const previous = state.shares;
    update({ shares: [...others, { psychologistId, active, changedAt }] });
    // El aviso en el chat lo escribe el servidor.
    if (dataService) {
      dataService.setDiaryShare(psychologistId, active).catch(() => update({ shares: previous }));
      return;
    }
    const conversation = activeConversation(state);
    if (conversation?.psychologistId !== psychologistId) return;
    const name = firstNameOf(psychologistId);
    addEvent(
      conversation.id,
      active ? 'share_on' : 'share_off',
      active ? `Compartiste tu diario con ${name}.` : `Dejaste de compartir tu diario con ${name}.`
    );
  },
};

// Las notas que la persona ya compartió en el chat, con la última vez que lo hizo.
export function sharedNotes(s: State) {
  const shared = new Map<string, string>();
  for (const m of s.messages) if (m.entryId && m.from === 'user') shared.set(m.entryId, m.createdAt);
  return shared;
}

// Una lectura puntual, fuera de React (por ejemplo, al tocar la pestaña Chat).
export function careSnapshot() {
  return state;
}

export function useCare() {
  return useSyncExternalStore(subscribe, () => state);
}

export function lastMessage(s: State, conversationId: string) {
  const list = s.messages.filter((m) => m.conversationId === conversationId);
  return list[list.length - 1] ?? null;
}

export function unreadCount(s: State, conversation: Conversation) {
  return s.messages.filter(
    (m) =>
      m.conversationId === conversation.id &&
      m.from === 'psychologist' &&
      m.createdAt > conversation.lastReadAt
  ).length;
}

export function isSharing(s: State, psychologistId: string) {
  return s.shares.find((x) => x.psychologistId === psychologistId)?.active ?? false;
}

export function upcomingAppointments(s: State) {
  const now = new Date().toISOString();
  return s.appointments
    .filter((a) => a.startsAt > now && !a.cancelledAt)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

// El psicólogo con el que trabajas ahora (solo uno a la vez).
export function activeConversation(s: State) {
  return s.conversations.find((c) => !c.endedAt) ?? null;
}

// La solicitud que espera respuesta (solo una a la vez).
export function pendingRequest(s: State) {
  return s.requests.find((r) => r.status === 'pending') ?? null;
}

// Lo último que pasó sin conversación activa, para decirlo arriba del Chat: un "Ahora no" o un proceso
// que terminó. Solo lo más reciente.
export type CareOutcome =
  | { kind: 'declined'; request: CareRequest; at: string }
  | { kind: 'ended'; conversation: Conversation; at: string };

export function latestOutcome(s: State): CareOutcome | null {
  if (activeConversation(s) || pendingRequest(s)) return null;
  const declined: CareOutcome[] = s.requests
    .filter((r) => r.status === 'declined' && r.respondedAt)
    .map((r) => ({ kind: 'declined', request: r, at: r.respondedAt as string }));
  const ended: CareOutcome[] = s.conversations
    .filter((c) => c.endedAt)
    .map((c) => ({ kind: 'ended', conversation: c, at: c.endedAt as string }));
  const latest = [...declined, ...ended].sort((a, b) => b.at.localeCompare(a.at))[0] ?? null;
  // Un retiro posterior deja la pantalla limpia: la persona ya pasó a otra cosa.
  const withdrawn = s.requests.some((r) => r.status === 'withdrawn' && latest && (r.respondedAt ?? r.createdAt) > latest.at);
  return withdrawn ? null : latest;
}
