// El recordatorio diario (RF-53). La llama solo el trabajo programado (migración funciones_restantes),
// con su secreto. A cada persona que le toca le llega un aviso suave en cada navegador suscrito.
import { Buffer } from "node:buffer";
import { timingSafeEqual } from "node:crypto";
import webpush from "npm:web-push@3.6.7";
import { adminClient, json } from "../_shared/server.ts";

// Sin números, sin rachas y sin culpa (DESIGN-WEB.md §11).
const NOTICE = { title: "Replica", body: "Tu hoja está aquí, si quieres escribir hoy.", url: "/" };

type Due = { user_id: string; day: string };
type Token = { id: string; token: string };

function authorized(req: Request) {
  const expected = Deno.env.get("CRON_SECRET");
  const given = req.headers.get("x-cron-secret");
  if (!expected || !given) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!authorized(req)) return json({ error: "auth" }, 401);

  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const subject = Deno.env.get("VAPID_SUBJECT");
  if (!publicKey || !privateKey || !subject) return json({ error: "vapid" }, 500);
  webpush.setVapidDetails(subject, publicKey, privateKey);

  const admin = adminClient();
  const { data: due, error } = await admin.rpc("due_reminders", { p_limit: 200 });
  if (error) return json({ error: error.message }, 500);

  let sent = 0;
  for (const { user_id, day } of (due ?? []) as Due[]) {
    const { data: tokens } = await admin.from("push_tokens").select("id, token").eq("user_id", user_id);
    let delivered = false;
    for (const { id, token } of (tokens ?? []) as Token[]) {
      try {
        await webpush.sendNotification(JSON.parse(token), JSON.stringify(NOTICE), { TTL: 3600 });
        delivered = true;
      } catch (e) {
        // El navegador ya no tiene esa suscripción: se borra para no insistir.
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) await admin.from("push_tokens").delete().eq("id", id);
      }
    }
    // Uno por día: aunque ningún navegador lo reciba, no se vuelve a intentar hasta mañana.
    await admin.from("user_settings").update({ reminder_sent_on: day }).eq("user_id", user_id);
    if (delivered) sent += 1;
  }
  return json({ due: (due ?? []).length, sent });
});
