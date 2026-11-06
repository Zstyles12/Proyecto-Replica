import { useSyncExternalStore } from "react";
import {
  professionalService,
  type Application,
  type ApplicationForm,
  type Availability,
  type EditableProfile,
  type Patient,
  type Practice,
  type ReviewAction,
  type UploadedDocument,
} from "../../services/professional";
import type { Message, MessageEvent } from "../care/types";

// El área profesional en memoria: la solicitud propia, la lista del administrador y el consultorio.
// Cada parte se trae al abrir su pantalla, y al cerrar sesión se vacía (lib/session.ts).

type Load<T> = { status: "idle" | "loading" | "ready" | "error"; value: T };

type State = {
  application: Load<Application | null>;
  applications: Load<Application[]>;
  practice: Load<Practice | null>;
};

const INITIAL: State = {
  application: { status: "idle", value: null },
  applications: { status: "idle", value: [] },
  practice: { status: "idle", value: null },
};

let state: State = INITIAL;
const listeners = new Set<() => void>();
let stopLive: (() => void) | null = null;
// Cada vuelta tiene su número: si se cerró sesión mientras tanto, lo que llega tarde no se guarda.
let generation = 0;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function setPractice(update: (p: Practice) => Practice) {
  const current = state.practice.value;
  if (current) set({ practice: { status: "ready", value: update(current) } });
}

function id() {
  return crypto.randomUUID();
}

// Reemplaza o agrega por id, en orden.
function upsertMessage(list: Message[], message: Message) {
  const next = list.some((m) => m.id === message.id) ? list.map((m) => (m.id === message.id ? message : m)) : [...list, message];
  return next.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

// Los mensajes propios que todavía van camino al servidor: una vuelta completa no los borra.
const sending = new Set<string>();
let resyncing: Promise<void> | null = null;
let resyncAgain = false;

async function resyncPractice() {
  if (resyncing) {
    resyncAgain = true;
    return resyncing;
  }
  const mine = generation;
  resyncing = (async () => {
    do {
      resyncAgain = false;
      try {
        const fresh = await professionalService.loadPractice();
        if (mine !== generation) return;
        const ids = new Set(fresh.messages.map((m) => m.id));
        const pending = (state.practice.value?.messages ?? []).filter((m) => sending.has(m.id) && !ids.has(m.id));
        set({ practice: { status: "ready", value: { ...fresh, messages: [...fresh.messages, ...pending] } } });
      } catch {
        // Sin conexión: se vuelve a intentar cuando el canal se reconecte.
      }
    } while (resyncAgain);
  })().finally(() => {
    resyncing = null;
  });
  return resyncing;
}

export const professional = {
  clear() {
    generation += 1;
    stopLive?.();
    stopLive = null;
    sending.clear();
    set(INITIAL);
  },

  // La solicitud propia ---------------------------------------------------------------------------

  async loadApplication() {
    const mine = generation;
    set({ application: { status: state.application.status === "ready" ? "ready" : "loading", value: state.application.value } });
    try {
      const value = await professionalService.myApplication();
      if (mine === generation) set({ application: { status: "ready", value } });
    } catch {
      if (mine === generation) set({ application: { status: "error", value: state.application.value } });
    }
  },

  // Envía y vuelve a traer la solicitud, tal como quedó en el servidor. Dice si se pudo.
  async submitApplication(form: ApplicationForm, ethicsVersion: string, uploads: UploadedDocument[], replace: string[]) {
    try {
      await professionalService.submitApplication(form, ethicsVersion, uploads, replace);
    } catch {
      return false;
    }
    await professional.loadApplication();
    return true;
  },

  // La lista del administrador --------------------------------------------------------------------

  async loadApplications() {
    const mine = generation;
    set({ applications: { status: state.applications.status === "ready" ? "ready" : "loading", value: state.applications.value } });
    try {
      const value = await professionalService.listApplications();
      if (mine === generation) set({ applications: { status: "ready", value } });
    } catch {
      if (mine === generation) set({ applications: { status: "error", value: state.applications.value } });
    }
  },

  async review(applicationId: string, action: ReviewAction, reason: string, documentIds: string[]) {
    try {
      await professionalService.review(applicationId, action, reason, documentIds);
    } catch {
      await professional.loadApplications();
      return false;
    }
    await professional.loadApplications();
    return true;
  },

  // El consultorio --------------------------------------------------------------------------------

  // La primera vez lo trae entero y se queda escuchando; después solo vuelve a traerlo.
  async loadPractice() {
    if (state.practice.status === "ready" || state.practice.status === "loading") return resyncPractice();
    const mine = generation;
    set({ practice: { status: "loading", value: null } });
    try {
      const value = await professionalService.loadPractice();
      if (mine !== generation) return;
      set({ practice: { status: "ready", value } });
      stopLive?.();
      stopLive = professionalService.live({
        onMessage: (message) => {
          if (!state.practice.value?.patients.some((p) => p.conversationId === message.conversationId)) return;
          setPractice((p) => ({ ...p, messages: upsertMessage(p.messages, message) }));
        },
        onResync: () => void resyncPractice(),
      });
    } catch {
      if (mine === generation) set({ practice: { status: "error", value: null } });
    }
  },

  async answerRequest(requestId: string, accept: boolean) {
    try {
      await professionalService.answerRequest(requestId, accept);
    } catch {
      await resyncPractice();
      return false;
    }
    await resyncPractice();
    return true;
  },

  // El mensaje aparece al momento; uno que no salió no se queda como enviado.
  async send(conversationId: string, text: string) {
    const message: Message = { id: id(), conversationId, from: "psychologist", kind: "text", text, createdAt: new Date().toISOString() };
    sending.add(message.id);
    setPractice((p) => ({ ...p, messages: upsertMessage(p.messages, message) }));
    try {
      await professionalService.sendMessage(message);
      return true;
    } catch {
      setPractice((p) => ({ ...p, messages: p.messages.filter((m) => m.id !== message.id) }));
      return false;
    } finally {
      sending.delete(message.id);
    }
  },

  markRead(conversationId: string) {
    const now = new Date().toISOString();
    setPractice((p) => ({ ...p, patients: p.patients.map((x) => (x.conversationId === conversationId ? { ...x, readAt: now } : x)) }));
    professionalService.markRead(conversationId).catch(() => {});
  },

  async endCare(conversationId: string) {
    try {
      await professionalService.endCare(conversationId);
    } catch {
      return false;
    }
    await resyncPractice();
    return true;
  },

  async saveProfile(profile: EditableProfile) {
    try {
      await professionalService.saveProfile(profile);
    } catch {
      return false;
    }
    setPractice((p) => ({ ...p, profile: { ...p.profile, ...profile } }));
    return true;
  },

  async saveSchedule(meetLink: string, availability: Availability) {
    try {
      await professionalService.saveSchedule(meetLink, availability);
    } catch {
      return false;
    }
    setPractice((p) => ({ ...p, meetLink, availability }));
    return true;
  },

  async schedule(conversationId: string, startsAt: string) {
    const practice = state.practice.value;
    if (!practice?.meetLink) return false;
    try {
      await professionalService.schedule(conversationId, startsAt, practice.availability.minutes, practice.meetLink);
    } catch {
      return false;
    }
    await resyncPractice();
    return true;
  },

  async cancelAppointment(appointmentId: string) {
    try {
      await professionalService.cancelAppointment(appointmentId);
    } catch {
      return false;
    }
    await resyncPractice();
    return true;
  },
};

export function useProfessional() {
  return useSyncExternalStore(subscribe, () => state);
}

// Lecturas del consultorio ---------------------------------------------------------------------

export function activePatients(p: Practice) {
  return p.patients.filter((x) => !x.endedAt).sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function endedPatients(p: Practice) {
  return p.patients.filter((x) => x.endedAt).sort((a, b) => (b.endedAt ?? "").localeCompare(a.endedAt ?? ""));
}

export function upcomingSessions(p: Practice) {
  const now = new Date().toISOString();
  const open = new Set(activePatients(p).map((x) => x.conversationId));
  return p.appointments
    .filter((a) => a.startsAt > now && !a.cancelledAt && open.has(a.conversationId))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function patientOfConversation(p: Practice, conversationId: string) {
  return p.patients.find((x) => x.conversationId === conversationId) ?? null;
}

export function conversationMessages(p: Practice, conversationId: string) {
  return p.messages.filter((m) => m.conversationId === conversationId);
}

// Llegó algo del paciente después de lo último que leyó el psicólogo.
export function hasUnread(p: Practice, patient: Patient) {
  return p.messages.some((m) => m.conversationId === patient.conversationId && m.from === "user" && m.createdAt > patient.readAt);
}

// Cuándo alguien empezó o dejó de compartir su diario, de lo más nuevo a lo más viejo.
export function shareEvents(p: Practice) {
  return p.messages
    .filter((m) => m.event === "share_on" || m.event === "share_off")
    .map((m) => ({ message: m, patient: patientOfConversation(p, m.conversationId) }))
    .filter((x): x is { message: Message; patient: Patient } => !!x.patient)
    .sort((a, b) => b.message.createdAt.localeCompare(a.message.createdAt));
}

// Los avisos del chat, dichos para el psicólogo (DESIGN-WEB.md §10). body viene escrito para la persona.
export function practiceEventText(event: MessageEvent | undefined, patientName: string, fallback: string) {
  const first = patientName.split(" ")[0] || patientName;
  switch (event) {
    case "accepted":
      return `Aceptaste acompañar a ${first}.`;
    case "share_on":
      return `${first} te compartió su diario.`;
    case "share_off":
      return `${first} dejó de compartir su diario.`;
    case "ended_user":
      return `${first} terminó su proceso contigo.`;
    case "ended_psychologist":
      return `Dejaste de atender a ${first}.`;
    case "ended_replica":
      return `Tu acompañamiento con ${first} terminó al retirarse tu verificación.`;
    default:
      return fallback;
  }
}
