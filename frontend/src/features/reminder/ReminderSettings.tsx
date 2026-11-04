import React, { useId, useState } from "react";
import { BellRing } from "lucide-react";
import { SettingRow } from "../profile/components/SettingsCard";
import { useProfile } from "../profile/store";
import { notificationsDenied, reminder, reminderSupported } from "./store";

/**
 * Recordatorio diario (RF-53, DESIGN-WEB.md §11): un interruptor y la hora. Pide el permiso del
 * navegador al encenderlo. Si el navegador no tiene Web Push, la fila no aparece.
 */
export const ReminderSettings: React.FC = () => {
  const profile = useProfile();
  const timeId = useId();
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);
  const [failed, setFailed] = useState(false);
  if (!reminderSupported()) return null;
  const on = profile.reminderEnabled;

  const toggle = async () => {
    setBusy(true);
    setFailed(false);
    const result = on ? await reminder.disable() : await reminder.enable(profile.reminderTime);
    setBusy(false);
    setDenied(result === "denied");
    setFailed(result === "error");
  };

  return (
    <div className="space-y-2">
      <SettingRow
        icon={BellRing}
        title="Recordatorio diario"
        subtitle="Un aviso suave a la hora que elijas, solo si ese día aún no escribiste."
        right={
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label="Recordatorio diario"
            disabled={busy}
            onClick={() => void toggle()}
            className="flex h-11 shrink-0 items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2 disabled:opacity-60"
          >
            <span className={`relative block h-7 w-12 rounded-full p-0.5 transition-colors duration-small ${on ? "bg-voice" : "bg-muted"}`}>
              <span
                aria-hidden="true"
                className={`block h-6 w-6 rounded-full bg-surface-raised shadow-xs transition-transform duration-small ease-out motion-reduce:transition-none ${
                  on ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </span>
          </button>
        }
      />
      {on ? (
        <div className="flex items-center justify-between gap-3 px-1">
          <label htmlFor={timeId} className="text-[13px] text-muted-foreground">
            Hora del recordatorio
          </label>
          <input
            id={timeId}
            type="time"
            value={profile.reminderTime}
            onChange={(e) => {
              if (!e.target.value) return;
              void reminder.setTime(e.target.value).then((r) => setFailed(r === "error"));
            }}
            className="h-11 rounded-md border border-border/70 bg-surface-raised px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
          />
        </div>
      ) : null}
      {denied || (!on && notificationsDenied()) ? (
        <p className="px-1 text-[13px] leading-[18px] text-muted-foreground">
          Tu navegador no permite avisos de Replica. Puedes cambiarlo en los ajustes del sitio.
        </p>
      ) : null}
      {failed ? (
        <p role="alert" className="px-1 text-[13px] text-emotion">
          No pudimos cambiar el recordatorio. Revisa tu conexión e inténtalo otra vez.
        </p>
      ) : null}
    </div>
  );
};
