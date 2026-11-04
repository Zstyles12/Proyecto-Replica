import React, { useEffect, useId, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Dialog } from "../../components/ui/Dialog";
import { Segmented } from "../../components/ui/Segmented";
import { isValidPin, LOCK_MINUTES, lock, passkeyAvailable, useLockConfig, type LockMinutes } from "../../lib/lock";
import { useAccount } from "../../lib/session";
import { SettingRow } from "../profile/components/SettingsCard";

const MINUTE_OPTIONS = LOCK_MINUTES.map((m) => ({ value: m, label: `${m} min` }));
const HONEST = "El bloqueo protege el acceso desde este navegador. Tus notas siguen en tu cuenta y no se cifran.";

const PIN_INPUT =
  "h-11 w-full rounded-md border border-border/70 bg-surface-raised px-3 text-base tracking-[0.3em] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice aria-[invalid=true]:border-emotion";

function PinField({
  id,
  label,
  value,
  onChange,
  error,
  autoFocus,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  autoFocus?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-[13px] text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={6}
        value={value}
        data-autofocus={autoFocus || undefined}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={PIN_INPUT}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[13px] text-emotion">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Activar el bloqueo: el PIN dos veces, cuándo pedirlo y, si existe, la llave de acceso. */
function EnableDialog({ open, onClose, email }: { open: boolean; onClose: () => void; email: string }) {
  const pinId = useId();
  const repeatId = useId();
  const [pin, setPin] = useState("");
  const [repeat, setRepeat] = useState("");
  const [minutes, setMinutes] = useState<LockMinutes>(5);
  const [canPasskey, setCanPasskey] = useState(false);
  const [usePasskey, setUsePasskey] = useState(false);
  const [errors, setErrors] = useState<{ pin?: string; repeat?: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void passkeyAvailable().then(setCanPasskey);
  }, []);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPin("");
      setRepeat("");
      setMinutes(5);
      setUsePasskey(false);
      setErrors({});
    }
  }

  const save = async () => {
    const next: typeof errors = {};
    if (!isValidPin(pin)) next.pin = "El PIN tiene de 4 a 6 números.";
    else if (pin !== repeat) next.repeat = "Los dos PIN no coinciden.";
    setErrors(next);
    if (next.pin || next.repeat) return;
    setSaving(true);
    await lock.enable(email, pin, minutes, canPasskey && usePasskey);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Bloqueo en este navegador"
      description="Replica te pedirá el PIN al abrirla aquí."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => void save()} disabled={saving}>
            Activar
          </Button>
        </>
      }
    >
      <form
        className="space-y-5"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <PinField id={pinId} label="Elige un PIN de 4 a 6 números" value={pin} onChange={setPin} error={errors.pin} autoFocus />
        <PinField id={repeatId} label="Repítelo" value={repeat} onChange={setRepeat} error={errors.repeat} />
        <div className="space-y-2">
          <p className="text-[13px] text-muted-foreground" aria-hidden="true">
            ¿Cuándo lo pedimos? Siempre al abrir, y tras este tiempo sin usar Replica:
          </p>
          <Segmented label="Pedir el PIN tras este tiempo sin usar Replica" options={MINUTE_OPTIONS} value={minutes} onChange={setMinutes} className="w-full" />
        </div>
        {canPasskey ? (
          <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[15px] leading-[21px] text-foreground">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--voice)]"
              checked={usePasskey}
              onChange={(e) => setUsePasskey(e.target.checked)}
            />
            Usar también la llave de acceso de este dispositivo (huella, rostro o el bloqueo del equipo)
          </label>
        ) : null}
        <p className="text-[13px] leading-[18px] text-muted-foreground">{HONEST}</p>
        <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
      </form>
    </Dialog>
  );
}

/** Desactivar pide el PIN, o la llave de acceso. */
function DisableDialog({ open, onClose, email, passkey }: { open: boolean; onClose: () => void; email: string; passkey: boolean }) {
  const pinId = useId();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setPin("");
      setError(null);
    }
  }

  const confirm = async () => {
    if (await lock.checkPin(email, pin)) {
      lock.disable(email);
      onClose();
      return;
    }
    const wait = lock.waitLeft(email);
    setError(wait > 0 ? `Demasiados intentos. Espera ${Math.ceil(wait / 1000)} segundos.` : "Ese no es tu PIN.");
    setPin("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Desactivar el bloqueo"
      description="Escribe tu PIN para quitar el bloqueo de este navegador."
      footer={
        <>
          {passkey ? (
            <Button
              variant="ghost"
              onClick={() =>
                void lock.checkPasskey(email).then((ok) => {
                  if (!ok) return;
                  lock.disable(email);
                  onClose();
                })
              }
            >
              Usar la llave de acceso
            </Button>
          ) : null}
          <Button onClick={() => void confirm()} disabled={!pin}>
            Desactivar
          </Button>
        </>
      }
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (pin) void confirm();
        }}
      >
        <PinField id={pinId} label="Tu PIN" value={pin} onChange={setPin} error={error} autoFocus />
      </form>
    </Dialog>
  );
}

/** La fila de Usuario → Tu espacio privado (DESIGN-WEB.md §11). */
export const LockSettings: React.FC = () => {
  const account = useAccount();
  const email = account?.email ?? "";
  const config = useLockConfig(email);
  const [enabling, setEnabling] = useState(false);
  const [disabling, setDisabling] = useState(false);
  // El bloqueo usa WebCrypto, que el navegador da solo en conexiones seguras.
  if (!email || typeof crypto === "undefined" || !crypto.subtle) return null;

  return (
    <>
      <SettingRow
        icon={LockKeyhole}
        title="Bloqueo en este navegador"
        subtitle={config ? (config.passkey ? "Con PIN y llave de acceso" : "Con PIN") : "Pide un PIN al abrir Replica aquí"}
        right={
          config ? (
            <button
              type="button"
              onClick={() => setDisabling(true)}
              className="min-h-11 shrink-0 rounded-full bg-muted px-3 text-[13px] font-semibold text-foreground hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
            >
              Desactivar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEnabling(true)}
              className="min-h-11 shrink-0 rounded-full bg-voice px-4 text-[13px] font-semibold text-voice-foreground hover:bg-voice/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2"
            >
              Activar
            </button>
          )
        }
      />
      {config ? (
        <div className="space-y-2 px-1">
          <p className="text-[13px] text-muted-foreground" aria-hidden="true">
            Pedirlo tras este tiempo sin usar Replica
          </p>
          <Segmented
            label="Pedir el PIN tras este tiempo sin usar Replica"
            options={MINUTE_OPTIONS}
            value={config.minutes}
            onChange={(m) => lock.setMinutes(email, m)}
            className="w-full"
          />
        </div>
      ) : null}
      <EnableDialog open={enabling} onClose={() => setEnabling(false)} email={email} />
      <DisableDialog open={disabling} onClose={() => setDisabling(false)} email={email} passkey={config?.passkey ?? false} />
    </>
  );
};
