// Borra la cuenta de quien llama y todo lo suyo. Las tablas se van en cascada desde auth.users; los
// archivos no, así que salen primero.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { adminClient, callerOf, json, preflight } from "../_shared/server.ts";

const BUCKETS = ["avatars", "credentials"];
const PAGE = 100;

async function removeFiles(admin: SupabaseClient, bucket: string, folder: string) {
  while (true) {
    const { data, error } = await admin.storage.from(bucket).list(folder, { limit: PAGE });
    if (error) throw new Error(error.message);
    if (!data.length) return;
    const { error: removeError } = await admin.storage.from(bucket).remove(data.map((f) => `${folder}/${f.name}`));
    if (removeError) throw new Error(removeError.message);
  }
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const admin = adminClient();
  const user = await callerOf(req, admin);
  if (!user) return json({ error: "auth" }, 401);

  try {
    for (const bucket of BUCKETS) await removeFiles(admin, bucket, user.id);
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw new Error(error.message);
  } catch (e) {
    console.error("delete-account: falló", String(e));
    return json({ error: "delete" }, 500);
  }
  return json({ deleted: true });
});
