import { mockApproved } from '../professional/mockProfessionalService';
import { MIN_PASSWORD, type AccountRole, type AuthService } from './types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Las cuentas de prueba del área profesional (docs/02-estructura.md, "Roles"). Las demás son 'user',
// salvo las que el administrador simulado aprobó en este navegador.
const TEST_ROLES: Record<string, AccountRole> = {
  'admin@replica.test': 'admin',
  'valeria@replica.test': 'psychologist',
};
const roleOf = (email: string): AccountRole => TEST_ROLES[email] ?? (mockApproved(email) ? 'psychologist' : 'user');

// El nombre "guardado en el perfil" de una cuenta que ya existía: sale del correo
// (manuel.goncalves@… → Manuel).
function profileName(email: string) {
  const first =
    email
      .split('@')[0]
      .split(/[._\-+\d]+/)
      .find(Boolean) ?? '';
  return first ? first[0].toUpperCase() + first.slice(1) : null;
}

// Simulación mientras no existe Supabase: cualquier código de 6 dígitos entra, salvo 000000 que
// simula un código equivocado; cualquier contraseña de 8 caracteres o más entra, salvo "equivocada"
// que simula una contraseña incorrecta (para ver esos estados). Google devuelve una cuenta de
// prueba. Entrar con contraseña (o recuperarla) es una cuenta que ya existía, con su nombre en el
// perfil; crearla con el código es una nueva; con Google decide lo que eligió la persona.
export const mockAuthService: AuthService = {
  async signUp(_email, password) {
    await wait(900);
    if (password.length < MIN_PASSWORD) return { ok: false, error: 'weak-password' };
    return { ok: true };
  },

  async signInWithPassword(email, password) {
    await wait(800);
    if (password === 'equivocada' || password.length < MIN_PASSWORD) {
      return { ok: false, error: 'wrong-password' };
    }
    const clean = email.trim().toLowerCase();
    return {
      ok: true,
      account: { email: clean, provider: 'email', name: profileName(clean), existing: true, role: roleOf(clean) },
    };
  },

  async updatePassword(_email, password) {
    await wait(700);
    if (password.length < MIN_PASSWORD) return { ok: false, error: 'weak-password' };
    return { ok: true };
  },

  async sendCode() {
    await wait(900);
    return { ok: true };
  },

  async verifyCode(email, code) {
    await wait(800);
    if (code === '000000') return { ok: false, error: 'invalid-code' };
    const clean = email.trim().toLowerCase();
    return {
      ok: true,
      account: {
        email: clean,
        provider: 'email',
        name: null,
        existing: false,
        role: roleOf(clean),
      },
    };
  },

  async signInWithProvider(provider, intent) {
    await wait(1100);
    return {
      ok: true,
      account: {
        email: 'ana.lucia@example.com',
        provider,
        name: 'Ana Lucía',
        existing: intent === 'entrar',
        role: 'user',
      },
    };
  },

  async signOut() {
    await wait(200);
  },
  async currentUserId() {
    return null;
  },
  // La sesión simulada vive en el navegador (lib/session.ts).
  async restore() {
    return null;
  },
  onSignedOut() {},
};
