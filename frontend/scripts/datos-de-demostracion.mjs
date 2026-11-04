// Carga los datos de la demostración en el proyecto de Supabase: el diario de Lucía (unos tres meses,
// con sus réplicas), su proceso con Valeria, otras personas en el panel de la psicóloga y solicitudes
// de verificación en cada estado para el panel de administración. Todo es ficticio y solo usa cuentas
// @replica.test. Se puede correr varias veces: borra lo que dejó la vez anterior y lo vuelve a crear,
// con las fechas contadas desde hoy. No toca a ana@ ni a beto@, que usan las pruebas.
//   npm run demo   (antes, `npm run cuentas`, que crea admin@ y valeria@)
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { DAYS } from "./demo/diario-lucia.mjs";

const { SUPABASE_URL, SUPABASE_SECRET_KEY, REPLICA_TEST_PASSWORD } = process.env;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !REPLICA_TEST_PASSWORD) {
  console.error("Faltan variables en supabase/.env (supabase/README.md).");
  process.exit(1);
}

const TERMS_VERSION = "2026-11";
const ETHICS_VERSION = "2026-11";
const TIMEZONE = "America/Caracas";
const OFFSET = "-04:00"; // Caracas no cambia de hora.
const MEET = "https://meet.google.com/rpl-demo-val";

const admin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function must({ data, error }, what) {
  if (error) throw new Error(`${what}: ${error.message}`);
  return data;
}

// El día de hoy en Caracas, y cualquier hora de un día contado hacia atrás desde hoy.
const todayCaracas = new Date(Date.now() - 4 * 3_600_000).toISOString().slice(0, 10);
function dayAgo(ago) {
  const d = new Date(`${todayCaracas}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ago);
  return d.toISOString().slice(0, 10);
}
function at(ago, time) {
  return new Date(`${dayAgo(ago)}T${time}:00${OFFSET}`).toISOString();
}
function later(iso, minutes) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

// Cuentas ---------------------------------------------------------------------------------------------

const PEOPLE = {
  lucia: { email: "lucia@replica.test", name: "Lucía Méndez", role: "user" },
  mateo: { email: "mateo@replica.test", name: "Mateo Rivas", role: "user" },
  camila: { email: "camila@replica.test", name: "Camila Torres", role: "user" },
  daniel: { email: "daniel@replica.test", name: "Daniel Rojas", role: "psychologist" },
  andres: { email: "andres@replica.test", name: "Andrés Salazar", role: "user" },
  carolina: { email: "carolina@replica.test", name: "Carolina Pérez", role: "user" },
  sofia: { email: "sofia@replica.test", name: "Sofía Paredes", role: "user" },
  julian: { email: "julian@replica.test", name: "Julián Ortega", role: "user" },
};

const { data: listed, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
if (listError) throw listError;
const byEmail = (email) => listed.users.find((u) => u.email === email);

const valeria = byEmail("valeria@replica.test");
const adminUser = byEmail("admin@replica.test");
if (!valeria || !adminUser) {
  console.error("Faltan admin@ o valeria@replica.test: corre antes `npm run cuentas`.");
  process.exit(1);
}

const ids = {};
for (const [key, person] of Object.entries(PEOPLE)) {
  const found = byEmail(person.email);
  const { data, error } = found
    ? await admin.auth.admin.updateUserById(found.id, { app_metadata: { role: person.role } })
    : await admin.auth.admin.createUser({
        email: person.email,
        password: REPLICA_TEST_PASSWORD,
        email_confirm: true,
        app_metadata: { role: person.role },
      });
  if (error) throw error;
  ids[key] = data.user.id;
  const now = new Date().toISOString();
  must(
    await admin
      .from("profiles")
      .update({ name: person.name, terms_version: TERMS_VERSION, terms_accepted_at: now, setup_done_at: now })
      .eq("id", ids[key]),
    `perfil de ${person.email}`
  );
  must(await admin.from("user_settings").update({ timezone: TIMEZONE }).eq("user_id", ids[key]), `ajustes de ${person.email}`);
}

// Lo de la vez anterior -------------------------------------------------------------------------------

const persons = [ids.lucia, ids.mateo, ids.camila];
const applicants = [ids.daniel, ids.andres, ids.carolina, ids.sofia, ids.julian];
for (const table of ["entries", "day_replies", "saved_phrases", "ai_usage", "ai_chats", "conversations", "care_requests", "diary_shares"]) {
  must(await admin.from(table).delete().in("user_id", persons), `borrar ${table}`);
}
must(await admin.from("clinical_notes").delete().in("patient_id", persons), "borrar notas clínicas");
must(await admin.from("psychologist_profiles").delete().in("profile_id", applicants), "borrar solicitudes");
for (const id of applicants) {
  const { data: files } = await admin.storage.from("credentials").list(id);
  if (files?.length) await admin.storage.from("credentials").remove(files.map((f) => `${id}/${f.name}`));
}

// El diario de Lucía ----------------------------------------------------------------------------------

const tagRows = must(await admin.from("tags").select("id, name"), "temas");
const tagId = Object.fromEntries(tagRows.map((t) => [t.name, t.id]));

must(
  await admin
    .from("profiles")
    .update({ intention: "Entender por qué me canso tanto.", created_at: at(93, "21:00") })
    .eq("id", ids.lucia),
  "intención de Lucía"
);
must(await admin.from("user_settings").update({ reply_tone: "suave", day_reply_hour: 22 }).eq("user_id", ids.lucia), "ajustes de Lucía");

let notes = 0;
let replies = 0;
let dayReplies = 0;
let sharedEntry = null;
const savedReplies = [];

for (const day of [...DAYS].sort((a, b) => b.ago - a.ago)) {
  const written = [];
  for (const note of day.notes) {
    const id = randomUUID();
    const createdAt = at(day.ago, note.at);
    const entry = must(
      await admin
        .from("entries")
        .insert({
          id,
          user_id: ids.lucia,
          body: note.text,
          mood: note.mood,
          reply_mode: note.private ? "private" : "day",
          is_favorite: !!note.favorite,
          created_at: createdAt,
        })
        .select("id, reply_mode")
        .single(),
      "nota"
    );
    must(await admin.from("entry_tags").insert({ entry_id: id, tag_id: tagId[note.tag] }), "tema de la nota");
    notes += 1;
    // El servidor decide qué nota recibe la réplica al momento: el diario tiene que coincidir.
    if (!!note.reply !== (entry.reply_mode === "instant")) {
      throw new Error(`La nota de hace ${day.ago} días a las ${note.at} quedó como ${entry.reply_mode}.`);
    }
    if (note.reply) {
      const [headline, body, questions, learning] = note.reply;
      const reply = must(
        await admin
          .from("ai_replies")
          .insert({ entry_id: id, headline, body, questions, learning, created_at: later(createdAt, 1) })
          .select("id")
          .single(),
        "réplica"
      );
      replies += 1;
      if (note.saved) savedReplies.push({ reply_id: reply.id, saved_at: later(createdAt, 5) });
    }
    if (note.sharedInChat) sharedEntry = { id, createdAt };
    if (!note.private) written.push({ id, createdAt });
  }

  if (day.day) {
    const [headline, body, questions, learning, comments] = day.day;
    if (comments.length !== written.length) throw new Error(`La réplica del día de hace ${day.ago} días no comenta cada nota.`);
    const reply = must(
      await admin
        .from("day_replies")
        .insert({
          user_id: ids.lucia,
          day: dayAgo(day.ago),
          kind: "day",
          headline,
          body,
          questions,
          learning,
          entry_ids: written.map((n) => n.id),
          created_at: later(written.at(-1).createdAt, 15),
        })
        .select("id")
        .single(),
      "réplica del día"
    );
    must(
      await admin
        .from("day_reply_comments")
        .insert(written.map((n, i) => ({ day_reply_id: reply.id, entry_id: n.id, comment: comments[i] }))),
      "comentarios de la réplica del día"
    );
    dayReplies += 1;
  }
}

// El cofre: réplicas guardadas y dos frases de la biblioteca.
must(await admin.from("saved_phrases").insert(savedReplies.map((s) => ({ user_id: ids.lucia, ...s }))), "réplicas guardadas");
await admin.from("saved_phrases").insert([
  { user_id: ids.lucia, daily_phrase_id: "a01", saved_at: at(40, "08:00") },
  { user_id: ids.lucia, daily_phrase_id: "a02", saved_at: at(11, "08:30") },
]);

// Una conversación con Replica antes de la presentación.
const chatId = randomUUID();
must(await admin.from("ai_chats").insert({ id: chatId, user_id: ids.lucia, title: "Antes de la presentación", created_at: at(8, "22:00") }), "chat con Replica");
must(
  await admin.from("ai_chat_messages").insert([
    { chat_id: chatId, role: "user", body: "En unos días presento resultados ante gerencia y ya me estoy poniendo nerviosa.", created_at: at(8, "22:00") },
    {
      chat_id: chatId,
      role: "assistant",
      body: "Lucía, es normal que una presentación importante te mueva así. Faltan unos días, así que no tienes que resolverlo todo esta noche. ¿Qué parte te preocupa más: hablar frente a gerencia o los números en sí?",
      created_at: at(8, "22:01"),
    },
    { chat_id: chatId, role: "user", body: "Hablar. Los números los sé de memoria. Me da miedo quedarme en blanco.", created_at: at(8, "22:03") },
    {
      chat_id: chatId,
      role: "assistant",
      body: "Entonces lo que sabes ya está contigo; el miedo es a perder el hilo en el momento. Quedarse en blanco unos segundos le pasa a cualquiera, y se puede volver a una nota o a la siguiente cifra. ¿Qué te ayudaría a sentir que tienes de dónde agarrarte si pasa?",
      created_at: at(8, "22:04"),
    },
  ]),
  "mensajes del chat con Replica"
);

// La agenda y el perfil de Valeria ---------------------------------------------------------------------

must(
  await admin
    .from("psychologist_profiles")
    .update({
      title: "Psicóloga clínica",
      university: "Universidad Católica Andrés Bello",
      specialties: ["Ansiedad", "Autoestima", "Estrés laboral"],
      approach: "Terapia cognitivo-conductual",
      years_experience: 9,
      bio: "Acompaño a personas que sienten que el trabajo o las exigencias les están ganando la partida. Trabajo con calma, desde lo que cada quien trae, y con tareas pequeñas entre sesiones.",
      meet_link: MEET,
      availability: { days: [1, 2, 3, 4], from: "15:00", to: "19:00", minutes: 50 },
    })
    .eq("profile_id", valeria.id),
  "perfil de Valeria"
);

// Un acompañamiento que empieza como en la web: la solicitud, el sí de la psicóloga y, con él, la
// conversación y su aviso. Después se le ponen las fechas de la historia.
async function startCare(userId, message, askedAt, acceptedAt) {
  const request = must(
    await admin.from("care_requests").insert({ user_id: userId, psychologist_id: valeria.id, message }).select("id").single(),
    "solicitud de acompañamiento"
  );
  must(await admin.from("care_requests").update({ status: "accepted" }).eq("id", request.id), "aceptar la solicitud");
  must(await admin.from("care_requests").update({ created_at: askedAt, responded_at: acceptedAt }).eq("id", request.id), "fechas de la solicitud");
  const conversation = must(
    await admin.from("conversations").select("id").eq("user_id", userId).eq("psychologist_id", valeria.id).single(),
    "conversación"
  );
  must(
    await admin.from("conversations").update({ created_at: acceptedAt, last_read_at: new Date().toISOString(), psychologist_read_at: new Date().toISOString() }).eq("id", conversation.id),
    "fechas de la conversación"
  );
  await stampEvent(conversation.id, "accepted", acceptedAt);
  return conversation.id;
}

async function stampEvent(conversationId, event, iso) {
  must(await admin.from("messages").update({ created_at: iso }).eq("conversation_id", conversationId).eq("event", event), `fecha del aviso ${event}`);
}

async function shareDiary(userId, conversationId, iso) {
  must(await admin.from("diary_shares").insert({ user_id: userId, psychologist_id: valeria.id, active: true }), "compartir el diario");
  must(await admin.from("diary_shares").update({ changed_at: iso }).eq("user_id", userId).eq("psychologist_id", valeria.id), "fecha del permiso");
  await stampEvent(conversationId, "share_on", iso);
}

async function say(conversationId, sender, body, iso, entryId) {
  must(
    await admin.from("messages").insert({ conversation_id: conversationId, sender, body, created_at: iso, entry_id: entryId ?? null }),
    "mensaje"
  );
}

async function schedule(conversationId, startsAt, createdAt, cancelledAt) {
  const appointment = must(
    await admin
      .from("appointments")
      .insert({ conversation_id: conversationId, starts_at: startsAt, meet_link: MEET, duration_minutes: 50, created_at: createdAt, cancelled_at: cancelledAt ?? null })
      .select("id")
      .single(),
    "sesión"
  );
  must(await admin.from("messages").update({ created_at: createdAt }).eq("appointment_id", appointment.id), "fecha de la sesión en el chat");
}

async function clinical(patientId, body, iso) {
  must(
    await admin.from("clinical_notes").insert({ psychologist_id: valeria.id, patient_id: patientId, body, created_at: iso, updated_at: iso }),
    "nota clínica"
  );
}

// Camila: un proceso que ya terminó, para la lista de "Terminados".
const camilaChat = await startCare(
  ids.camila,
  "Hola, Valeria. Me mudé de ciudad hace poco y me está costando adaptarme. Me gustaría hablar con alguien.",
  at(76, "20:10"),
  at(75, "09:30")
);
await say(camilaChat, "psychologist", "Hola, Camila. Gracias por escribirme. Con gusto te acompaño. ¿Te queda bien el jueves en la tarde?", at(75, "09:35"));
await say(camilaChat, "user", "Sí, perfecto. Gracias.", at(75, "10:02"));
await schedule(camilaChat, at(72, "16:00"), at(75, "10:05"));
await schedule(camilaChat, at(65, "16:00"), at(72, "17:00"));
await schedule(camilaChat, at(58, "16:00"), at(65, "17:00"));
await say(camilaChat, "user", "Valeria, ya me siento mucho mejor instalada. Creo que por ahora puedo seguir sola. Gracias por todo.", at(47, "19:20"));
await say(camilaChat, "psychologist", "Me alegra mucho leerlo, Camila. Fue un gusto acompañarte. Si algún día lo necesitas, aquí estaré.", at(47, "20:05"));
must(await admin.from("conversations").update({ ended_at: at(46, "09:00"), ended_by: "user" }).eq("id", camilaChat), "terminar el proceso de Camila");
await stampEvent(camilaChat, "ended_user", at(46, "09:00"));
await clinical(ids.camila, "Motivo: dificultad de adaptación tras mudanza. Red de apoyo reducida en la ciudad nueva. Buena respuesta a la planificación de actividades semanales.", at(72, "17:10"));
await clinical(ids.camila, "Cierre acordado por la paciente. Mayor sensación de pertenencia; retomó contacto con dos amistades. Se deja la puerta abierta.", at(47, "20:10"));

// Lucía: el proceso en curso, con el diario compartido.
const luciaChat = await startCare(
  ids.lucia,
  "Hola, Valeria. Leí tu perfil y me identifiqué con lo de estrés laboral. Últimamente me cuesta descansar y siento que todo es urgente. Me gustaría intentarlo.",
  at(29, "21:20"),
  at(28, "09:40")
);
await say(luciaChat, "psychologist", "Hola, Lucía. Gracias por escribirme. Me alegra que hayas dado este paso. ¿Te parece si tenemos una primera sesión en dos días, a las 6 p. m.?", at(28, "09:45"));
await say(luciaChat, "user", "Hola, Valeria. Sí, me queda perfecto. Estoy un poco nerviosa, nunca había ido a terapia.", at(28, "10:02"));
await say(luciaChat, "psychologist", "Es normal sentirse así. La primera sesión es para conocernos, sin apuro. Te dejo la sesión agendada.", at(28, "10:10"));
await schedule(luciaChat, at(26, "18:00"), at(28, "10:11"));
await shareDiary(ids.lucia, luciaChat, at(25, "20:10"));
await say(luciaChat, "user", "Te compartí mi diario. Las notas privadas no, pero lo demás sí.", at(25, "20:12"));
await say(luciaChat, "psychologist", "Gracias por la confianza, Lucía. Lo voy a leer con cuidado antes de cada sesión.", at(25, "21:00"));
await schedule(luciaChat, at(19, "18:00"), at(26, "19:05"));
await say(luciaChat, "user", "Llegó un correo de mi jefe a las nueve y no lo abrí. Me sudan las manos, pero lo estoy sosteniendo.", at(19, "21:30"));
await say(luciaChat, "psychologist", "Eso que estás haciendo es justo la práctica. Nota la incomodidad sin juzgarla. Mañana me cuentas qué pasó.", at(19, "21:50"));
if (sharedEntry) await say(luciaChat, "user", "", later(sharedEntry.createdAt, 10), sharedEntry.id);
await say(luciaChat, "psychologist", "Qué buen hallazgo. Guárdalo para la próxima vez que algo parezca urgente.", at(18, "12:00"));
await schedule(luciaChat, at(12, "18:30"), at(19, "19:00"));
await say(luciaChat, "user", "Valeria, tengo gripe. ¿Podemos mantener la sesión de la próxima semana igual?", at(10, "08:00"));
await say(luciaChat, "psychologist", "Claro, Lucía. Descansa. La mantenemos.", at(10, "09:15"));
await schedule(luciaChat, at(5, "18:00"), at(12, "19:30"));
await schedule(luciaChat, at(-2, "18:00"), at(5, "19:10"));
await say(luciaChat, "user", "Me inscribí en cerámica. Pensé que te gustaría saberlo.", at(3, "19:00"));
await say(luciaChat, "psychologist", "Me encanta, Lucía. Es justo lo que hablamos: algo solo por placer.", at(3, "19:40"));
await clinical(ids.lucia, "Primera sesión. Motivo: agotamiento sostenido y dificultad para poner límites en el trabajo. Aparece el rol de \"la responsable\" en la familia de origen. Buena disposición. Acordamos explorar actividades por placer.", at(26, "19:00"));
await clinical(ids.lucia, "Trabajamos límites. Propuesta: no responder correos después de las 19 h. Ansiedad anticipatoria, con buena capacidad de reflexión.", at(19, "19:00"));
await clinical(ids.lucia, "Sostuvo el límite de los correos. Más presencia con su pareja. Aparece ternura hacia sí misma al releer notas antiguas.", at(12, "19:30"));
await clinical(ids.lucia, "Proyección a futuro: más tiempo personal y taller de cerámica. Revisar el cansancio en los cierres de mes.", at(5, "19:00"));

// Mateo: una solicitud que espera respuesta en el panel.
const mateoRequest = must(
  await admin
    .from("care_requests")
    .insert({
      user_id: ids.mateo,
      psychologist_id: valeria.id,
      message: "Hola, Valeria. Estoy en el último año de la universidad y la tesis me tiene sin dormir. Quisiera hablar con alguien antes de que se haga más grande.",
    })
    .select("id")
    .single(),
  "solicitud de Mateo"
);
must(await admin.from("care_requests").update({ created_at: new Date(Date.now() - 3 * 3_600_000).toISOString() }).eq("id", mateoRequest.id), "fecha de la solicitud de Mateo");

// Solicitudes de verificación --------------------------------------------------------------------------

// Un PDF de una página que dice qué es: lo bastante para verlo en el expediente.
function pdf(lines) {
  const text = lines
    .map((line, i) => `BT /F1 ${i === 0 ? 16 : 12} Tf 72 ${720 - i * 26} Td (${line.replace(/[()\\]/g, "\\$&")}) Tj ET`)
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(text, "latin1")} >>\nstream\n${text}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  ];
  let body = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((object, i) => {
    offsets.push(Buffer.byteLength(body, "latin1"));
    body += `${i + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(body, "latin1");
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(body, "latin1");
}

async function document(applicantId, name, kind, fullName, iso, replaced = false) {
  const id = randomUUID();
  const path = `${applicantId}/${id}.pdf`;
  const file = pdf([kind, fullName, "Documento de prueba de Replica.", "No corresponde a ninguna persona real."]);
  const { error } = await admin.storage.from("credentials").upload(path, file, { contentType: "application/pdf", upsert: true });
  if (error) throw new Error(`subir ${name}: ${error.message}`);
  must(
    await admin
      .from("verification_documents")
      .insert({ id, application_id: applicantId, path, name, size_bytes: file.length, mime_type: "application/pdf", replaced, created_at: iso }),
    "documento"
  );
  return id;
}

async function review(applicantId, action, reason, iso, documents = []) {
  must(
    await admin.from("verification_reviews").insert({ application_id: applicantId, admin_id: adminUser.id, action, reason, documents, created_at: iso }),
    "revisión"
  );
}

const APPLICATIONS = [
  {
    key: "daniel",
    title: "Psicólogo clínico",
    license: "N.º 21.457",
    university: "Universidad Central de Venezuela",
    specialties: ["Duelo", "Relaciones de pareja", "Autoestima"],
    approach: "Terapia humanista",
    years: 6,
    bio: "Acompaño procesos de duelo y de cambios en la pareja. Me importa que cada sesión sea un lugar donde se pueda hablar sin apuro.",
    submitted: 38,
  },
  {
    key: "andres",
    title: "Psicólogo",
    license: "N.º 30.118",
    university: "Universidad de Carabobo",
    specialties: ["Ansiedad", "Estudiantes universitarios"],
    approach: "Terapia cognitivo-conductual",
    years: 3,
    bio: "Trabajo sobre todo con jóvenes y estudiantes que sienten que la exigencia los desborda.",
    submitted: 1,
  },
  {
    key: "carolina",
    title: "Psicóloga clínica",
    license: "N.º 18.902",
    university: "Universidad del Zulia",
    specialties: ["Maternidad", "Estrés laboral"],
    approach: "Terapia sistémica",
    years: 11,
    bio: "Acompaño a madres y padres que buscan equilibrar el trabajo y la crianza.",
    submitted: 3,
  },
  {
    key: "sofia",
    title: "Psicóloga",
    license: "N.º 27.634",
    university: "Universidad de Los Andes",
    specialties: ["Autoestima", "Ansiedad"],
    approach: "Terapia de aceptación y compromiso",
    years: 4,
    bio: "Me interesa ayudar a las personas a relacionarse de otra manera con lo que sienten.",
    submitted: 6,
  },
  {
    key: "julian",
    title: "Psicólogo",
    license: "N.º 99.001",
    university: "Universidad Santa María",
    specialties: ["Adicciones"],
    approach: "Entrevista motivacional",
    years: 2,
    bio: "Acompaño procesos de cambio de hábitos.",
    submitted: 12,
  },
];

for (const a of APPLICATIONS) {
  const id = ids[a.key];
  const fullName = PEOPLE[a.key].name;
  const submittedAt = at(a.submitted, "16:20");
  must(
    await admin.from("psychologist_profiles").insert({
      profile_id: id,
      full_name: fullName,
      title: a.title,
      license: a.license,
      university: a.university,
      specialties: a.specialties,
      approach: a.approach,
      years_experience: a.years,
      bio: a.bio,
      status: "pending",
      submitted_at: submittedAt,
      ethics_accepted_at: submittedAt,
      ethics_version: ETHICS_VERSION,
    }),
    `solicitud de ${fullName}`
  );
  const titulo = await document(id, "titulo-psicologia.pdf", "Título de Licenciatura en Psicología", fullName, submittedAt, a.key === "daniel");
  const colegiatura = await document(id, "colegiatura.pdf", "Constancia de colegiatura", fullName, submittedAt, a.key === "daniel");

  if (a.key === "daniel") {
    // Pidió una corrección, la subsanó y quedó aprobado: el historial completo.
    await review(id, "needs_changes", "Los dos documentos se ven borrosos. Súbelos de nuevo, por favor.", at(36, "10:00"), [titulo, colegiatura]);
    await document(id, "titulo-psicologia.pdf", "Título de Licenciatura en Psicología", fullName, at(35, "18:00"));
    await document(id, "colegiatura.pdf", "Constancia de colegiatura", fullName, at(35, "18:00"));
    await review(id, "approved", null, at(33, "11:30"));
    must(
      await admin
        .from("psychologist_profiles")
        .update({
          status: "approved",
          verified_at: at(33, "11:30"),
          submitted_at: at(35, "18:00"),
          meet_link: "https://meet.google.com/rpl-demo-dan",
          availability: { days: [2, 4, 6], from: "09:00", to: "13:00", minutes: 50 },
        })
        .eq("profile_id", id),
      "aprobar a Daniel"
    );
  }
  if (a.key === "sofia") {
    await review(id, "needs_changes", "El título no muestra la fecha de egreso. Sube una copia completa, por favor.", at(4, "11:15"), [titulo]);
    must(
      await admin
        .from("psychologist_profiles")
        .update({ status: "needs_changes", status_reason: "El título no muestra la fecha de egreso. Sube una copia completa, por favor." })
        .eq("profile_id", id),
      "corrección de Sofía"
    );
  }
  if (a.key === "julian") {
    const reason = "El número de colegiatura no coincide con el registro del Colegio de Psicólogos.";
    await review(id, "rejected", reason, at(10, "15:40"));
    must(await admin.from("psychologist_profiles").update({ status: "rejected", status_reason: reason }).eq("profile_id", id), "rechazo de Julián");
  }
}

console.log(`Lucía: ${notes} notas, ${replies} réplicas al momento y ${dayReplies} réplicas del día, de hace ${DAYS[0].ago} días a ayer.`);
console.log("Valeria: Lucía en proceso con el diario compartido, Camila terminada y la solicitud de Mateo pendiente.");
console.log("Administración: 2 solicitudes pendientes, 1 con corrección pedida, 1 rechazada y 1 aprobada.");
console.log(`Las cuentas nuevas usan la contraseña de REPLICA_TEST_PASSWORD: ${Object.values(PEOPLE).map((p) => p.email).join(", ")}.`);
