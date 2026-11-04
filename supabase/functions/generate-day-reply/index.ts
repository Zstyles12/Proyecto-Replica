// La réplica del día y la última réplica (RF-18, RF-19). La llama solo el trabajo programado
// (migración replicas_programadas), con su secreto. Lo que falle se vuelve a intentar en la próxima vuelta.
import { Buffer } from "node:buffer";
import { timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { askGemini, GeminiBlocked } from "../_shared/gemini.ts";
import { adminClient, json } from "../_shared/server.ts";
import { careReply, cleanComments, cleanReply, DAY_REPLY_SCHEMA, dayPrompt, systemFor, type Tone } from "../_shared/voice.ts";

// Una vuelta no puede pasarse del tiempo de una función; lo que quede sale en la siguiente.
const BATCH = 10;
const BUDGET_MS = 110_000;
const MIN_NOTES = 2;

type Due = { user_id: string; day: string; kind: "day" | "late" };

function authorized(req: Request) {
  const expected = Deno.env.get("CRON_SECRET");
  const given = req.headers.get("x-cron-secret");
  if (!expected || !given) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function generate(admin: SupabaseClient, { user_id, day, kind }: Due) {
  const { data: entries, error } = await admin
    .from("entries")
    .select("id, body, mood")
    .eq("user_id", user_id)
    .eq("day", day)
    .neq("reply_mode", "private")
    .order("created_at");
  if (error) throw new Error(error.message);

  let notes = entries ?? [];
  if (kind === "late") {
    const { data: night } = await admin
      .from("day_replies")
      .select("entry_ids")
      .eq("user_id", user_id)
      .eq("day", day)
      .eq("kind", "day")
      .single();
    notes = notes.filter((n) => !night?.entry_ids.includes(n.id));
  }
  if (notes.length < (kind === "late" ? 1 : MIN_NOTES)) return "sin notas";

  const { data: allowed } = await admin.rpc("take_ai_call", { p_user: user_id, p_day: day });
  if (!allowed) return "sin llamadas";

  const [{ data: profile }, { data: settings }] = await Promise.all([
    admin.from("profiles").select("name").eq("id", user_id).single(),
    admin.from("user_settings").select("reply_tone").eq("user_id", user_id).single(),
  ]);
  const name = (profile?.name ?? "").trim().split(/\s+/)[0] ?? "";

  let reply;
  let comments: { note: number; comment: string }[] = [];
  try {
    const raw = await askGemini(systemFor((settings?.reply_tone ?? "suave") as Tone), dayPrompt(name, notes, kind), DAY_REPLY_SCHEMA);
    reply = cleanReply(raw, notes.map((n) => n.body).join("\n"));
    comments = cleanComments(raw, notes.length);
  } catch (error) {
    if (!(error instanceof GeminiBlocked)) {
      await admin.rpc("give_back_ai_call", { p_user: user_id, p_day: day });
      throw error;
    }
    reply = careReply(name);
  }
  if (!reply) {
    await admin.rpc("give_back_ai_call", { p_user: user_id, p_day: day });
    throw new Error("Gemini devolvió una réplica incompleta");
  }

  const { error: saveError } = await admin.rpc("save_day_reply", {
    p_user: user_id,
    p_day: day,
    p_kind: kind,
    p_headline: reply.headline,
    p_body: reply.body,
    p_questions: reply.questions,
    p_learning: reply.learning,
    p_entry_ids: notes.map((n) => n.id),
    // Gemini solo conoció números: aquí vuelven a ser notas.
    p_comments: comments.map((c) => ({ entry_id: notes[c.note - 1].id, comment: c.comment })),
    p_risk: reply.risk,
  });
  if (saveError) throw new Error(saveError.message);
  return "lista";
}

Deno.serve(async (req) => {
  if (!authorized(req)) return json({ error: "auth" }, 401);

  const admin = adminClient();
  const started = Date.now();
  const { data, error } = await admin.rpc("due_day_replies", { p_limit: BATCH });
  if (error) {
    console.error("generate-day-reply: no se pudo consultar", error.code);
    return json({ error: "query" }, 500);
  }

  const results: Record<string, number> = {};
  for (const due of (data ?? []) as Due[]) {
    if (Date.now() - started > BUDGET_MS) break;
    let result: string;
    try {
      result = await generate(admin, due);
    } catch (e) {
      console.error("generate-day-reply: falló", due.kind, String(e));
      result = "falló";
    }
    results[result] = (results[result] ?? 0) + 1;
  }
  console.log("generate-day-reply:", JSON.stringify(results));
  return json({ results });
});
