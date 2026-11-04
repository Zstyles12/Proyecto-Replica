// Crea las cuentas de prueba en el proyecto de Supabase: un administrador, una psicóloga aprobada y dos
// personas. Se puede correr varias veces. Lo corre la persona responsable (supabase/README.md):
//   node --env-file=../supabase/.env scripts/cuentas-de-prueba.mjs
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SECRET_KEY, REPLICA_TEST_PASSWORD } = process.env;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !REPLICA_TEST_PASSWORD) {
  console.error("Faltan variables en supabase/.env (supabase/README.md).");
  process.exit(1);
}

const TERMS_VERSION = "2026-11";
const ACCOUNTS = [
  { email: "admin@replica.test", name: "Administración", role: "admin" },
  { email: "valeria@replica.test", name: "Valeria Rondón", role: "psychologist" },
  { email: "ana@replica.test", name: "Ana Prueba", role: "user" },
  { email: "beto@replica.test", name: "Beto Prueba", role: "user" },
];

const admin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existing, error: listError } = await admin.auth.admin.listUsers();
if (listError) throw listError;

for (const account of ACCOUNTS) {
  const found = existing.users.find((u) => u.email === account.email);
  const { data, error } = found
    ? await admin.auth.admin.updateUserById(found.id, { app_metadata: { role: account.role } })
    : await admin.auth.admin.createUser({
        email: account.email,
        password: REPLICA_TEST_PASSWORD,
        email_confirm: true,
        app_metadata: { role: account.role },
      });
  if (error) throw error;

  const now = new Date().toISOString();
  const { error: profileError } = await admin
    .from("profiles")
    .update({ name: account.name, terms_version: TERMS_VERSION, terms_accepted_at: now, setup_done_at: now })
    .eq("id", data.user.id);
  if (profileError) throw profileError;

  if (account.role === "psychologist") {
    const { error: psychologistError } = await admin.from("psychologist_profiles").upsert({
      profile_id: data.user.id,
      full_name: account.name,
      title: "Psicóloga clínica",
      license: "N.º 14.382",
      specialties: ["Ansiedad", "Autoestima", "Estrés laboral"],
      approach: "Terapia cognitivo-conductual",
      years_experience: 9,
      bio: "Cuenta de prueba.",
      status: "approved",
      verified_at: now,
    });
    if (psychologistError) throw psychologistError;
  }
  console.log(found ? "ya estaba" : "creada", account.email, account.role);
}
