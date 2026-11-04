// Comprueba contra el proyecto de Supabase lo que comprobar-accesos.mjs no cubre: la réplica real de
// Gemini, Storage, el tiempo real, eliminar una cuenta (docs/04-plan.md, Fase 14), la ayuda en crisis y el chat con
// Replica (Fase 15), y el acompañamiento, el visor, las notas clínicas y la verificación (Fase 16). Necesita las
// cuentas de cuentas-de-prueba.mjs y deja el proyecto como lo encontró. Gasta cuatro llamadas a Gemini:
//   node --env-file=../supabase/.env scripts/comprobar-flujo.mjs
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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ana = await signIn("ana@replica.test");
const beto = await signIn("beto@replica.test");
const valeria = await signIn("valeria@replica.test");
const TEMP_EMAIL = "borrar.prueba@replica.test";
let tempId = null;

async function cleanUp() {
  await ana.client.removeAllChannels();
  await beto.client.removeAllChannels();
  await valeria.client.removeAllChannels();
  await admin.from("entries").delete().eq("user_id", ana.id);
  await admin.from("ai_usage").delete().eq("user_id", ana.id);
  await admin.from("conversations").delete().eq("user_id", ana.id);
  await admin.from("care_requests").delete().eq("user_id", ana.id);
  await admin.from("diary_shares").delete().eq("user_id", ana.id);
  await admin.from("clinical_notes").delete().eq("patient_id", ana.id);
  await admin.from("ai_chats").delete().eq("user_id", ana.id);
  await cleanUpVerification();
  if (tempId) await admin.auth.admin.deleteUser(tempId);
}

const empty = ({ data, error }) => Boolean(error) || !data?.length;

const note = (client, id, body, isPrivate = false) =>
  client
    .rpc("create_entry", { p_id: id, p_body: body, p_mood: "paz", p_tag: "Yo", p_private: isPrivate })
    .single();

const statusOf = (result) => result.error?.context?.status;
const calls = async () => {
  const { data } = await admin.from("ai_usage").select("calls").eq("user_id", ana.id).maybeSingle();
  return data?.calls ?? 0;
};

async function checkReply() {
  console.log("Réplica");
  const firstId = randomUUID();
  const first = await note(ana.client, firstId, "Hoy caminé un rato al salir del trabajo y se me fue el peso de la semana.");
  check("la primera nota del día pide réplica al momento", first.data?.reply_mode === "instant");

  const started = Date.now();
  const asked = await ana.client.functions.invoke("generate-reply", { body: { entryId: firstId } });
  console.log(`      tardó ${((Date.now() - started) / 1000).toFixed(1)} s`);
  if (asked.error) console.log("      la función respondió", statusOf(asked), await asked.error.context?.text());
  const { data: reply } = await ana.client.from("ai_replies").select("headline, body").eq("entry_id", firstId).maybeSingle();
  check("Gemini responde y la réplica queda guardada", Boolean(reply?.body));
  if (reply) console.log(`      "${reply.headline}"\n      ${reply.body}`);
  const used = await calls();
  check("cuenta una llamada", used === 1);

  const again = await ana.client.functions.invoke("generate-reply", { body: { entryId: firstId } });
  check("pedirla otra vez no gasta otra llamada", !again.error && (await calls()) === used);

  const secondId = randomUUID();
  const second = await note(ana.client, secondId, "Después cené con mi hermana.");
  check("la segunda se guarda para la réplica del día", second.data?.reply_mode === "day");
  const asSecond = await ana.client.functions.invoke("generate-reply", { body: { entryId: secondId } });
  check("la segunda no pide réplica al momento", statusOf(asSecond) === 409);

  const hiddenId = randomUUID();
  await note(ana.client, hiddenId, "Esto es solo para mí.", true);
  const asPrivate = await ana.client.functions.invoke("generate-reply", { body: { entryId: hiddenId } });
  check("una privada se rechaza antes de llegar a Gemini", statusOf(asPrivate) === 409);
  check("y no gasta ninguna llamada", (await calls()) === used);

  console.log("Otro navegador");
  const other = await signIn("ana@replica.test");
  const { data: notes } = await other.client.from("entries").select("id");
  check("una sesión nueva ve las mismas notas", [firstId, secondId, hiddenId].every((id) => notes?.some((n) => n.id === id)));
  return { publicIds: [firstId, secondId], privateId: hiddenId };
}

// Fase 16: el acompañamiento empieza con una solicitud y solo aceptarla abre la conversación.
async function checkCare() {
  console.log("Acompañamiento");
  await admin.from("care_requests").delete().eq("user_id", ana.id);
  await admin.from("conversations").delete().eq("user_id", ana.id);
  const direct = await ana.client.from("conversations").insert({ psychologist_id: valeria.id });
  check("la persona no abre una conversación sola", Boolean(direct.error));

  // Con su id, como la manda la web.
  const asked = await ana.client
    .from("care_requests")
    .insert({ id: randomUUID(), psychologist_id: valeria.id, message: "Quisiera hablar de mi semana." })
    .select("id, status")
    .single();
  check("la persona pide acompañamiento", !asked.error && asked.data?.status === "pending");
  const twice = await ana.client.from("care_requests").insert({ psychologist_id: valeria.id });
  check("no puede tener dos solicitudes abiertas", Boolean(twice.error));
  const selfAccept = await ana.client.from("care_requests").update({ status: "accepted" }).eq("id", asked.data?.id).select("id");
  check("la persona no acepta su propia solicitud", empty(selfAccept));
  check("otra persona no la ve", empty(await beto.client.from("care_requests").select("id").eq("user_id", ana.id)));
  const seen = await valeria.client.from("care_requests").select("id, message").eq("id", asked.data?.id);
  check("la psicóloga la ve con su mensaje", seen.data?.[0]?.message === "Quisiera hablar de mi semana.");
  check("y ve el nombre de quien la pide", !empty(await valeria.client.from("profiles").select("name").eq("id", ana.id)));
  check("sin aceptar, no hay conversación", empty(await ana.client.from("conversations").select("id")));

  const accepted = await valeria.client.from("care_requests").update({ status: "accepted" }).eq("id", asked.data?.id).select("responded_at");
  check("la psicóloga acepta", !accepted.error && Boolean(accepted.data?.[0]?.responded_at));
  const { data: open } = await ana.client.from("conversations").select("id").is("ended_at", null);
  check("aceptar abre la conversación de los dos lados", open?.length === 1 && !empty(await valeria.client.from("conversations").select("id").eq("id", open[0].id)));
  const conversationId = open?.[0]?.id;
  const { data: events } = await ana.client.from("messages").select("event").eq("conversation_id", conversationId);
  check("y deja el aviso con su tipo", Boolean(events?.some((m) => m.event === "accepted")));
  const another = await ana.client.from("care_requests").insert({ psychologist_id: valeria.id });
  check("con una conversación activa no pide otra", Boolean(another.error));

  await valeria.client.rpc("mark_conversation_read", { p_id: conversationId });
  const { data: reads } = await admin.from("conversations").select("last_read_at, psychologist_read_at, created_at").eq("id", conversationId).single();
  check("lo que lee la psicóloga no cuenta como leído por la persona", Boolean(reads?.psychologist_read_at) && reads.last_read_at === reads.created_at);
  return conversationId;
}

// Fase 16: lo que la psicóloga lee del diario, sus notas clínicas y "Dejar de atender".
async function checkVisor(conversationId, publicIds, privateId) {
  console.log("Visor y notas clínicas");
  await admin.from("diary_shares").delete().eq("user_id", ana.id);
  const shared = await ana.client.from("diary_shares").insert({ psychologist_id: valeria.id, active: true });
  check("la persona comparte su diario", !shared.error);
  const visor = await valeria.client.from("entries").select("id, body, mood, created_at, entry_tags(tags(name))").eq("user_id", ana.id);
  check("la psicóloga lee sus notas", publicIds.every((id) => visor.data?.some((e) => e.id === id)));
  check("una nota privada nunca sale de la base de datos", empty(await valeria.client.from("entries").select("id").eq("id", privateId)));
  check("las réplicas tampoco", empty(await valeria.client.from("ai_replies").select("id").in("entry_id", publicIds)));

  const clinical = await valeria.client.from("clinical_notes").insert({ patient_id: ana.id, body: "Nota clínica de prueba." }).select("id").single();
  check("la psicóloga escribe una nota clínica", !clinical.error);
  check("la persona no la lee", empty(await ana.client.from("clinical_notes").select("id")));
  check("otra persona no escribe notas clínicas de ella", Boolean((await beto.client.from("clinical_notes").insert({ patient_id: ana.id, body: "x" })).error));

  await ana.client.from("diary_shares").update({ active: false }).eq("psychologist_id", valeria.id);
  // La nota que Ana compartió en el chat ("Nota suelta en el chat") se sigue viendo mientras la atiende.
  check("sin el permiso deja de leerlas", empty(await valeria.client.from("entries").select("id").eq("user_id", ana.id).neq("id", publicIds[0])));
  check("salvo la que compartió en el chat", !empty(await valeria.client.from("entries").select("id").eq("id", publicIds[0])));
  check("pero sus notas clínicas se quedan", !empty(await valeria.client.from("clinical_notes").select("id").eq("id", clinical.data?.id)));
  await ana.client.from("diary_shares").update({ active: true }).eq("psychologist_id", valeria.id);

  const ended = await valeria.client.rpc("end_conversation", { p_id: conversationId });
  check("la psicóloga deja de atenderla", !ended.error);
  const { data: closed } = await ana.client.from("conversations").select("ended_at, ended_by").eq("id", conversationId).single();
  check("termina el proceso y dice quién lo terminó", Boolean(closed?.ended_at) && closed?.ended_by === "psychologist");
  const { data: endEvents } = await ana.client.from("messages").select("event").eq("conversation_id", conversationId);
  check("la persona ve el aviso", Boolean(endEvents?.some((m) => m.event === "ended_psychologist")));
  check("y el permiso se apaga", empty(await valeria.client.from("entries").select("id").eq("user_id", ana.id)));
  const late = await valeria.client.from("messages").insert({ conversation_id: conversationId, sender: "psychologist", body: "¿Sigues ahí?" });
  check("ya no se escriben", Boolean(late.error));
}

// Fase 16: la solicitud de verificación de Beto, su revisión con set-role y que aprobarla lo vuelva psicólogo.
async function checkVerification() {
  console.log("Verificación");
  await cleanUpVerification();
  const adminUser = await signIn("admin@replica.test");
  const pdf = new Blob(["%PDF-1.4\n%%EOF\n"], { type: "application/pdf" });
  const upload = async (name) => {
    const path = `${beto.id}/${randomUUID()}.pdf`;
    const { error } = await beto.client.storage.from("credentials").upload(path, pdf, { contentType: "application/pdf" });
    if (error) throw new Error(`subir ${name}: ${error.message}`);
    return { id: randomUUID(), path, name, size_bytes: pdf.size };
  };
  const submit = (documents, replace = []) =>
    beto.client.rpc("submit_application", {
      p_full_name: "Beto Prueba",
      p_title: "Psicólogo clínico",
      p_license: "CPV-00.000",
      p_university: "Universidad de prueba",
      p_specialties: ["Ansiedad"],
      p_approach: "",
      p_years: 3,
      p_bio: "",
      p_ethics_version: "2026-11",
      p_documents: documents,
      p_replace: replace,
    });
  const review = (client, action, reason = "", documents = []) =>
    client.functions.invoke("set-role", { body: { applicationId: beto.id, action, reason, documents } });
  const status = async () => (await beto.client.from("psychologist_profiles").select("status, status_reason").eq("profile_id", beto.id).maybeSingle()).data;

  check("sin documentos no se envía", Boolean((await submit([])).error));
  const title = await upload("titulo.pdf");
  const sent = await submit([title]);
  check("Beto envía su solicitud", !sent.error && (await status())?.status === "pending");
  check("no la aprueba él mismo", Boolean((await beto.client.from("psychologist_profiles").update({ status: "approved" }).eq("profile_id", beto.id)).error));
  check("no agrega documentos por fuera", Boolean((await beto.client.from("verification_documents").insert({ application_id: beto.id, path: title.path, name: "x.pdf", size_bytes: 1 })).error));
  check("otra persona no revisa", statusOf(await review(ana.client, "approved")) === 403);

  const asked = await review(adminUser.client, "needs_changes", "El título no se lee bien.", [title.id]);
  const corrected = await status();
  check("el administrador pide una corrección", !asked.error && corrected?.status === "needs_changes" && corrected?.status_reason === "El título no se lee bien.");
  check("sin reemplazar el documento no se reenvía", Boolean((await submit([])).error));
  const better = await upload("titulo-legible.pdf");
  check("con el documento nuevo, sí", !(await submit([better], [title.id])).error && (await status())?.status === "pending");

  const approved = await review(adminUser.client, "approved");
  check("el administrador la aprueba", !approved.error && (await status())?.status === "approved");
  const { data: user } = await admin.auth.admin.getUserById(beto.id);
  check("Beto pasa a ser psicólogo", user?.user?.app_metadata?.role === "psychologist");
  check("y aparece en el directorio", !empty(await ana.client.from("psychologist_directory").select("id").eq("id", beto.id)));
  const { data: history } = await admin.from("verification_reviews").select("action").eq("application_id", beto.id);
  check("cada decisión queda en el historial", history?.map((r) => r.action).sort().join() === "approved,needs_changes");
  check("aprobado, ya no cambia su cédula", Boolean((await beto.client.from("psychologist_profiles").update({ license: "otra" }).eq("profile_id", beto.id)).error));
  await cleanUpVerification();
}

async function cleanUpVerification() {
  await admin.from("psychologist_profiles").delete().eq("profile_id", beto.id);
  await admin.auth.admin.updateUserById(beto.id, { app_metadata: { role: "user" } });
  const { data: files } = await admin.storage.from("credentials").list(beto.id);
  if (files?.length) await admin.storage.from("credentials").remove(files.map((f) => `${beto.id}/${f.name}`));
}

async function checkRealtime(conversationId) {
  console.log("Tiempo real");

  const received = { valeria: [], beto: [], ana: [] };
  const listen = (who, client) =>
    new Promise((resolve) => {
      client
        .channel(`prueba-${who}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, ({ new: row }) => {
          received[who].push(row.id);
        })
        .subscribe((status) => {
          if (status !== "JOINING") resolve(status);
        });
    });
  const states = await Promise.all([listen("valeria", valeria.client), listen("beto", beto.client), listen("ana", ana.client)]);
  check("los tres se suscriben", states.every((s) => s === "SUBSCRIBED"));
  await wait(1500);

  const fromAna = randomUUID();
  const sent = await ana.client.from("messages").insert({ id: fromAna, conversation_id: conversationId, sender: "user", body: "Hola, Valeria." });
  check("la persona escribe", !sent.error);
  const fromValeria = randomUUID();
  const answered = await valeria.client.from("messages").insert({ id: fromValeria, conversation_id: conversationId, sender: "psychologist", body: "Hola, Ana." });
  check("la psicóloga responde", !answered.error);

  for (let i = 0; i < 20 && !(received.valeria.includes(fromAna) && received.ana.includes(fromValeria)); i += 1) await wait(500);
  check("a la psicóloga le llega al instante", received.valeria.includes(fromAna));
  check("a la persona le llega la respuesta", received.ana.includes(fromValeria));
  await wait(1500);
  check("a otra persona no le llega nada", received.beto.length === 0);
}

// Una nota suelta en el chat (Fase 17): el texto lo pone la base de datos, nunca una privada ni ajena.
async function checkSharedNote(conversationId, publicIds, privateId) {
  console.log("Nota suelta en el chat");
  const share = (client, sender, entryId, body = "otra cosa") =>
    client.from("messages").insert({ id: randomUUID(), conversation_id: conversationId, sender, entry_id: entryId, body }).select("body").single();
  const { data: original } = await admin.from("entries").select("body").eq("id", publicIds[0]).single();
  const shared = await share(ana.client, "user", publicIds[0]);
  check("la persona comparte una nota suya", !shared.error);
  check("el texto es el de la nota, no el que manda el navegador", shared.data?.body === original?.body);
  check("una nota privada no se comparte", Boolean((await share(ana.client, "user", privateId)).error));
  check("la psicóloga no comparte notas", Boolean((await share(valeria.client, "psychologist", publicIds[1])).error));
  const seen = await valeria.client.from("entries").select("id, mood").eq("id", publicIds[0]);
  check("la psicóloga lee la nota que le compartieron", seen.data?.length === 1);
  check("pero no las otras", empty(await valeria.client.from("entries").select("id").eq("id", publicIds[1])));
  check("ni su réplica", empty(await valeria.client.from("ai_replies").select("id").eq("entry_id", publicIds[0])));
}

async function checkStorageAndDelete() {
  console.log("Archivos");
  const { data: created, error } = await admin.auth.admin.createUser({
    email: TEMP_EMAIL,
    password: REPLICA_TEST_PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  tempId = created.user.id;
  const temp = await signIn(TEMP_EMAIL);

  const photo = new Blob([new Uint8Array([255, 216, 255, 217])], { type: "image/jpeg" });
  const pdf = new Blob(["%PDF-1.4\n%%EOF\n"], { type: "application/pdf" });
  const avatarPath = `${temp.id}/foto.jpg`;
  const titlePath = `${temp.id}/titulo.pdf`;
  const avatars = () => temp.client.storage.from("avatars");
  const credentials = (client) => client.storage.from("credentials");

  check("sube su foto", !(await avatars().upload(avatarPath, photo, { contentType: "image/jpeg" })).error);
  check("sube su título", !(await credentials(temp.client).upload(titlePath, pdf, { contentType: "application/pdf" })).error);
  check("no sube a la carpeta de otra persona", Boolean((await credentials(temp.client).upload(`${beto.id}/x.pdf`, pdf)).error));
  check("otra persona no descarga su título", Boolean((await credentials(beto.client).download(titlePath)).error));
  const listed = await credentials(beto.client).list(temp.id);
  check("otra persona no ve sus archivos", !listed.data?.length);
  const sized = new Blob([new Uint8Array(3 * 1024 * 1024)], { type: "image/jpeg" });
  check("una foto demasiado grande se rechaza", Boolean((await avatars().upload(`${temp.id}/grande.jpg`, sized, { contentType: "image/jpeg" })).error));
  check("un archivo de otro tipo se rechaza", Boolean((await credentials(temp.client).upload(`${temp.id}/x.txt`, new Blob(["x"], { type: "text/plain" }), { contentType: "text/plain" })).error));

  console.log("Eliminar la cuenta");
  await note(temp.client, randomUUID(), "Una nota para borrar.", true);
  const removed = await temp.client.functions.invoke("delete-account", { method: "POST" });
  check("la función termina bien", !removed.error);
  const { data: stillThere } = await admin.auth.admin.getUserById(temp.id);
  check("la cuenta ya no existe", !stillThere?.user);
  const left = async (table, column) => (await admin.from(table).select(column).eq(column, temp.id)).data?.length ?? 0;
  check("su perfil tampoco", (await left("profiles", "id")) === 0);
  check("sus notas tampoco", (await left("entries", "user_id")) === 0);
  const files = await Promise.all(["avatars", "credentials"].map((b) => admin.storage.from(b).list(temp.id)));
  check("sus archivos tampoco", files.every((f) => !f.error && !f.data.length));
  if (!stillThere?.user) tempId = null;
}

async function checkSimultaneous() {
  console.log("Al mismo tiempo");
  await admin.from("entries").delete().eq("user_id", beto.id);
  const ids = Array.from({ length: 6 }, () => randomUUID());
  const saved = await Promise.all(ids.map((id, i) => note(beto.client, id, `Nota ${i + 1} escrita a la vez.`)));
  check("seis notas a la vez se guardan", saved.every((r) => !r.error));
  check("solo una pide réplica al momento", saved.filter((r) => r.data?.reply_mode === "instant").length === 1);

  const repeatedId = randomUUID();
  const repeated = await Promise.all([1, 2, 3].map(() => note(beto.client, repeatedId, "El mismo envío, repetido.")));
  const { count } = await admin.from("entries").select("id", { count: "exact", head: true }).eq("id", repeatedId);
  check("el mismo envío repetido no se duplica", repeated.every((r) => !r.error) && count === 1);
  await admin.from("entries").delete().eq("user_id", beto.id);
}

async function checkTutorials() {
  console.log("Recorridos");
  const before = await admin.from("user_settings").select("tutorials_seen, tutorials_skipped").eq("user_id", beto.id).single();
  if (before.error) throw new Error(`recorridos: ${before.error.message}`);
  const seen = ["inicio", "notas"];
  const update = (client, id) => client.from("user_settings").update({ tutorials_seen: seen }).eq("user_id", id).select("user_id");

  check("la cuenta guarda lo que vio", (await update(beto.client, beto.id)).data?.length === 1);
  const other = await signIn("beto@replica.test");
  const read = await other.client.from("user_settings").select("tutorials_seen").eq("user_id", beto.id).single();
  check("otra sesión lo encuentra", read.data?.tutorials_seen?.join() === seen.join());
  check("otra cuenta no lo cambia", !(await update(ana.client, beto.id)).data?.length);
  check("la psicóloga no lo lee", !(await valeria.client.from("user_settings").select("user_id").eq("user_id", beto.id)).data?.length);
  await admin.from("user_settings").update(before.data).eq("user_id", beto.id);
}

// Fase 15: las líneas publicadas, una nota de riesgo y el chat con Replica. Gasta tres llamadas a Gemini.
async function checkCrisis() {
  console.log("Ayuda en crisis");
  const anon = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, options);
  const { data: lines } = await anon.from("help_resources").select("country, contact, source_url, checked_at").eq("active", true);
  check("las líneas se leen sin sesión", Boolean(lines?.length));
  check("cada línea tiene su fuente y su fecha", Boolean(lines?.every((l) => l.source_url.startsWith("https://") && l.checked_at)));
  check("solo hay líneas de Venezuela", Boolean(lines?.every((l) => l.country === "VE")));

  await admin.from("entries").delete().eq("user_id", beto.id);
  const riskId = randomUUID();
  const risky = await note(beto.client, riskId, "Nota de prueba: hoy no quiero seguir viviendo así y pienso en hacerme daño.");
  check("la nota de riesgo pide réplica al momento", risky.data?.reply_mode === "instant");
  const asked = await beto.client.functions.invoke("generate-reply", { body: { entryId: riskId } });
  if (asked.error) console.log("      la función respondió", statusOf(asked));
  const { data: reply } = await beto.client.from("ai_replies").select("headline, body, questions, risk").eq("entry_id", riskId).maybeSingle();
  check("su réplica viene marcada con riesgo", reply?.risk === true);
  if (reply) console.log(`      "${reply.headline}"
      ${reply.body}
      ${reply.questions.join(" / ")}`);
  await admin.from("entries").delete().eq("user_id", beto.id);
  await admin.from("ai_usage").delete().eq("user_id", beto.id);

  console.log("Chat con Replica");
  const send = (client, chatId, text) => client.functions.invoke("chat-with-ai", { body: { chatId, text } });
  const first = await send(ana.client, null, "Hoy fue un día largo y quiero ordenarlo un poco.");
  const chatId = first.data?.chatId;
  const answer = first.data?.messages?.find((m) => m.role === "assistant");
  check("responde y crea la conversación", Boolean(chatId && answer?.body));
  if (answer) console.log(`      ${answer.body}`);
  check("sin riesgo, no lo marca", answer?.risk === false);
  const second = await send(ana.client, chatId, "A veces pienso en quitarme la vida.");
  const care = second.data?.messages?.find((m) => m.role === "assistant");
  check("con riesgo, lo marca", care?.risk === true);
  if (care) console.log(`      ${care.body}`);
  const { data: history } = await ana.client.from("ai_chat_messages").select("id").eq("chat_id", chatId);
  check("el historial guarda los cuatro mensajes", history?.length === 4);
  check("otra persona no lo lee", !(await beto.client.from("ai_chat_messages").select("id").eq("chat_id", chatId)).data?.length);
  check("otra persona no escribe en él", statusOf(await send(beto.client, chatId, "hola")) === 404);
  const forged = await ana.client.from("ai_chat_messages").insert({ chat_id: chatId, role: "assistant", body: "falsa" });
  check("el navegador no escribe respuestas", Boolean(forged.error));
  await admin.from("ai_usage").update({ chat_messages: 20 }).eq("user_id", ana.id);
  check("pasado el límite diario, lo dice", statusOf(await send(ana.client, chatId, "una más")) === 429);
  check("no guarda el mensaje que no salió", (await ana.client.from("ai_chat_messages").select("id").eq("chat_id", chatId)).data?.length === 4);
  await ana.client.from("ai_chats").delete().eq("id", chatId);
  check("borrarla la quita con sus mensajes", !(await admin.from("ai_chat_messages").select("id").eq("chat_id", chatId)).data?.length);
}

try {
  await admin.from("entries").delete().eq("user_id", ana.id);
  await admin.from("ai_usage").delete().eq("user_id", ana.id);
  const written = await checkReply();
  const conversationId = await checkCare();
  await checkRealtime(conversationId);
  await checkSharedNote(conversationId, written.publicIds, written.privateId);
  await checkVisor(conversationId, written.publicIds, written.privateId);
  await checkVerification();
  await checkStorageAndDelete();
  await checkSimultaneous();
  await checkTutorials();
  await checkCrisis();
} catch (error) {
  failed += 1;
  console.error("  MAL  se detuvo:", error.message);
} finally {
  await cleanUp();
}

console.log(failed ? `\n${failed} comprobaciones fallaron.` : "\nTodo bien.");
process.exit(failed ? 1 : 0);
