// Comprueba las reglas de acceso contra el proyecto de Supabase, con consultas directas y dos cuentas
// reales (docs/04-plan.md, Fases 14, 16 y 17). Necesita las cuentas de cuentas-de-prueba.mjs:
//   node --env-file=../supabase/.env scripts/comprobar-accesos.mjs
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_PUBLIC_KEY, SUPABASE_SECRET_KEY, REPLICA_TEST_PASSWORD } = process.env;
if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY || !SUPABASE_SECRET_KEY || !REPLICA_TEST_PASSWORD) {
  console.error("Faltan variables en supabase/.env (supabase/README.md).");
  process.exit(1);
}

const options = { auth: { autoRefreshToken: false, persistSession: false } };
const admin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, options);

async function signIn(email) {
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, options);
  const { data, error } = await client.auth.signInWithPassword({ email, password: REPLICA_TEST_PASSWORD });
  if (error) throw new Error(`${email}: ${error.message}`);
  return { client, id: data.user.id };
}

let failed = 0;
function check(name, ok) {
  if (!ok) failed += 1;
  console.log(ok ? "  bien" : "  MAL ", name);
}
const empty = ({ data, error }) => Boolean(error) || !data?.length;

const ana = await signIn("ana@replica.test");
const beto = await signIn("beto@replica.test");
const valeria = await signIn("valeria@replica.test");
const nobody = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, options);

const note = (client, id, isPrivate) =>
  client
    .rpc("create_entry", { p_id: id, p_body: "Nota de comprobación.", p_mood: "paz", p_tag: "Yo", p_private: isPrivate })
    .single();

const privateId = randomUUID();
const publicId = randomUUID();
const secondId = randomUUID();

console.log("Ana escribe");
const first = await note(ana.client, publicId, false);
const second = await note(ana.client, secondId, false);
const hidden = await note(ana.client, privateId, true);
check("su nota no privada se guarda", !first.error);
check("la siguiente la lee la réplica del día", second.data?.reply_mode === "day");
check("la privada se guarda como privada", hidden.data?.reply_mode === "private");
const { error: directInsert } = await ana.client.from("entries").insert({ user_id: ana.id, body: "x", mood: "paz" });
check("no se puede crear una nota sin pasar por las reglas", Boolean(directInsert));
const { error: changeMode } = await ana.client.from("entries").update({ reply_mode: "day" }).eq("id", privateId);
check("una privada no deja de serlo", Boolean(changeMode));

console.log("Beto intenta entrar a lo de Ana");
check("no lee sus notas", empty(await beto.client.from("entries").select("id").eq("user_id", ana.id)));
check("no lee su perfil", empty(await beto.client.from("profiles").select("id").eq("id", ana.id)));
check("no lee sus ajustes", empty(await beto.client.from("user_settings").select("user_id").eq("user_id", ana.id)));
check("no lee sus réplicas", empty(await beto.client.from("ai_replies").select("id").eq("entry_id", publicId)));
check("no lee sus réplicas del día", empty(await beto.client.from("day_replies").select("id").eq("user_id", ana.id)));
check("no lee su cofre", empty(await beto.client.from("saved_phrases").select("id").eq("user_id", ana.id)));
check("no lee sus conversaciones", empty(await beto.client.from("conversations").select("id").eq("user_id", ana.id)));
check(
  "no le cambia una nota",
  empty(await beto.client.from("entries").update({ is_favorite: true }).eq("id", publicId).select("id"))
);
check("no pisa el id de una nota suya", Boolean((await note(beto.client, publicId, false)).error));

console.log("Sin sesión");
check("no lee notas", empty(await nobody.from("entries").select("id")));
check("no lee perfiles", empty(await nobody.from("profiles").select("id")));
check("no lee el directorio", empty(await nobody.from("psychologist_directory").select("id")));

console.log("Psicóloga");
check("sin permiso no lee notas", empty(await valeria.client.from("entries").select("id").eq("user_id", ana.id)));
await admin.from("diary_shares").upsert({ user_id: ana.id, psychologist_id: valeria.id, active: true }, { onConflict: "user_id,psychologist_id" });
const shared = await valeria.client.from("entries").select("id, reply_mode").eq("user_id", ana.id);
check("con permiso lee las no privadas", shared.data?.some((e) => e.id === publicId));
check("nunca una privada", !shared.data?.some((e) => e.reply_mode === "private"));
check("no lee las réplicas", empty(await valeria.client.from("ai_replies").select("id").eq("entry_id", publicId)));
await admin.from("diary_shares").update({ active: false }).eq("user_id", ana.id).eq("psychologist_id", valeria.id);
check("sin el permiso deja de leer", empty(await valeria.client.from("entries").select("id").eq("user_id", ana.id)));

console.log("Área profesional");
check("nadie abre una conversación sin que la acepten", Boolean((await ana.client.from("conversations").insert({ psychologist_id: valeria.id })).error));
check(
  "nadie se marca como psicólogo aprobado",
  Boolean((await beto.client.from("psychologist_profiles").insert({ profile_id: beto.id, full_name: "x", license: "x", status: "approved" })).error)
);
check("nadie revisa una solicitud desde el navegador", Boolean((await ana.client.rpc("review_application", { p_admin: ana.id, p_application: beto.id, p_action: "approved", p_reason: "", p_documents: [] })).error));
check("nadie escribe en el historial de revisiones", Boolean((await ana.client.from("verification_reviews").insert({ application_id: ana.id, admin_id: ana.id, action: "approved" })).error));
check("sin sesión no se envía una solicitud", Boolean((await nobody.rpc("submit_application", { p_full_name: "x" })).error));
check("la persona no lee las notas clínicas", empty(await ana.client.from("clinical_notes").select("id")));
check("nadie escribe notas clínicas sin acompañar a la persona", Boolean((await beto.client.from("clinical_notes").insert({ patient_id: ana.id, body: "x" })).error));
check(
  "nadie acepta una solicitud que no es suya",
  empty(await beto.client.from("care_requests").update({ status: "accepted" }).eq("user_id", ana.id).select("id"))
);

console.log("Sin conexión y recordatorio");
const writtenAt = (ms) => ({ p_body: "Nota sin conexión.", p_mood: "paz", p_tag: "Yo", p_written_at: new Date(Date.now() - ms).toISOString() });
const offlineId = randomUUID();
const futureId = randomUUID();
const oldId = randomUUID();
const offline = await ana.client.rpc("create_entry", { p_id: offlineId, ...writtenAt(2 * 3600_000) }).single();
check("una nota sin conexión guarda la hora en que se escribió", Math.abs(new Date(offline.data?.created_at).getTime() - (Date.now() - 2 * 3600_000)) < 60_000);
const future = await ana.client.rpc("create_entry", { p_id: futureId, ...writtenAt(-3600_000) }).single();
check("una hora en el futuro queda en ahora", Math.abs(new Date(future.data?.created_at).getTime() - Date.now()) < 60_000);
const old = await ana.client.rpc("create_entry", { p_id: oldId, ...writtenAt(5 * 86_400_000) }).single();
check("una hora de hace más de tres días queda en ahora", Math.abs(new Date(old.data?.created_at).getTime() - Date.now()) < 60_000);
const token = JSON.stringify({ endpoint: `https://push.example.test/${randomUUID()}`, keys: { p256dh: "x", auth: "x" } });
check("registra su navegador", !(await ana.client.rpc("register_push", { p_token: token })).error);
check("una suscripción sin https se rechaza", Boolean((await ana.client.rpc("register_push", { p_token: JSON.stringify({ endpoint: "http://x" }) })).error));
check("sin sesión no se registra", Boolean((await nobody.rpc("register_push", { p_token: token })).error));
check("otra persona no lee su suscripción", empty(await beto.client.from("push_tokens").select("id").eq("user_id", ana.id)));
check("el mismo navegador pasa a quien lo registra", !(await beto.client.rpc("register_push", { p_token: token })).error);
check("y la cuenta anterior ya no lo tiene", empty(await admin.from("push_tokens").select("id").eq("token", token).eq("user_id", ana.id)));
check("nadie pide la lista de recordatorios", Boolean((await ana.client.rpc("due_reminders")).error));
check("nadie manda los recordatorios", (await ana.client.functions.invoke("send-reminders", { body: {} })).error?.context?.status === 401);
await admin.from("push_tokens").delete().eq("token", token);

console.log("Borrar una nota");
const stillThere = async (id) => !empty(await admin.from("entries").select("id").eq("id", id));
await beto.client.from("entries").delete().eq("id", oldId);
check("otra persona no la borra", await stillThere(oldId));
await valeria.client.from("entries").delete().eq("id", oldId);
check("la psicóloga no la borra", await stillThere(oldId));
await nobody.from("entries").delete().eq("id", oldId);
check("sin sesión no se borra", await stillThere(oldId));
const own = await ana.client.from("entries").delete().eq("id", oldId).select("id");
check("la persona borra su nota", !own.error && own.data?.length === 1 && !(await stillThere(oldId)));

console.log("Réplica");
const body = { entryId: privateId };
const asPrivate = await ana.client.functions.invoke("generate-reply", { body });
check("una nota privada no pasa de la función", asPrivate.error?.context?.status === 409);
const stranger = await beto.client.functions.invoke("generate-reply", { body: { entryId: publicId } });
check("nadie pide la réplica de otra persona", stranger.error?.context?.status === 404);

await admin.from("entries").delete().in("id", [privateId, publicId, secondId, offlineId, futureId, oldId]);
await admin.from("ai_usage").delete().eq("user_id", ana.id);
console.log(failed ? `\n${failed} comprobaciones fallaron.` : "\nTodo bien.");
process.exit(failed ? 1 : 0);
