import { dayKey } from "../../lib/format";
import { showsRisk } from "../../lib/risk";
import type { AiChat, AiChatData, AiChatMessage, AiChatService } from "./types";

// Sin servidor: las conversaciones quedan en este navegador y las respuestas son de ejemplo, con el
// mismo límite diario que chat-with-ai.
const KEY = "replica:chat-ia";
const DAILY_LIMIT = 20;
const DELAY = 900;

type Stored = AiChatData & { usage: { day: string; count: number } };

function read(): Stored {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Stored;
  } catch {
    // Sin almacenamiento, se empieza de cero.
  }
  return { chats: [], messages: [], usage: { day: "", count: 0 } };
}

function write(data: Stored) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Se pierde al recargar: solo es la versión simulada.
  }
}

const ANSWERS = [
  "Gracias por contármelo. ¿Qué parte de eso te pesa más ahora?",
  "Te leo. A veces ponerlo en palabras ya ordena un poco lo que se siente. ¿Cómo estás con eso en este momento?",
  "Suena a que hoy cargaste bastante. No hace falta resolverlo todo ahora. ¿Qué necesitarías esta noche?",
  "Entiendo. Lo que sientes tiene sentido con lo que estás viviendo. ¿Hay algo que te gustaría decir y todavía no dijiste?",
];

const CARE =
  "Me importa lo que escribiste. No tienes por qué cargarlo a solas. Hablar hoy con alguien de confianza o con una línea de ayuda de tu país puede acompañarte de verdad.";

function title(text: string) {
  return text.length > 60 ? `${text.slice(0, 57).trimEnd()}…` : text;
}

export function forgetMockChats() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // No había nada que borrar.
  }
}

export const mockAiChatService: AiChatService = {
  async load() {
    const { chats, messages } = read();
    return { chats, messages };
  },

  async send(chatId, text) {
    await new Promise((resolve) => setTimeout(resolve, DELAY));
    const data = read();
    const today = dayKey(new Date());
    if (data.usage.day !== today) data.usage = { day: today, count: 0 };
    if (data.usage.count >= DAILY_LIMIT) return { ok: false, reason: "limit" };
    data.usage.count += 1;

    const now = Date.now();
    let chat: AiChat | undefined = chatId ? data.chats.find((c) => c.id === chatId) : undefined;
    if (chatId && !chat) return { ok: false, reason: "error" };
    if (!chat) {
      chat = { id: crypto.randomUUID(), title: title(text), createdAt: new Date(now).toISOString() };
      data.chats.push(chat);
    }
    const risk = showsRisk(text);
    const turn = data.messages.filter((m) => m.chatId === chat.id && m.role === "user").length;
    const messages: AiChatMessage[] = [
      { id: crypto.randomUUID(), chatId: chat.id, role: "user", body: text, risk: false, createdAt: new Date(now).toISOString() },
      {
        id: crypto.randomUUID(),
        chatId: chat.id,
        role: "assistant",
        body: risk ? CARE : ANSWERS[turn % ANSWERS.length],
        risk,
        createdAt: new Date(now + 1).toISOString(),
      },
    ];
    data.messages.push(...messages);
    write(data);
    return { ok: true, chat, messages };
  },

  async remove(chatId) {
    const data = read();
    write({ ...data, chats: data.chats.filter((c) => c.id !== chatId), messages: data.messages.filter((m) => m.chatId !== chatId) });
  },
};
