import { dataService } from "../../services/data";
import { hasBackend } from "../../lib/supabase/client";
import { registerServiceWorker, serviceWorkerSupported } from "../../lib/serviceWorker";
import { readString, writeString } from "../../lib/storage";
import { getProfile, updateProfile } from "../profile/store";
import { getNotes, notesToday } from "../journal/store";

// El recordatorio diario (RF-53, DESIGN-WEB.md §11). Con Supabase lo manda el servidor por Web Push a
// cada navegador suscrito (send-reminders). Sin él, la propia web lo muestra si está abierta a esa hora.

// La clave pública VAPID del servidor. No es un secreto: el navegador la necesita para suscribirse.
const VAPID = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
// Simulado: el día en que ya se mostró, para mostrarlo una sola vez.
const SHOWN_KEY = "replica.reminder.shown";
export const NOTICE = { title: "Replica", body: "Tu hoja está aquí, si quieres escribir hoy." };

// Si el ajuste se puede ofrecer: el navegador tiene Web Push y, con servidor, está su clave pública.
export function reminderSupported() {
  if (!serviceWorkerSupported() || typeof Notification === "undefined") return false;
  if (!hasBackend) return true;
  return "PushManager" in window && !!VAPID;
}

export function notificationsDenied() {
  return typeof Notification !== "undefined" && Notification.permission === "denied";
}

function keyBytes(base64url: string) {
  const padded = `${base64url}${"=".repeat((4 - (base64url.length % 4)) % 4)}`.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

async function subscription(create: boolean) {
  const registration = await registerServiceWorker();
  if (!registration || !("pushManager" in registration)) return null;
  const current = await registration.pushManager.getSubscription();
  if (current || !create || !VAPID) return current;
  return registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID) });
}

export type ReminderResult = "ok" | "denied" | "error";

export const reminder = {
  // Pide el permiso en este momento, nunca antes, y suscribe este navegador.
  async enable(time: string): Promise<ReminderResult> {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return "denied";
      if (dataService) {
        const sub = await subscription(true);
        if (!sub) return "error";
        await dataService.setReminder({ subscription: JSON.stringify(sub), time });
      } else {
        await registerServiceWorker();
      }
      updateProfile({ reminderEnabled: true, reminderTime: time });
      return "ok";
    } catch {
      return "error";
    }
  },

  async setTime(time: string): Promise<ReminderResult> {
    const previous = getProfile().reminderTime;
    updateProfile({ reminderTime: time });
    if (!dataService) return "ok";
    try {
      const sub = await subscription(true);
      if (!sub) throw new Error("Sin suscripción");
      await dataService.setReminder({ subscription: JSON.stringify(sub), time });
      return "ok";
    } catch {
      updateProfile({ reminderTime: previous });
      return "error";
    }
  },

  // Apagarlo lo apaga en la cuenta y borra la suscripción de este navegador.
  async disable(): Promise<ReminderResult> {
    try {
      const sub = await subscription(false);
      if (dataService) await dataService.setReminder(null, sub ? JSON.stringify(sub) : undefined);
      await sub?.unsubscribe();
      updateProfile({ reminderEnabled: false });
      return "ok";
    } catch {
      return "error";
    }
  },

  // Al cerrar sesión: este navegador deja de recibir los avisos de la cuenta que sale.
  async forgetBrowser() {
    try {
      const sub = await subscription(false);
      if (sub && dataService) await dataService.setReminder(null, JSON.stringify(sub)).catch(() => {});
      await sub?.unsubscribe();
    } catch {
      // Sin Service Worker no había suscripción.
    }
  },
};

// Sin servidor: a la hora elegida, si la web está abierta y hoy aún no se escribió, el aviso lo
// muestra el Service Worker. Una vez al día, dentro de la hora siguiente, como el servidor.
function localCheck() {
  const profile = getProfile();
  if (!profile.reminderEnabled || typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const now = new Date();
  const [h, m] = profile.reminderTime.split(":").map(Number);
  const at = new Date(now);
  at.setHours(h, m, 0, 0);
  const elapsed = now.getTime() - at.getTime();
  const today = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  if (elapsed < 0 || elapsed >= 3_600_000 || readString(SHOWN_KEY) === today) return;
  if (notesToday(getNotes()).length) return;
  writeString(SHOWN_KEY, today);
  void registerServiceWorker().then((r) =>
    r?.showNotification(NOTICE.title, { body: NOTICE.body, icon: "/icon-192.png", tag: "replica-recordatorio", data: { url: "/" } })
  );
}

if (!hasBackend && typeof window !== "undefined") setInterval(localCheck, 30_000);
