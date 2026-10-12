import { MIN_PASSWORD, type AuthService } from './types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
// que simula una contraseña incorrecta (para ver esos estados). Apple y Google devuelven una cuenta de
// prueba. Entrar con contraseña (o recuperarla) es una cuenta que ya existía, con su nombre en el
// perfil; crearla con el código es una nueva; con Apple o Google decide lo que eligió la persona.
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
      account: { email: clean, provider: 'email', name: profileName(clean), existing: true },
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
    return {
      ok: true,
      account: {
        email: email.trim().toLowerCase(),
        provider: 'email',
        name: null,
        existing: false,
      },
    };
  },

  async signInWithProvider(provider, intent) {
    await wait(1100);
    return {
      ok: true,
      account: {
        email: provider === 'apple' ? 'ana.lucia@icloud.com' : 'ana.lucia@gmail.com',
        provider,
        name: 'Ana Lucía',
        existing: intent === 'entrar',
      },
    };
  },

  async signOut() {
    await wait(200);
  },
};
