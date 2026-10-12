// Guardado local mientras todo es simulado (con Supabase, los datos vendrán del servidor).
// Cada lectura y escritura va protegida: en una ventana privada o con el almacenamiento bloqueado,
// la web sigue funcionando, solo que no recuerda nada.

export function readJSON<T>(key: string, fallback: () => T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback();
    return JSON.parse(raw) as T;
  } catch {
    return fallback();
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Sin almacenamiento: se sigue en memoria.
  }
}

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Sin almacenamiento: se sigue en memoria.
  }
}

// Claves de la primera versión de la web, con otro modelo de datos. Se borran una sola vez.
const LEGACY_KEYS = [
  "replica_auth_session",
  "replica_entries",
  "replica_ai_replies",
  "replica_day_replies",
  "replica_seed_version",
  "replica_care_state",
  "replica.profile",
];

export function dropLegacyData() {
  try {
    for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  } catch {
    // Nada que limpiar.
  }
}
