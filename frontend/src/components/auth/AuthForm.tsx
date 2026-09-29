import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/Button";
import { GoogleIcon } from "../common/GoogleIcon";
import { AppleIcon } from "../common/AppleIcon";
import { AUTH_CONTENT } from "../../data/authContent";
import { authService } from "../../services/auth";

interface AuthFormProps {
  initialMode?: "login" | "register";
  onSuccess: (isNewUser: boolean) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  initialMode = "register",
  onSuccess,
}) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { form } = AUTH_CONTENT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    // Validaciones amables
    if (!email || !email.includes("@")) {
      setNotice(form.notices.invalidEmail);
      return;
    }
    if (password.length < 6) {
      setNotice(form.notices.shortPassword);
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const res = await authService.signInWithPassword(email, password);
        if (!res.success) {
          setNotice(res.error || form.notices.simulatedError);
        } else {
          onSuccess(false);
        }
      } else {
        const res = await authService.signUpWithPassword(email, password);
        if (!res.success) {
          setNotice(res.error || form.notices.simulatedError);
        } else {
          onSuccess(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSimulated = async () => {
    setLoading(true);
    await authService.signInWithPassword("usuario@ejemplo.com", "oauth_pass");
    setLoading(false);
    onSuccess(false);
  };

  return (
    <div className="space-y-6">
      {/* Selector de modo Iniciar sesión / Crear cuenta */}
      <div className="flex p-1 rounded-full bg-surface-sunken border border-border/30 max-w-xs mx-auto">
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setNotice(null);
          }}
          className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all duration-indicator ${
            mode === "register"
              ? "bg-surface-raised text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {form.tabs.register}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setNotice(null);
          }}
          className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all duration-indicator ${
            mode === "login"
              ? "bg-surface-raised text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {form.tabs.login}
        </button>
      </div>

      {/* Título y subtítulo */}
      <div className="text-center space-y-1">
        <h2 className="font-replica text-2xl md:text-3xl font-normal text-foreground tracking-tight">
          {mode === "login" ? form.loginTitle : form.registerTitle}
        </h2>
        <p className="font-voice text-sm text-muted-foreground leading-relaxed">
          {mode === "login" ? form.loginSubtitle : form.registerSubtitle}
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de Correo */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="auth-email"
            className="block text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1"
          >
            {form.fields.email.label}
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={form.fields.email.placeholder}
            required
            className="w-full h-[46px] px-4 rounded-DEFAULT bg-surface-raised border border-border/40 text-foreground placeholder:text-subtle text-sm focus:outline-none focus:border-voice focus:ring-2 focus:ring-voice/20 transition-all"
          />
        </div>

        {/* Campo de Contraseña */}
        <div className="space-y-1.5 text-left">
          <label
            htmlFor="auth-password"
            className="block text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1"
          >
            {form.fields.password.label}
          </label>
          <div className="relative">
            <input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={form.fields.password.placeholder}
              required
              className="w-full h-[46px] pl-4 pr-11 rounded-DEFAULT bg-surface-raised border border-border/40 text-foreground placeholder:text-subtle text-sm focus:outline-none focus:border-voice focus:ring-2 focus:ring-voice/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={
                showPassword
                  ? form.fields.password.hidePasswordAria
                  : form.fields.password.showPasswordAria
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-foreground transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Aviso amable de Replica (Sección 3.1: nunca rojo para avisos comunes) */}
        {notice && (
          <div className="p-3 rounded-md bg-reply-soft/30 border border-reply/20 text-left">
            <p className="font-replica italic text-reply text-xs leading-relaxed">
              "{notice}"
            </p>
          </div>
        )}

        {/* Botón Principal */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          className="w-full mt-2"
        >
          {loading
            ? "Verificando..."
            : mode === "login"
            ? form.buttons.submitLogin
            : form.buttons.submitRegister}
        </Button>
      </form>

      {/* Separador */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/30" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-subtle">
            {form.socialDivider}
          </span>
        </div>
      </div>

      {/* Botones Sociales */}
      <div className="space-y-2.5">
        <Button
          type="button"
          variant="secondary"
          size="normal"
          icon={<GoogleIcon className="w-4 h-4 text-foreground" />}
          onClick={handleOAuthSimulated}
          className="w-full"
        >
          {form.buttons.google}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="normal"
          icon={<AppleIcon className="w-4 h-4 text-foreground" />}
          onClick={handleOAuthSimulated}
          className="w-full"
        >
          {form.buttons.apple}
        </Button>
      </div>

      {/* Nota de ayuda para pruebas */}
      <p className="text-[11px] text-subtle text-center italic font-mono pt-1">
        {form.notices.demoHint}
      </p>
    </div>
  );
};
