import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

export function preflight(req: Request) {
  return req.method === "OPTIONS" ? new Response("ok", { headers: CORS }) : null;
}

// La clave secreta del proyecto. Los proyectos nuevos la traen en SUPABASE_SECRET_KEYS (un JSON con
// nombres) y los anteriores en SUPABASE_SERVICE_ROLE_KEY.
function secretKey() {
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS");
  const key = keys ? (JSON.parse(keys) as Record<string, string>).default : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) throw new Error("Falta la clave secreta del proyecto");
  return key;
}

// Salta las reglas de acceso: cada consulta con este cliente filtra por persona a mano.
export function adminClient(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, secretKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Quién llama, según su token. Sin token válido, nadie.
export async function callerOf(req: Request, admin: SupabaseClient): Promise<User | null> {
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  return error ? null : data.user;
}
