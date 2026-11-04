// Comprueba la réplica del día de punta a punta: pg_cron, Vault, la función con su secreto y Gemini.
// Deja dos notas de ayer a la cuenta de prueba y espera la próxima vuelta del trabajo, que corre cada
// 15 minutos. Al terminar borra lo que creó. Gasta una llamada a Gemini:
//   node --env-file=../supabase/.env scripts/comprobar-programada.mjs
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_PUBLIC_KEY, SUPABASE_SECRET_KEY, REPLICA_TEST_PASSWORD } = process.env;
if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY || !SUPABASE_SECRET_KEY || !REPLICA_TEST_PASSWORD) {
  console.error("Faltan variables en supabase/.env (supabase/README.md).");
  process.exit(1);
}

const WAIT_MINUTES = 17;
const options = { auth: { autoRefreshToken: false, persistSession: false } };
const admin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, options);
const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, options);

const { data, error } = await client.auth.signInWithPassword({
  email: "ana@replica.test",
  password: REPLICA_TEST_PASSWORD,
});
if (error) throw error;
const userId = data.user.id;

async function cleanUp() {
  await admin.from("day_replies").delete().eq("user_id", userId);
  await admin.from("entries").delete().eq("user_id", userId);
  await admin.from("ai_usage").delete().eq("user_id", userId);
}

const note = (body) =>
  client.rpc("create_entry", { p_id: randomUUID(), p_body: body, p_mood: "paz", p_tag: "Yo", p_private: false }).single();

await cleanUp();
const first = await note("Ayer ordené el cuarto y encontré unas fotos de la playa.");
const second = await note("En la noche llamé a mi abuela y hablamos un buen rato.");
if (first.error || second.error) throw first.error ?? second.error;

const yesterday = new Date(`${first.data.day}T12:00:00Z`);
yesterday.setUTCDate(yesterday.getUTCDate() - 1);
const day = yesterday.toISOString().slice(0, 10);
const moved = await admin.from("entries").update({ day }).eq("user_id", userId);
if (moved.error) throw moved.error;

console.log(`Esperando la vuelta programada, hasta ${WAIT_MINUTES} minutos…`);
const started = Date.now();
let reply = null;
while (!reply && Date.now() - started < WAIT_MINUTES * 60_000) {
  await new Promise((resolve) => setTimeout(resolve, 15_000));
  const found = await admin.from("day_replies").select("*").eq("user_id", userId).maybeSingle();
  reply = found.data;
}

const minutes = ((Date.now() - started) / 60_000).toFixed(1);
if (reply) {
  console.log(`  bien la réplica del día llegó sola, a los ${minutes} min`);
  console.log(`      "${reply.headline}"\n      ${reply.body}`);
  const { data: notes } = await admin.from("entries").select("id").eq("user_id", userId);
  const read = notes?.every((n) => reply.entry_ids?.includes(n.id));
  console.log(read ? "  bien leyó las dos notas" : "  MAL  no leyó las dos notas");
} else {
  console.log(`  MAL  no llegó en ${minutes} min. Revisa Vault y CRON_SECRET (supabase/README.md).`);
}
await cleanUp();
process.exit(reply ? 0 : 1);
