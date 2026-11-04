export type AuthProvider = 'google' | 'email';
// Con Supabase llega de app_metadata y solo el servidor lo cambia.
export type AccountRole = 'user' | 'psychologist' | 'admin';

// Largo mínimo de la contraseña (el mismo que se configurará en Supabase Auth).
export const MIN_PASSWORD = 8;

export type AuthAccount = {
  email: string;
  provider: AuthProvider;
  // Google entrega el nombre; con correo lo pide la personalización (o, si la cuenta ya
  // existía, viene de su perfil).
  name: string | null;
  // La cuenta ya existía y terminó su configuración: al entrar se salta el consentimiento y la
  // personalización. Con Supabase se sabe por el perfil guardado en el servidor.
  existing: boolean;
  role: AccountRole;
};

export type AuthError =
  | 'invalid-code'
  | 'expired-code'
  | 'wrong-password'
  | 'weak-password'
  | 'email-taken'
  // La cuenta existe, pero nunca confirmó el código del correo.
  | 'unconfirmed'
  | 'too-many-requests'
  | 'network'
  | 'cancelled'
  | 'unknown';

export type AuthResult = { ok: true; account: AuthAccount } | { ok: false; error: AuthError };

// Para qué es el código: confirmar la cuenta nueva o recuperar la contraseña.
export type CodePurpose = 'signup' | 'recovery';

// La misma forma que tendrá con Supabase Auth: correo y contraseña (el código de 6 dígitos confirma el
// correo al crear la cuenta y sirve para recuperar la contraseña), y Google con su ventana.
export type AuthService = {
  // Crear cuenta: guarda la contraseña y envía el código que confirma el correo (signUp).
  signUp(email: string, password: string): Promise<{ ok: true } | { ok: false; error: AuthError }>;
  // Entrar con correo y contraseña (signInWithPassword).
  signInWithPassword(email: string, password: string): Promise<AuthResult>;
  // Envía un código al correo: para confirmar la cuenta o para recuperar la contraseña.
  sendCode(
    email: string,
    purpose: CodePurpose
  ): Promise<{ ok: true } | { ok: false; error: AuthError }>;
  verifyCode(email: string, code: string, purpose: CodePurpose): Promise<AuthResult>;
  // Después de recuperar con el código: la contraseña nueva (updateUser).
  updatePassword(
    email: string,
    password: string
  ): Promise<{ ok: true } | { ok: false; error: AuthError }>;
  // intent: si la persona eligió "Ya tengo cuenta" o "Crear mi cuenta" (la simulación lo usa para
  // decidir si la cuenta ya existía; con Supabase lo dice el perfil).
  signInWithProvider(provider: 'google', intent: 'crear' | 'entrar'): Promise<AuthResult>;
  signOut(): Promise<void>;
  // El id de la cuenta con sesión abierta.
  currentUserId(): Promise<string | null>;
  // La cuenta con sesión abierta en este navegador (al cargar la web, o al volver de Google).
  restore(): Promise<AuthAccount | null>;
  // La sesión terminó fuera de esta pestaña.
  onSignedOut(listener: () => void): void;
};
