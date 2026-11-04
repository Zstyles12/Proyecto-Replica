import { supabase } from "../../lib/supabase/client";
import { mockProfessionalService, syncMockDirectory } from "./mockProfessionalService";
import { supabaseProfessionalService } from "./supabaseProfessionalService";
import type { ProfessionalService } from "./types";

// Con Supabase, las tablas reales y set-role; sin él, el mundo simulado de este navegador.
export const professionalService: ProfessionalService = supabase ? supabaseProfessionalService(supabase) : mockProfessionalService;
if (!supabase) syncMockDirectory();

export * from "./types";
