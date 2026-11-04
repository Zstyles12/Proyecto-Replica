import { supabase } from "../../lib/supabase/client";
import { mockAuthService } from "./mockAuthService";
import { supabaseAuthService } from "./supabaseAuthService";
import type { AuthService } from "./types";

// Con Supabase, la cuenta real; sin él, la simulada, con el mismo contrato.
export const authService: AuthService = supabase ? supabaseAuthService(supabase) : mockAuthService;

export { MIN_PASSWORD } from "./types";
export type { AccountRole, AuthAccount, AuthError, AuthProvider, AuthResult, CodePurpose } from "./types";
