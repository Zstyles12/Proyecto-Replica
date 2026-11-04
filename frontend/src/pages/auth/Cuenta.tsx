import React, { useCallback, useEffect, useId, useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, LoaderCircle, Mail } from "lucide-react";
import { AuthScaffold } from "../../features/auth/components/AuthScaffold";
import { CODE_LENGTH, CodeInput } from "../../features/auth/components/CodeInput";
import { GoogleIcon } from "../../components/common/GoogleIcon";
import { Button } from "../../components/ui/Button";
import { authService, MIN_PASSWORD } from "../../services/auth";
import { sessionActions, TEST_TOOLS } from "../../lib/session";

// Cuenta: entrar, correo, contraseña y código. Mismo camino y mismos textos que la app
// (app/(auth)/entrar, correo, contrasena y codigo). El correo pasa de una pantalla a otra en el estado
// del router, no en la dirección: así no queda en el historial del navegador.

type Modo = "crear" | "entrar";
type PasswordModo = "crear" | "entrar" | "nueva";
type FlowState = { email?: string; modo?: PasswordModo | "recuperar" };

const inputClass =
  "h-14 w-full rounded-md border bg-surface px-4 text-[18px] text-foreground placeholder:text-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-voice/40";

function useFlowState() {
  return (useLocation().state ?? {}) as FlowState;
}

// ─── Entrar ──────────────────────────────────────────────────────────────────

export const Entrar: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const modo: Modo = params.get("modo") === "entrar" ? "entrar" : "crear";
  const returning = modo === "entrar";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  const withGoogle = async () => {
    setError(false);
    setPending(true);
    const result = await authService.signInWithProvider("google", returning ? "entrar" : "crear");
    setPending(false);
    if (result.ok) sessionActions.signIn(result.account);
    else if (result.error !== "cancelled") setError(true);
  };

  const providerClass =
    "flex h-12 w-full items-center justify-center gap-2.5 rounded-full px-5 text-base font-semibold transition-all duration-small active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50";

  return (
    <AuthScaffold
      onBack={() => navigate("/bienvenida")}
      title={returning ? "Qué bueno verte de nuevo" : "Tu diario, solo tuyo"}
      subtitle={
        returning
          ? "Entra con la misma cuenta que usaste la primera vez."
          : "Crea tu cuenta para guardar tus notas y retomarlas en cualquier dispositivo."
      }
    >
      <div className="space-y-3">
        <button
          type="button"
          disabled={pending}
          onClick={withGoogle}
          className={`${providerClass} border border-border bg-surface-raised text-foreground hover:bg-surface`}
        >
          {pending ? <LoaderCircle size={19} className="animate-spin" aria-hidden="true" /> : <GoogleIcon className="h-[18px] w-[18px]" />}
          Continuar con Google
        </button>

        <div className="flex items-center gap-3 py-2" aria-hidden="true">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[13px] text-muted-foreground">o</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          disabled={pending}
          onClick={() => navigate("/correo", { state: { modo } })}
          className={`${providerClass} bg-muted text-foreground hover:bg-muted/80`}
        >
          <Mail size={19} aria-hidden="true" />
          Continuar con tu correo
        </button>

        {error ? (
          <p role="alert" className="pt-2 text-center text-[13px] text-emotion">
            No pudimos conectar. Revisa tu conexión e inténtalo otra vez.
          </p>
        ) : null}

        <p className="pt-4 text-center text-[13px] leading-[18px] text-muted-foreground">
          Con tu correo y una contraseña. Te enviamos un código para confirmar que el correo es tuyo.
        </p>
      </div>
    </AuthScaffold>
  );
};

// ─── Correo ──────────────────────────────────────────────────────────────────

// Suficiente para atrapar errores de tipeo; la verificación real es el código al crear la cuenta.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const Correo: React.FC = () => {
  const navigate = useNavigate();
  const { modo } = useFlowState();
  const errorId = useId();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const clean = email.trim();
  const valid = EMAIL.test(clean);
  const showInvalid = touched && clean.length > 0 && !valid;

  const next = () => {
    setTouched(true);
    if (!valid) return;
    navigate("/contrasena", { state: { email: clean.toLowerCase(), modo: modo === "entrar" ? "entrar" : "crear" } });
  };

  return (
    <AuthScaffold
      onBack={() => navigate(-1)}
      title="¿Cuál es tu correo?"
      subtitle={modo === "entrar" ? "El correo con el que creaste tu cuenta." : "Con tu correo y una contraseña entrarás a tu diario."}
      primary={{ label: "Continuar", onPress: next, disabled: !valid }}
    >
      <div className="space-y-2">
        <label htmlFor="auth-email" className="sr-only">
          Correo electrónico
        </label>
        <input
          id="auth-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          autoFocus
          placeholder="tu@correo.com"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={showInvalid || undefined}
          aria-describedby={showInvalid ? errorId : undefined}
          className={`${inputClass} ${showInvalid ? "border-emotion" : "border-border"}`}
        />
        {showInvalid ? (
          <p id={errorId} role="alert" className="px-1 text-[13px] text-emotion">
            Revisa el correo: parece que falta algo.
          </p>
        ) : null}
      </div>
    </AuthScaffold>
  );
};

// ─── Contraseña ──────────────────────────────────────────────────────────────

const PASSWORD_COPY: Record<PasswordModo, { title: string; action: string }> = {
  crear: { title: "Crea una contraseña", action: "Continuar" },
  entrar: { title: "Escribe tu contraseña", action: "Entrar" },
  nueva: { title: "Crea una contraseña nueva", action: "Guardar y entrar" },
};

export const Contrasena: React.FC = () => {
  const navigate = useNavigate();
  const { email, modo: rawModo } = useFlowState();
  const modo: PasswordModo = rawModo === "entrar" || rawModo === "nueva" ? rawModo : "crear";
  const hintId = useId();
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);

  if (!email) return <Navigate to="/correo" replace />;

  const creating = modo !== "entrar";
  const long = password.length >= MIN_PASSWORD;
  const copy = PASSWORD_COPY[modo];

  const submit = async () => {
    if (!long || working) return;
    setError(null);
    setWorking(true);
    if (modo === "crear") {
      const result = await authService.signUp(email, password);
      setWorking(false);
      if (!result.ok) {
        setError(
          result.error === "email-taken"
            ? 'Ese correo ya tiene una cuenta. Vuelve atrás y elige "Ya tengo cuenta".'
            : "No pudimos crear la cuenta. Revisa tu conexión e inténtalo otra vez."
        );
        return;
      }
      navigate("/codigo", { state: { email, modo: "crear" } });
      return;
    }
    if (modo === "entrar") {
      const result = await authService.signInWithPassword(email, password);
      setWorking(false);
      if (!result.ok) {
        // Creó la cuenta y nunca confirmó el correo: se retoma donde quedó.
        if (result.error === "unconfirmed" && (await authService.sendCode(email, "signup")).ok) {
          navigate("/codigo", { state: { email, modo: "crear" } });
          return;
        }
        setError(
          result.error === "wrong-password"
            ? "Esa contraseña no coincide. Inténtalo otra vez o recupérala con un código."
            : "No pudimos entrar. Revisa tu conexión e inténtalo otra vez."
        );
        return;
      }
      // La sesión decide a dónde sigue: consentimiento y configuración, o directo a la app.
      sessionActions.signIn(result.account);
      return;
    }
    const updated = await authService.updatePassword(email, password);
    if (!updated.ok) {
      setWorking(false);
      setError("No pudimos guardarla. Revisa tu conexión e inténtalo otra vez.");
      return;
    }
    const signedIn = await authService.signInWithPassword(email, password);
    setWorking(false);
    if (!signedIn.ok) {
      setError("No pudimos entrar. Revisa tu conexión e inténtalo otra vez.");
      return;
    }
    sessionActions.signIn(signedIn.account);
  };

  // Olvidaste la contraseña: un código al correo y, con él, una nueva.
  const recover = async () => {
    if (recovering) return;
    setRecovering(true);
    const result = await authService.sendCode(email, "recovery");
    setRecovering(false);
    if (!result.ok) {
      setError("No pudimos enviar el código. Revisa tu conexión e inténtalo otra vez.");
      return;
    }
    navigate("/codigo", { state: { email, modo: "recuperar" } });
  };

  const remaining = MIN_PASSWORD - password.length;

  return (
    <AuthScaffold
      onBack={() => navigate(-1)}
      title={copy.title}
      subtitle={
        modo === "entrar" ? (
          <p className="text-[15px] leading-[21px] text-muted-foreground">
            De tu cuenta <span className="font-semibold text-foreground">{email}</span>
          </p>
        ) : modo === "crear" ? (
          `Al menos ${MIN_PASSWORD} caracteres. Después te enviamos un código para confirmar tu correo.`
        ) : (
          `Al menos ${MIN_PASSWORD} caracteres. Con ella entrarás a tu diario desde ahora.`
        )
      }
      primary={{ label: working ? "Un momento…" : copy.action, onPress: submit, disabled: !long, loading: working }}
      secondary={modo === "entrar" ? { label: recovering ? "Enviando…" : "¿Olvidaste tu contraseña?", onPress: recover } : undefined}
    >
      <div className="space-y-2">
        {/* Para que el navegador asocie la contraseña con el correo y la guarde. */}
        <input type="email" name="email" value={email} autoComplete="username" readOnly hidden />
        <div
          className={`flex h-14 items-center rounded-md border bg-surface pl-4 pr-1 transition-colors focus-within:ring-2 focus-within:ring-voice/40 ${
            error ? "border-emotion" : "border-border"
          }`}
        >
          <label htmlFor="auth-password" className="sr-only">
            Contraseña
          </label>
          <input
            id="auth-password"
            type={visible ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            autoFocus
            placeholder="Contraseña"
            autoComplete={creating ? "new-password" : "current-password"}
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={!!error || undefined}
            aria-describedby={hintId}
            className="h-14 min-w-0 flex-1 bg-transparent text-[18px] text-foreground placeholder:text-subtle focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar la contraseña" : "Mostrar la contraseña"}
            aria-pressed={visible}
            className="flex h-12 w-12 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
          >
            {visible ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        </div>
        <div id={hintId} aria-live="polite">
          {error ? (
            <p role="alert" className="px-1 text-[13px] text-emotion">
              {error}
            </p>
          ) : creating ? (
            <p className="px-1 text-[13px] text-muted-foreground">
              {long ? "Lista." : remaining === 1 ? "Falta 1 carácter." : `Faltan ${remaining} caracteres.`}
            </p>
          ) : null}
        </div>
        {TEST_TOOLS && modo === "entrar" ? (
          <p className="px-1 text-xs text-muted-foreground">
            Solo en desarrollo: cualquier contraseña de {MIN_PASSWORD} o más entra; "equivocada" simula una incorrecta.
          </p>
        ) : null}
      </div>
    </AuthScaffold>
  );
};

// ─── Código ──────────────────────────────────────────────────────────────────

// Espera antes de poder pedir otro código (Supabase también limita los envíos).
const RESEND_SECONDS = 60;
type CodeStatus = "idle" | "verifying" | "wrong" | "failed";

export const Codigo: React.FC = () => {
  const navigate = useNavigate();
  const { email, modo } = useFlowState();
  const recovering = modo === "recuperar";
  const statusId = useId();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<CodeStatus>("idle");
  const [errorKey, setErrorKey] = useState(0);
  const [wait, setWait] = useState(RESEND_SECONDS);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const verify = useCallback(
    async (value: string) => {
      if (!email) return;
      setStatus("verifying");
      const result = await authService.verifyCode(email, value, recovering ? "recovery" : "signup");
      if (result.ok) {
        if (recovering) {
          navigate("/contrasena", { replace: true, state: { email, modo: "nueva" } });
          return;
        }
        sessionActions.signIn(result.account);
        return;
      }
      setStatus(result.error === "invalid-code" || result.error === "expired-code" ? "wrong" : "failed");
      setErrorKey((k) => k + 1);
      setCode("");
    },
    [email, recovering, navigate]
  );

  if (!email) return <Navigate to="/correo" replace />;

  // Con el sexto dígito se verifica solo: no hace falta tocar un botón.
  const onChange = (value: string) => {
    if (status === "wrong" || status === "failed") setStatus("idle");
    setCode(value);
    if (value.length === CODE_LENGTH) verify(value);
  };

  const resend = async () => {
    setWait(RESEND_SECONDS);
    setResent(false);
    const result = await authService.sendCode(email, recovering ? "recovery" : "signup");
    if (result.ok) setResent(true);
  };

  const minutes = Math.floor(wait / 60);
  const seconds = String(wait % 60).padStart(2, "0");

  return (
    <AuthScaffold
      onBack={() => navigate(-1)}
      title={recovering ? "Recupera tu contraseña" : "Confirma tu correo"}
      subtitle={
        <p className="text-[15px] leading-[21px] text-muted-foreground">
          Escribe el código que enviamos a <span className="font-semibold text-foreground">{email}</span>
        </p>
      }
    >
      <div className="space-y-4">
        <CodeInput
          value={code}
          onChange={onChange}
          errorKey={errorKey}
          error={status === "wrong"}
          disabled={status === "verifying"}
          describedBy={statusId}
        />

        <div id={statusId} className="flex min-h-6 items-center justify-center gap-2" aria-live="polite">
          {status === "verifying" ? (
            <>
              <LoaderCircle size={16} className="animate-spin text-voice" aria-hidden="true" />
              <span className="text-[13px] text-muted-foreground">Verificando…</span>
            </>
          ) : status === "wrong" ? (
            <p role="alert" className="text-center text-[13px] text-emotion">
              Ese código no coincide. Revisa el último correo que te enviamos.
            </p>
          ) : status === "failed" ? (
            <p role="alert" className="text-center text-[13px] text-emotion">
              No pudimos verificarlo. Revisa tu conexión e inténtalo otra vez.
            </p>
          ) : resent ? (
            <p className="text-center text-[13px] text-voice">Te enviamos un código nuevo.</p>
          ) : null}
        </div>

        <div className="flex flex-col items-center gap-1 pt-2">
          <Button type="button" variant="ghost" disabled={wait > 0} onClick={resend}>
            {wait > 0 ? `Reenviar código en ${minutes}:${seconds}` : "Reenviar código"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cambiar correo
          </Button>
        </div>

        <p className="pt-2 text-center text-[13px] leading-[18px] text-muted-foreground">
          ¿No lo ves? Revisa la carpeta de spam o de promociones.
        </p>
        {TEST_TOOLS ? (
          <p className="text-center text-xs text-muted-foreground">
            Solo en desarrollo: cualquier código de 6 dígitos entra; 000000 simula uno equivocado.
          </p>
        ) : null}
      </div>
    </AuthScaffold>
  );
};
