/**
 * Servicio de autenticación simulada.
 * Diseñado con el mismo contrato y forma de datos que proveerá Supabase Auth en la Etapa B.
 */

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  intention?: string;
  tone: "suave" | "directa";
  dayReplyTime: "20:00" | "22:00";
  isConfigured: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: UserProfile;
  token: string;
}

const SESSION_KEY = "replica_auth_session";

function notifyAuthChange() {
  window.dispatchEvent(new Event("replica-auth-changed"));
}

export const authService = {
  getSession(): AuthSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  },

  async signInWithPassword(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    // Simulación de latencia de red serena (200 ms)
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (password === "error123") {
      return {
        success: false,
        error: "No pudimos comprobar tus datos. Verifica tu correo y contraseña.",
      };
    }

    const existingSession = this.getSession();
    const user: UserProfile =
      existingSession && existingSession.user.email === email
        ? existingSession.user
        : {
            id: `usr_${Date.now()}`,
            email,
            name: email.split("@")[0],
            tone: "suave",
            dayReplyTime: "22:00",
            isConfigured: true,
            createdAt: new Date().toISOString(),
          };

    const session: AuthSession = {
      user,
      token: `simulated_token_${Date.now()}`,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    notifyAuthChange();
    return { success: true };
  },

  async signUpWithPassword(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (password === "error123") {
      return {
        success: false,
        error: "No se pudo registrar la cuenta con estos datos.",
      };
    }

    const user: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      name: "",
      tone: "suave",
      dayReplyTime: "22:00",
      isConfigured: false,
      createdAt: new Date().toISOString(),
    };

    const session: AuthSession = {
      user,
      token: `simulated_token_${Date.now()}`,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    notifyAuthChange();
    return { success: true };
  },

  saveOnboardingProfile(profile: Partial<UserProfile>): void {
    const session = this.getSession();
    if (!session) return;

    const updatedUser: UserProfile = {
      ...session.user,
      ...profile,
      isConfigured: true,
    };

    const updatedSession: AuthSession = {
      ...session,
      user: updatedUser,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    notifyAuthChange();
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    notifyAuthChange();
  },

  subscribe(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener("replica-auth-changed", handler);
    return () => window.removeEventListener("replica-auth-changed", handler);
  },
};
