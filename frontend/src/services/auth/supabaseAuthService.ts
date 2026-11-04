import { AuthError as SupabaseAuthError, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { AccountRole, AuthAccount, AuthError, AuthService } from "./types";

const ROLES: AccountRole[] = ["user", "psychologist", "admin"];

function roleOf(user: User): AccountRole {
  const role = user.app_metadata.role as AccountRole | undefined;
  return role && ROLES.includes(role) ? role : "user";
}

function accountOf(user: User): AuthAccount {
  const meta = user.user_metadata as { full_name?: string; name?: string };
  return {
    email: user.email ?? "",
    provider: user.app_metadata.provider === "google" ? "google" : "email",
    name: meta.full_name ?? meta.name ?? null,
    // Si ya terminó su configuración lo dice su perfil, que la sesión carga al entrar.
    existing: false,
    role: roleOf(user),
  };
}

function errorOf(error: unknown): AuthError {
  if (!(error instanceof SupabaseAuthError)) return "unknown";
  switch (error.code) {
    case "invalid_credentials":
      return "wrong-password";
    case "email_not_confirmed":
      return "unconfirmed";
    case "user_already_exists":
    case "email_exists":
      return "email-taken";
    case "weak_password":
      return "weak-password";
    case "otp_expired":
      return "expired-code";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "too-many-requests";
    default:
      return error.status === 0 ? "network" : "unknown";
  }
}

export function supabaseAuthService(supabase: SupabaseClient): AuthService {
  return {
    async signUp(email, password) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { ok: false, error: errorOf(error) };
      // Con un correo ya confirmado Supabase no da error, para no revelarlo: devuelve una cuenta sin
      // identidades.
      if (data.user && !data.user.identities?.length) return { ok: false, error: "email-taken" };
      return { ok: true };
    },

    async signInWithPassword(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: errorOf(error) };
      return { ok: true, account: accountOf(data.user) };
    },

    async sendCode(email, purpose) {
      const { error } =
        purpose === "recovery"
          ? await supabase.auth.resetPasswordForEmail(email)
          : await supabase.auth.resend({ type: "signup", email });
      return error ? { ok: false, error: errorOf(error) } : { ok: true };
    },

    async verifyCode(email, code, purpose) {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: purpose });
      if (error || !data.user) return { ok: false, error: error ? errorOf(error) : "invalid-code" };
      return { ok: true, account: accountOf(data.user) };
    },

    async updatePassword(_email, password) {
      const { error } = await supabase.auth.updateUser({ password });
      return error ? { ok: false, error: errorOf(error) } : { ok: true };
    },

    async signInWithProvider(provider) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) return { ok: false, error: errorOf(error) };
      // El navegador se va a Google. Al volver, restore() retoma la sesión.
      return new Promise(() => {});
    },

    async signOut() {
      await supabase.auth.signOut();
    },

    async currentUserId() {
      const { data } = await supabase.auth.getSession();
      return data.session?.user.id ?? null;
    },

    async restore() {
      const { data } = await supabase.auth.getSession();
      return data.session ? accountOf(data.session.user) : null;
    },

    onSignedOut(listener) {
      supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") listener();
      });
    },
  };
}
