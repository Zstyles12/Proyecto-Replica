import { mockAuthService } from "./mockAuthService";
import type { AuthService } from "./types";

// Punto único de reemplazo: con Supabase Auth se cambia aquí.
export const authService: AuthService = mockAuthService;

export { MIN_PASSWORD } from "./types";
export type { AuthAccount, AuthError, AuthProvider, AuthResult } from "./types";
