import { FunctionsHttpError, type SupabaseClient } from "@supabase/supabase-js";
import type { AiChat, AiChatMessage, AiChatService } from "./types";

type ChatRow = { id: string; title: string; created_at: string };
type MessageRow = { id: string; chat_id: string; role: AiChatMessage["role"]; body: string; risk: boolean; created_at: string };

const chatOf = (r: ChatRow): AiChat => ({ id: r.id, title: r.title, createdAt: r.created_at });
const messageOf = (r: MessageRow, chatId = r.chat_id): AiChatMessage => ({
  id: r.id,
  chatId,
  role: r.role,
  body: r.body,
  risk: r.risk,
  createdAt: r.created_at,
});

// Leer y borrar van directo a la base de datos, con sus reglas de acceso. Enviar pasa siempre por
// chat-with-ai, que guarda el mensaje, cuenta el límite y escribe la respuesta.
export function supabaseAiChatService(supabase: SupabaseClient): AiChatService {
  return {
    async load() {
      const [chats, messages] = await Promise.all([
        supabase.from("ai_chats").select("id, title, created_at").order("created_at", { ascending: false }),
        supabase.from("ai_chat_messages").select("id, chat_id, role, body, risk, created_at").order("created_at"),
      ]);
      if (chats.error) throw chats.error;
      if (messages.error) throw messages.error;
      return { chats: (chats.data as ChatRow[]).map(chatOf), messages: (messages.data as MessageRow[]).map((r) => messageOf(r)) };
    },

    async send(chatId, text) {
      const { data, error } = await supabase.functions.invoke<{ chatId: string; messages: Omit<MessageRow, "chat_id">[] }>("chat-with-ai", {
        body: { chatId, text },
      });
      if (error) {
        const status = error instanceof FunctionsHttpError ? (error.context as Response).status : 0;
        return { ok: false, reason: status === 429 ? "limit" : "error" };
      }
      if (!data) return { ok: false, reason: "error" };
      const messages = data.messages.map((m) => messageOf({ ...m, chat_id: data.chatId }));
      const first = messages[0];
      return { ok: true, chat: { id: data.chatId, title: "", createdAt: first?.createdAt ?? new Date().toISOString() }, messages };
    },

    async remove(chatId) {
      const { error } = await supabase.from("ai_chats").delete().eq("id", chatId);
      if (error) throw error;
    },
  };
}
