// El chat con Replica (RF-57, RF-58): aparte del chat con psicólogos y del diario. Las respuestas las
// escribe el servidor (chat-with-ai), con su límite diario; la web nunca llama a Gemini.

export type AiChat = { id: string; title: string; createdAt: string };

export type AiChatMessage = {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  body: string;
  // La conversación muestra riesgo: debajo de la respuesta se enlaza a la ayuda en crisis (RF-61).
  risk: boolean;
  createdAt: string;
};

export type AiChatData = { chats: AiChat[]; messages: AiChatMessage[] };

// Lo que trae enviar: la conversación (nueva si no había) con el mensaje y su respuesta, o por qué no.
export type AiChatSent =
  | { ok: true; chat: AiChat; messages: AiChatMessage[] }
  | { ok: false; reason: "limit" | "error" };

export interface AiChatService {
  load(): Promise<AiChatData>;
  send(chatId: string | null, text: string): Promise<AiChatSent>;
  remove(chatId: string): Promise<void>;
}
