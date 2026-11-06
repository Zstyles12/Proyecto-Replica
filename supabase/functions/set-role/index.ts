// La decisión del administrador sobre una solicitud de verificación (docs/DESIGN-WEB.md §10): la guarda en
// el historial, cambia el estado y, al aprobar, le da a la persona el rol de psicóloga en app_metadata,
// que es de donde lo leen las reglas de acceso. Retirar la verificación hace lo contrario: termina sus
// acompañamientos (revoke_verification) y le quita el rol. Solo la llama un administrador.
import { adminClient, callerOf, json, preflight } from "../_shared/server.ts";

const ACTIONS = new Set(["approved", "needs_changes", "rejected", "revoked"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Body = { applicationId?: unknown; action?: unknown; reason?: unknown; documents?: unknown };

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const admin = adminClient();
  const user = await callerOf(req, admin);
  if (!user) return json({ error: "auth" }, 401);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: "body" }, 400);
  }
  const { applicationId, action, reason, documents } = body;
  if (typeof applicationId !== "string" || !UUID.test(applicationId) || typeof action !== "string" || !ACTIONS.has(action)) {
    return json({ error: "body" }, 400);
  }
  const documentIds = Array.isArray(documents) ? documents.filter((d): d is string => typeof d === "string" && UUID.test(d)) : [];

  // La base de datos comprueba que quien llama es administrador y que la solicitud sigue pendiente.
  const { data: status, error } =
    action === "revoked"
      ? await admin.rpc("revoke_verification", {
          p_admin: user.id,
          p_application: applicationId,
          p_reason: typeof reason === "string" ? reason : null,
        })
      : await admin.rpc("review_application", {
          p_admin: user.id,
          p_application: applicationId,
          p_action: action,
          p_reason: typeof reason === "string" ? reason : null,
          p_documents: documentIds,
        });
  if (error) {
    const code = { "42501": 403, P0002: 404, "22023": 409 }[error.code ?? ""] ?? 500;
    if (code === 500) console.error("set-role: falló la revisión", error.message);
    return json({ error: "review" }, code);
  }

  if (status === "approved") {
    // Un administrador que también atiende no pierde su rol.
    const { data: profile } = await admin.from("profiles").select("role").eq("id", applicationId).single();
    if (profile?.role === "user") {
      const { error: roleError } = await admin.auth.admin.updateUserById(applicationId, { app_metadata: { role: "psychologist" } });
      if (roleError) {
        // La aprobación ya quedó: repetirla solo vuelve a poner el rol.
        console.error("set-role: falló el rol", roleError.message);
        return json({ error: "role" }, 500);
      }
    }
  }
  if (status === "revoked") {
    // Un administrador que también atendía sigue siendo administrador.
    const { data: profile } = await admin.from("profiles").select("role").eq("id", applicationId).single();
    if (profile?.role === "psychologist") {
      const { error: roleError } = await admin.auth.admin.updateUserById(applicationId, { app_metadata: { role: "user" } });
      if (roleError) {
        // Retirarla de nuevo solo vuelve a quitar el rol.
        console.error("set-role: falló quitar el rol", roleError.message);
        return json({ error: "role" }, 500);
      }
    }
  }
  return json({ status });
});
