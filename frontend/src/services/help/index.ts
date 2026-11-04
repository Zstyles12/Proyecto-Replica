import { supabase } from "../../lib/supabase/client";
import { HELP_RESOURCES } from "../../data/helpResources";
import type { HelpResource, HelpService } from "./types";

type Row = {
  id: string;
  country: string;
  kind: HelpResource["kind"];
  name: string;
  contact: string;
  description: string;
  source_url: string;
  checked_at: string;
};

// Con Supabase, la tabla help_resources (solo las activas); sin él, la misma lista en data/. Se trae
// una vez por visita.
let cached: Promise<HelpResource[]> | null = null;

export const helpService: HelpService = {
  resources() {
    if (!supabase) return Promise.resolve(HELP_RESOURCES);
    const client = supabase;
    cached ??= (async () => {
      const { data, error } = await client
        .from("help_resources")
        .select("id, country, kind, name, contact, description, source_url, checked_at")
        .eq("active", true);
      if (error) throw error;
      return (data as Row[]).map((r) => ({
        id: r.id,
        country: r.country,
        kind: r.kind,
        name: r.name,
        contact: r.contact,
        description: r.description,
        sourceUrl: r.source_url,
        checkedAt: r.checked_at,
      }));
    })().catch((error: unknown) => {
      cached = null;
      throw error;
    });
    return cached;
  },
};

export type { HelpResource, HelpService } from "./types";
