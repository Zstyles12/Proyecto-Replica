// La réplica al momento de la primera nota del día (RF-16, RF-17). Solo responde a una nota 'instant'
// de quien llama: una privada o una que espera la réplica del día nunca llega a Gemini.
import { askGemini, GeminiBlocked } from "../_shared/gemini.ts";
import { adminClient, callerOf, json, preflight } from "../_shared/server.ts";
import { careReply, cleanReply, notePrompt, REPLY_SCHEMA, systemFor, type Reply, type Tone } from "../_shared/voice.ts";

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const admin = adminClient();
  const user = await callerOf(req, admin);
  if (!user) return json({ error: "auth" }, 401);

  const body = (await req.json().catch(() => null)) as { entryId?: unknown } | null;
  const entryId = body?.entryId;
  if (typeof entryId !== "string") return json({ error: "input" }, 400);

  const { data: entry, error: entryError } = await admin
    .from("entries")
    .select("id, body, mood, prompt, reply_mode, day")
    .eq("id", entryId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (entryError) return json({ error: "input" }, 400);
  if (!entry) return json({ error: "not-found" }, 404);
  if (entry.reply_mode !== "instant") return json({ error: "not-instant" }, 409);

  // Pedirla dos veces no cuesta otra llamada.
  const { data: existing } = await admin
    .from("ai_replies")
    .select("headline, body, questions, learning, risk")
    .eq("entry_id", entry.id)
    .maybeSingle();
  if (existing) return json({ reply: existing });

  const { data: allowed } = await admin.rpc("take_ai_call", { p_user: user.id, p_day: entry.day });
  if (!allowed) return json({ error: "limit" }, 429);

  const [{ data: profile }, { data: settings }] = await Promise.all([
    admin.from("profiles").select("name").eq("id", user.id).single(),
    admin.from("user_settings").select("reply_tone").eq("user_id", user.id).single(),
  ]);
  const name = (profile?.name ?? "").trim().split(/\s+/)[0] ?? "";

  let reply: Reply | null;
  try {
    const raw = await askGemini(systemFor((settings?.reply_tone ?? "suave") as Tone), notePrompt(name, entry), REPLY_SCHEMA);
    reply = cleanReply(raw, entry.body);
    if (!reply) console.error("generate-reply: Gemini devolvió una réplica incompleta");
  } catch (error) {
    if (error instanceof GeminiBlocked) {
      reply = careReply(name);
    } else {
      console.error("generate-reply: falló Gemini", String(error));
      reply = null;
    }
  }
  if (!reply) {
    await admin.rpc("give_back_ai_call", { p_user: user.id, p_day: entry.day });
    return json({ error: "ai" }, 502);
  }

  const { error: saveError } = await admin.from("ai_replies").upsert({ entry_id: entry.id, ...reply }, { onConflict: "entry_id", ignoreDuplicates: true });
  if (saveError) {
    console.error("generate-reply: no se pudo guardar", saveError.code);
    return json({ error: "save" }, 500);
  }
  return json({ reply });
});
