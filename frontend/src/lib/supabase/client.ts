import { createClient } from "@supabase/supabase-js";

// Sin estas variables no hay servidor: la web corre con sus servicios simulados. La clave es la
// pública del proyecto, y lo que protege los datos son las reglas de acceso de la base de datos.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = url && key ? createClient(url, key) : null;
export const hasBackend = supabase !== null;
// Para subir archivos con su progreso, que el cliente no informa.
export const supabaseUrl = url ?? "";
export const supabaseKey = key ?? "";
