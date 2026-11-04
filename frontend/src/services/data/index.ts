import { supabase } from "../../lib/supabase/client";
import { supabaseData } from "./supabaseData";
import type { DataService } from "./types";

// Sin Supabase es null: los stores se quedan con sus datos simulados, guardados en el navegador.
export const dataService: DataService | null = supabase ? supabaseData(supabase) : null;

export { DEFAULT_REMINDER_TIME } from "./types";
export type { AccountData, CareData, DataService, LiveHandlers, ProfilePatch, SavedPhrase } from "./types";
