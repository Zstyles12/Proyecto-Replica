import { findPsychologist, SIMULATED_REPLIES } from './data';
import type { Appointment, Conversation, DiaryShare, Message } from './types';
import { readString, writeString } from '../../lib/storage';
import { useSyncExternalStore } from 'react';

// Chat con psicólogos, sesiones y permisos del diario. Datos simulados hasta que exista Supabase.
// v2: las sesiones las agenda el psicólogo y hay un solo psicólogo activo.
const KEY = 'replica.care.v2';

type State = {
  conversations: Conversation[];
  messages: Message[];
  appointments: Appointment[];
  shares: DiaryShare[];
  typing: Record<string, boolean>;
};

function id() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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
      },
    ],
    shares: [],
    typing: {},
  };
}

function load(): State {
  const raw = readString(KEY);
  if (!raw) return seed();
  try {
    return { ...(JSON.parse(raw) as Omit<State, 'typing'>), typing: {} };
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
  if (save) {
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

let replyTurn = 0;

export const care = {
  clear() {
    update({ conversations: [], messages: [], appointments: [], shares: [], typing: {} });
  },

  // Solo hay un psicólogo activo a la vez: con otro activo, no se abre una conversación nueva.
  startConversation(psychologistId: string) {
    const active = activeConversation(state);
    if (active) return active.psychologistId === psychologistId ? active.id : null;
    const previous = state.conversations.find((c) => c.psychologistId === psychologistId);
    if (previous) {
      update({
        conversations: state.conversations.map((c) =>
          c.id === previous.id ? { ...c, endedAt: undefined } : c
        ),
      });
      return previous.id;
    }
    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: id(),
      psychologistId,
      createdAt: now,
      lastReadAt: now,
    };
    update({ conversations: [...state.conversations, conversation] });
    return conversation.id;
  },

  markRead(conversationId: string) {
    const now = new Date().toISOString();
    update({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, lastReadAt: now } : c
      ),
    });
  },

  // Envía el mensaje y simula que el psicólogo escribe y responde.
  send(conversationId: string, text: string) {
    addMessage({ conversationId, from: 'user', kind: 'text', text });
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
  },

  // Terminar el proceso con el psicólogo actual, para poder elegir a otro. El historial se conserva.
  end(conversationId: string) {
    const conversation = state.conversations.find((c) => c.id === conversationId);
    if (!conversation) return;
    const now = new Date().toISOString();
    update({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, endedAt: now } : c
      ),
      // Si el diario estaba compartido, deja de estarlo.
      shares: state.shares.map((sh) =>
        sh.psychologistId === conversation.psychologistId
          ? { ...sh, active: false, changedAt: now }
          : sh
      ),
    });
  },

  setDiaryShare(psychologistId: string, active: boolean) {
    const changedAt = new Date().toISOString();
    const others = state.shares.filter((s) => s.psychologistId !== psychologistId);
    update({ shares: [...others, { psychologistId, active, changedAt }] });
    const conversation = state.conversations.find((c) => c.psychologistId === psychologistId);
    const name = findPsychologist(psychologistId)?.name.split(' ')[0] ?? 'tu psicólogo';
    if (conversation) {
      addMessage({
        conversationId: conversation.id,
        from: 'system',
        kind: 'event',
        text: active
          ? `Compartiste tu diario con ${name}.`
          : `Dejaste de compartir tu diario con ${name}.`,
      });
    }
  },
};

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
