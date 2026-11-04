// El chat con Replica (RF-57, RF-61). Guarda el mensaje de la persona y la respuesta, con su límite
// diario. No lee el diario: solo la conversación.
import { askGemini, GeminiBlocked } from "../_shared/gemini.ts";
import { adminClient, callerOf, json, preflight } from "../_shared/server.ts";
import { careChat, CHAT_SCHEMA, chatSystem, chatTurn, cleanChat } from "../_shared/voice.ts";

const DAILY_LIMIT = 20;
const MAX_LENGTH = 2000;
// Lo que Gemini lee de la conversación: los últimos mensajes bastan para seguir el hilo.
const HISTORY = 20;

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const admin = adminClient();
  const user = await callerOf(req, admin);
  if (!user) return json({ error: "auth" }, 401);

  const input = (await req.json().catch(() => null)) as { chatId?: unknown; text?: unknown } | null;
  const text = typeof input?.text === "string" ? input.text.trim() : "";
  const chatId = typeof input?.chatId === "string" ? input.chatId : null;
  if (!text || text.length > MAX_LENGTH) return json({ error: "input" }, 400);

  // Una conversación que no es suya no existe para quien llama.
  if (chatId) {
    const { data: chat } = await admin.from("ai_chats").select("id").eq("id", chatId).eq("user_id", user.id).maybeSingle();
    if (!chat) return json({ error: "not-found" }, 404);
  }

  const { data: allowed } = await admin.rpc("take_chat_message", { p_user: user.id, p_limit: DAILY_LIMIT });
  if (!allowed) return json({ error: "limit" }, 429);

  const history = chatId
    ? ((
        await admin
          .from("ai_chat_messages")
          .select("role, body")
          .eq("chat_id", chatId)
          .order("created_at", { ascending: false })
          .limit(HISTORY)
      ).data ?? []).reverse()
    : [];
  const { data: profile } = await admin.from("profiles").select("name").eq("id", user.id).single();
  const name = (profile?.name ?? "").trim().split(/\s+/)[0] ?? "";

  let answer: { reply: string; risk: boolean } | null;
  try {
    const turns = [...history, { role: "user", body: text }].map((m) => chatTurn(m.role as "user" | "assistant", m.body));
    answer = cleanChat(await askGemini(chatSystem(name), turns, CHAT_SCHEMA), text);
    if (!answer) console.error("chat-with-ai: Gemini devolvió una respuesta vacía");
  } catch (error) {
    if (error instanceof GeminiBlocked) {
      answer = { reply: careChat(name), risk: true };
    } else {
      console.error("chat-with-ai: falló Gemini", String(error));
      answer = null;
    }
  }
  if (!answer) {
    await admin.rpc("give_back_chat_message", { p_user: user.id });
    return json({ error: "ai" }, 502);
  }

  let id = chatId;
  if (!id) {
    const title = text.length > 60 ? `${text.slice(0, 57).trimEnd()}…` : text;
    const { data: chat, error } = await admin.from("ai_chats").insert({ user_id: user.id, title }).select("id").single();
    if (error || !chat) {
      console.error("chat-with-ai: no se pudo crear la conversación", error?.code);
      return json({ error: "save" }, 500);
    }
    id = chat.id as string;
  }

  // La respuesta va un instante después, para que el orden se conserve. Las dos filas llevan las mismas
  // columnas: en una inserción de varias, la que falta llega como null.
  const now = Date.now();
  const { data: saved, error: saveError } = await admin
    .from("ai_chat_messages")
    .insert([
      { chat_id: id, role: "user", body: text, risk: false, created_at: new Date(now).toISOString() },
      { chat_id: id, role: "assistant", body: answer.reply, risk: answer.risk, created_at: new Date(now + 1).toISOString() },
    ])
    .select("id, role, body, risk, created_at");
  if (saveError || !saved) {
    console.error("chat-with-ai: no se pudo guardar", saveError?.code);
    return json({ error: "save" }, 500);
  }

  return json({ chatId: id, messages: saved });
});
