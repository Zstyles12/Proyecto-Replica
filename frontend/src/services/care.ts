import { CHAT_CONTENT, type PsychologistData } from "../data/chatContent";
import { playSound } from "../lib/sounds";
import type { Entry } from "./journal";

/**
 * Modelos 1:1 con las tablas de Care/Chat en 03-base-de-datos.md
 */

export interface Conversation {
  id: string;
  psychologist_id: string;
  user_id: string;
  created_at: string;
  last_read_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  from: "user" | "psychologist" | "system";
  kind: "text" | "shared_note";
  text: string;
  note_id?: string;
  note_preview?: {
    content: string;
    mood: string;
    tag: string;
  };
  created_at: string;
}

export interface Appointment {
  id: string;
  conversation_id: string;
  starts_at: string;
  duration_minutes: number;
  meet_link: string;
  status: "upcoming" | "completed" | "cancelled";
}

export interface DiaryShare {
  id: string;
  user_id: string;
  psychologist_id: string;
  is_active: boolean;
  updated_at: string;
}

interface CareState {
  activePsychologistId: string;
  conversations: Record<string, Conversation>; // keyed by psychologist_id
  messages: Message[];
  appointments: Appointment[];
  shares: Record<string, boolean>; // keyed by psychologist_id
}

const CARE_STORAGE_KEY = "replica_care_state";

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

function inDaysAt(days: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function seedCareState(): CareState {
  const defaultPsiId = "psi-valeria";
  const convId = "conv-valeria";

  return {
    activePsychologistId: defaultPsiId,
    conversations: {
      [defaultPsiId]: {
        id: convId,
        psychologist_id: defaultPsiId,
        user_id: "user_seed",
        created_at: hoursAgo(48),
        last_read_at: hoursAgo(1),
      },
    },
    messages: [
      {
        id: "msg-1",
        conversation_id: convId,
        from: "user",
        kind: "text",
        text: "Hola, Valeria. Llevo unas semanas sintiendo bastante sobrecarga en el trabajo y me gustaría comenzar un espacio de terapia contigo.",
        created_at: hoursAgo(46),
      },
      {
        id: "msg-2",
        conversation_id: convId,
        from: "psychologist",
        kind: "text",
        text: "Hola, Ana. Gracias por escribirme y dar este paso. Me parece una excelente idea. Podemos empezar con una primera sesión por Google Meet para conocernos y entender qué herramientas necesitas.",
        created_at: hoursAgo(45),
      },
      {
        id: "msg-3",
        conversation_id: convId,
        from: "user",
        kind: "text",
        text: "Me parece perfecto. Los horarios de tarde me vienen mucho mejor.",
        created_at: hoursAgo(24),
      },
      {
        id: "msg-4",
        conversation_id: convId,
        from: "psychologist",
        kind: "text",
        text: "Excelente. Te acabo de agendar una primera sesión para este jueves a las 18:00. Tienes el acceso a Meet directo aquí arriba. Si necesitas cambiar la hora en algún momento, solo avísame.",
        created_at: hoursAgo(20),
      },
    ],
    appointments: [
      {
        id: "appt-1",
        conversation_id: convId,
        starts_at: inDaysAt(2, 18),
        duration_minutes: 50,
        meet_link: "https://meet.google.com/rpl-valr-ond",
        status: "upcoming",
      },
    ],
    shares: {
      [defaultPsiId]: false,
    },
  };
}

function getStoredCareState(): CareState {
  if (typeof window === "undefined") return seedCareState();
  const raw = localStorage.getItem(CARE_STORAGE_KEY);
  if (!raw) {
    const seeded = seedCareState();
    localStorage.setItem(CARE_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    return JSON.parse(raw) as CareState;
  } catch {
    return seedCareState();
  }
}

function saveCareState(state: CareState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CARE_STORAGE_KEY, JSON.stringify(state));
}

export const careService = {
  getPsychologists(): PsychologistData[] {
    return [...CHAT_CONTENT.psychologists];
  },

  findPsychologist(id: string): PsychologistData | undefined {
    return CHAT_CONTENT.psychologists.find((p) => p.id === id);
  },

  getActivePsychologist(): PsychologistData {
    const state = getStoredCareState();
    const psi = this.findPsychologist(state.activePsychologistId);
    return psi || CHAT_CONTENT.psychologists[0];
  },

  getActiveConversation(): Conversation {
    const state = getStoredCareState();
    const activePsiId = state.activePsychologistId;

    if (!state.conversations[activePsiId]) {
      const newConv: Conversation = {
        id: `conv_${activePsiId}_${Date.now()}`,
        psychologist_id: activePsiId,
        user_id: "user_seed",
        created_at: new Date().toISOString(),
      };
      state.conversations[activePsiId] = newConv;
      saveCareState(state);
    }

    return state.conversations[activePsiId];
  },

  getMessages(conversationId: string): Message[] {
    const state = getStoredCareState();
    return state.messages.filter((m) => m.conversation_id === conversationId);
  },

  getUpcomingAppointment(conversationId: string): Appointment | null {
    const state = getStoredCareState();
    return (
      state.appointments.find(
        (a) => a.conversation_id === conversationId && a.status === "upcoming"
      ) || null
    );
  },

  isSharingDiary(psychologistId: string): boolean {
    const state = getStoredCareState();
    return !!state.shares[psychologistId];
  },

  toggleDiaryShare(psychologistId: string): boolean {
    const state = getStoredCareState();
    const next = !state.shares[psychologistId];
    state.shares[psychologistId] = next;
    saveCareState(state);
    return next;
  },

  setActivePsychologist(psychologistId: string): Conversation {
    const state = getStoredCareState();
    state.activePsychologistId = psychologistId;

    if (!state.conversations[psychologistId]) {
      const newConv: Conversation = {
        id: `conv_${psychologistId}_${Date.now()}`,
        psychologist_id: psychologistId,
        user_id: "user_seed",
        created_at: new Date().toISOString(),
      };
      state.conversations[psychologistId] = newConv;
    }

    saveCareState(state);
    return state.conversations[psychologistId];
  },

  async sendMessage(
    conversationId: string,
    text: string,
    onTypingChange?: (typing: boolean) => void
  ): Promise<Message> {
    const state = getStoredCareState();
    const userMsg: Message = {
      id: `msg_${Date.now()}_u`,
      conversation_id: conversationId,
      from: "user",
      kind: "text",
      text: text.trim(),
      created_at: new Date().toISOString(),
    };

    state.messages.push(userMsg);
    saveCareState(state);
    playSound("enviado");

    // Simular respuesta del psicólogo tras un breve lapso reflexivo
    if (onTypingChange) {
      setTimeout(() => onTypingChange(true), 400);
      setTimeout(() => {
        onTypingChange(false);
        const replies = CHAT_CONTENT.simulatedReplies;
        const randomReply =
          replies[Math.floor(Math.random() * replies.length)];

        const psiMsg: Message = {
          id: `msg_${Date.now()}_p`,
          conversation_id: conversationId,
          from: "psychologist",
          kind: "text",
          text: randomReply,
          created_at: new Date().toISOString(),
        };

        const updatedState = getStoredCareState();
        updatedState.messages.push(psiMsg);
        saveCareState(updatedState);
        playSound("recibido");
      }, 1800);
    }

    return userMsg;
  },

  async shareNote(
    conversationId: string,
    entry: Entry,
    onTypingChange?: (typing: boolean) => void
  ): Promise<Message> {
    const state = getStoredCareState();
    const sharedMsg: Message = {
      id: `msg_${Date.now()}_share`,
      conversation_id: conversationId,
      from: "user",
      kind: "shared_note",
      text: `Compartí una nota de mi diario: "${entry.content.slice(0, 60)}…"`,
      note_id: entry.id,
      note_preview: {
        content: entry.content,
        mood: entry.mood,
        tag: entry.tag,
      },
      created_at: new Date().toISOString(),
    };

    state.messages.push(sharedMsg);
    saveCareState(state);
    playSound("enviado");

    if (onTypingChange) {
      setTimeout(() => onTypingChange(true), 400);
      setTimeout(() => {
        onTypingChange(false);
        const psiMsg: Message = {
          id: `msg_${Date.now()}_p`,
          conversation_id: conversationId,
          from: "psychologist",
          kind: "text",
          text: `Gracias por compartirme esta nota. Veo que escribías sobre ${entry.tag} sintiendo ${entry.mood}. Es un material muy valioso para profundizar en nuestra sesión.`,
          created_at: new Date().toISOString(),
        };

        const updatedState = getStoredCareState();
        updatedState.messages.push(psiMsg);
        saveCareState(updatedState);
        playSound("recibido");
      }, 1800);
    }

    return sharedMsg;
  },
};
