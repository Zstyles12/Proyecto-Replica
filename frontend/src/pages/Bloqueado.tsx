import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { ReplicaMark } from "../components/brand/Logo";
import { Button } from "../components/ui/Button";
import { lock, useLockConfig } from "../lib/lock";
import { sessionActions, useAccount } from "../lib/session";

type From = { from?: string };

/**
 * /bloqueado (RF-52, DESIGN-WEB.md §11): con el bloqueo puesto, cualquier ruta lleva aquí y, al
 * desbloquear, vuelve a donde estaba. Nada del diario se ve detrás.
 */
export const Bloqueado: React.FC = () => {
  const account = useAccount();
  const email = account?.email ?? "";
  const config = useLockConfig(email);
  const pinId = useId();
  const errorId = useId();
  const [pin, setPin] = useState("");
  const [wrong, setWrong] = useState(false);
  const [checking, setChecking] = useState(false);
  const [waitLeft, setWaitLeft] = useState(() => lock.waitLeft(email));
  const inputRef = useRef<HTMLInputElement>(null);

  // La cuenta atrás de la espera, en segundos. Al terminar, el foco vuelve al campo.
  const waiting = waitLeft > 0;
  useEffect(() => {
    if (!waiting) {
      inputRef.current?.focus();
      return;
    }
    const t = setInterval(() => setWaitLeft(lock.waitLeft(email)), 1000);
    return () => clearInterval(t);
  }, [waiting, email]);

  const withPasskey = useCallback(async () => {
    if (await lock.checkPasskey(email)) lock.unlock();
  }, [email]);

  // La llave de acceso se ofrece sola al abrir.
  const passkey = config?.passkey ?? false;
  useEffect(() => {
    if (passkey) void withPasskey();
  }, [passkey, withPasskey]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin || checking || waitLeft > 0) return;
    setChecking(true);
    const ok = await lock.checkPin(email, pin);
    setChecking(false);
    if (ok) {
      lock.unlock();
      return;
    }
    setPin("");
    setWrong(true);
    setWaitLeft(lock.waitLeft(email));
  };

  const seconds = Math.ceil(waitLeft / 1000);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-[400px] space-y-6 text-center">
        <ReplicaMark size={36} className="mx-auto" />
        <h1 className="font-replica text-[26px] font-normal leading-8 text-foreground">Replica está bloqueada</h1>
        <form onSubmit={(e) => void submit(e)} className="space-y-3 text-left" noValidate>
          <label htmlFor={pinId} className="block text-[13px] text-muted-foreground">
            Tu PIN
          </label>
          <input
            ref={inputRef}
            id={pinId}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            value={pin}
            disabled={waitLeft > 0}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ""));
              setWrong(false);
            }}
            aria-invalid={wrong || undefined}
            aria-describedby={wrong || waitLeft > 0 ? errorId : undefined}
            className="h-12 w-full rounded-md border border-border/70 bg-surface-raised px-4 text-center text-base tracking-[0.4em] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice disabled:opacity-60"
          />
          {waitLeft > 0 ? (
            <p id={errorId} role="alert" className="text-[13px] text-emotion">
              Demasiados intentos. Espera {seconds} {seconds === 1 ? "segundo" : "segundos"} para volver a probar.
            </p>
          ) : wrong ? (
            <p id={errorId} role="alert" className="text-[13px] text-emotion">
              Ese no es tu PIN.
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={!pin || checking || waitLeft > 0}>
            Entrar
          </Button>
          {passkey ? (
            <Button type="button" variant="secondary" className="w-full" icon={<KeyRound size={16} aria-hidden="true" />} onClick={() => void withPasskey()}>
              Usar la llave de acceso
            </Button>
          ) : null}
        </form>
        <div className="space-y-2 pt-4">
          <p className="text-[13px] leading-[18px] text-muted-foreground">¿Olvidaste tu PIN? Cierra sesión y vuelve a entrar con tu cuenta.</p>
          <Button variant="ghost" size="sm" className="h-11" onClick={() => void sessionActions.signOut()}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </main>
  );
};

/** Cualquier ruta, con el bloqueo puesto: a /bloqueado, recordando dónde estaba. */
export const ToLock: React.FC = () => {
  const location = useLocation();
  return <Navigate to="/bloqueado" replace state={{ from: `${location.pathname}${location.search}` } satisfies From} />;
};

/** /bloqueado ya desbloqueado: de vuelta a donde estaba. */
export const FromLock: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as From | null)?.from;
  useEffect(() => {
    navigate(from && from !== "/bloqueado" ? from : "/", { replace: true });
  }, [from, navigate]);
  return null;
};
