import { useSyncExternalStore } from "react";
import { dayKey } from "../../lib/format";
import { aiChatService, forgetMockChats, type AiChat, type AiChatMessage } from "../../services/aiChat";

// Las conversaciones con Replica (RF-57, RF-58). Se traen al abrir /chat/ia por primera vez.
type State = {
  status: "idle" | "loading" | "ready" | "failed";
  chats: AiChat[];
  messages: AiChatMessage[];
  // La conversación que espera respuesta ("nueva" si todavía no existe).
  sending: string | null;
  // El día en que se llegó al límite: al día siguiente se puede volver a escribir.
  limitedOn: string | null;
  // La respuesta que va apareciendo palabra por palabra.
  reveal: { id: string; words: number } | null;
};

const EMPTY: State = { status: "idle", chats: [], messages: [], sending: null, limitedOn: null, reveal: null };

let state = EMPTY;
const listeners = new Set<() => void>();
let timers: ReturnType<typeof setTimeout>[] = [];

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAiChat() {
  return useSyncExternalStore(subscribe, () => state);
}

export const NEW_CHAT = "nueva";

function titleOf(text: string) {
  return text.length > 60 ? `${text.slice(0, 57).trimEnd()}…` : text;
}

// El mismo ritmo de la réplica (services/ai/pace.ts): pausas más largas después de una coma o un punto.
function revealWords(message: AiChatMessage) {
  const words = message.body.split(" ");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  set({ reveal: { id: message.id, words: 0 } });
  let elapsed = 0;
  words.forEach((_, i) => {
    const pause = /[.,?]$/.test(words[i - 1] ?? "") ? 180 : 0;
    elapsed += 50 + ((i * 37) % 55) + pause;
    timers.push(setTimeout(() => set({ reveal: { id: message.id, words: i + 1 } }), elapsed));
  });
  timers.push(setTimeout(() => set({ reveal: null }), elapsed + 60));
}

export function isLimited(s: State) {
  return s.limitedOn === dayKey(new Date());
}

export function messagesOf(s: State, chatId: string) {
  return s.messages.filter((m) => m.chatId === chatId);
}

// Las conversaciones, la más reciente arriba según su último mensaje.
export function sortedChats(s: State) {
  const last = new Map<string, string>();
  for (const m of s.messages) last.set(m.chatId, m.createdAt);
  return [...s.chats].sort((a, b) => (last.get(b.id) ?? b.createdAt).localeCompare(last.get(a.id) ?? a.createdAt));
}

export const aiChat = {
  load() {
    if (state.status === "loading" || state.status === "ready") return;
    set({ status: "loading" });
    aiChatService
      .load()
      .then((data) => set({ status: "ready", chats: data.chats, messages: data.messages }))
      .catch(() => set({ status: "failed" }));
  },

  // Dice a qué conversación fue a parar, o por qué no salió. El texto que no salió vuelve al campo.
  async send(chatId: string | null, text: string): Promise<{ ok: true; chatId: string } | { ok: false; reason: "limit" | "error" }> {
    set({ sending: chatId ?? NEW_CHAT });
    const result = await aiChatService.send(chatId, text);
    if (!result.ok) {
      set({ sending: null, limitedOn: result.reason === "limit" ? dayKey(new Date()) : state.limitedOn });
      return result;
    }
    const known = state.chats.some((c) => c.id === result.chat.id);
    const chat = { ...result.chat, title: result.chat.title || titleOf(text) };
    set({
      sending: null,
      chats: known ? state.chats : [chat, ...state.chats],
      messages: [...state.messages, ...result.messages],
    });
    const answer = result.messages.find((m) => m.role === "assistant");
    if (answer) revealWords(answer);
    return { ok: true, chatId: chat.id };
  },

  async remove(chatId: string) {
    try {
      await aiChatService.remove(chatId);
    } catch {
      return false;
    }
    set({ chats: state.chats.filter((c) => c.id !== chatId), messages: state.messages.filter((m) => m.chatId !== chatId) });
    return true;
  },

  // Al cerrar sesión: la próxima cuenta en este navegador no ve nada de esta. Al eliminar la cuenta
  // simulada, también se borra lo guardado en el navegador.
  clear({ forgetSaved = false } = {}) {
    if (forgetSaved) forgetMockChats();
    timers.forEach(clearTimeout);
    timers = [];
    state = EMPTY;
    listeners.forEach((l) => l());
  },
};
