/**
 * Sonidos de Replica (lib/sounds.ts de la app y DESIGN.md §8). Una sola familia, suave, solo en los
 * momentos importantes. En la web empiezan apagados y no se descargan hasta que se activan.
 */

export type SoundName =
  | "papel"
  | "replica"
  | "favorito"
  | "favoritoQuitar"
  | "enviado"
  | "recibido"
  | "guardado"
  | "notificacion_psicologo"
  | "notificacion_recordatorio"
  | "brote"
  | "flor";

export interface SoundMeta {
  id: SoundName;
  file: string;
  name: string;
  description: string;
  volume: number;
}

export const SOUND_DEFINITIONS: SoundMeta[] = [
  {
    id: "papel",
    file: "papel.wav",
    name: "La pasada del hilo / Guardar",
    description: "Al tocar 'Replica' o guardar nota: la hoja se pliega con el roce del papel.",
    volume: 0.55,
  },
  {
    id: "replica",
    file: "replica.wav",
    name: "Réplica completada",
    description: "Campanita serena al concluir la escritura streaming de la IA.",
    volume: 0.55,
  },
  {
    id: "favorito",
    file: "favorito.wav",
    name: "Marcar favorita",
    description: "Latido cálido / pop al marcar como favorita una frase o nota.",
    volume: 0.55,
  },
  {
    id: "favoritoQuitar",
    file: "favorito_quitar.wav",
    name: "Quitar favorita",
    description: "Tuc suave / rotura física al desmarcar una favorita.",
    volume: 0.55,
  },
  {
    id: "enviado",
    file: "enviado.wav",
    name: "Mensaje enviado",
    description: "Tono de salida al enviar un mensaje en el Chat de terapia.",
    volume: 0.55,
  },
  {
    id: "recibido",
    file: "recibido.wav",
    name: "Mensaje recibido",
    description: "Tono de llegada suave cuando el psicólogo responde.",
    volume: 0.55,
  },
  {
    id: "guardado",
    file: "guardado.wav",
    name: "Guardado / Exportado",
    description: "Confirmación al copiar frase destilada o exportar diario.",
    volume: 0.55,
  },
  {
    id: "notificacion_psicologo",
    file: "notificacion_psicologo.wav",
    name: "Aviso de psicólogo",
    description: "Alerta sutil de nueva cita o mensaje profesional agendado.",
    volume: 0.55,
  },
  {
    id: "notificacion_recordatorio",
    file: "notificacion_recordatorio.wav",
    name: "Recordatorio diario",
    description: "Invitación serena para escribir a la hora configurada.",
    volume: 0.55,
  },
  {
    id: "brote",
    file: "brote.wav",
    name: "Brote de la planta",
    description: "Escalera ascendente de notas de madera al germinar la semilla (bienvenida paso 0 -> 1).",
    volume: 0.55,
  },
  {
    id: "flor",
    file: "flor.wav",
    name: "Florecimiento nomeolvides",
    description: "Campanita y apertura luminosa al desplegarse la flor (bienvenida paso 1 -> 2).",
    volume: 0.55,
  },
];

export const SOUND_DURATIONS: Record<SoundName, number> = {
  papel: 850,
  replica: 2800,
  favorito: 600,
  favoritoQuitar: 500,
  enviado: 600,
  recibido: 1100,
  guardado: 1700,
  notificacion_psicologo: 2600,
  notificacion_recordatorio: 3500,
  brote: 1800,
  flor: 2000,
};

const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

const FILES: Record<SoundName, string> = Object.fromEntries(
  SOUND_DEFINITIONS.map((d) => [d.id, `${base}/sounds/${d.file}`])
) as Record<SoundName, string>;

// Bajos a propósito, como en la app: se oyen de cerca, no llenan la habitación.
const VOLUME = 0.55;
const KEY = "replica_sounds_enabled";

// Un solo elemento de audio por sonido: cada archivo se descarga una vez, y solo después de que la
// persona activa los sonidos (en la web empiezan apagados, DESIGN-WEB.md §6).
const players: Partial<Record<SoundName, HTMLAudioElement>> = {};
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

let enabled = typeof window === "undefined" ? false : read();

function player(name: SoundName) {
  let audio = players[name];
  if (!audio) {
    audio = new Audio(FILES[name]);
    audio.volume = VOLUME;
    audio.preload = "auto";
    players[name] = audio;
  }
  return audio;
}

export function isSoundsEnabled(): boolean {
  return enabled;
}

export function subscribeSounds(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setSoundsEnabled(next: boolean) {
  enabled = next;
  try {
    localStorage.setItem(KEY, next ? "true" : "false");
  } catch {
    // Se aplica igual; solo no se recordará.
  }
  // Se activan con un toque: es el momento de preparar los sonidos (el navegador lo permite).
  if (next) (Object.keys(FILES) as SoundName[]).forEach((n) => player(n).load());
  listeners.forEach((l) => l());
  window.dispatchEvent(new CustomEvent("replica_sounds_change", { detail: { enabled: next } }));
}

export function toggleSounds(): boolean {
  setSoundsEnabled(!enabled);
  return enabled;
}

export function playSound(name: SoundName) {
  if (typeof window === "undefined" || !enabled) return;
  try {
    const audio = player(name);
    audio.pause();
    if (audio.readyState >= 1) audio.currentTime = 0;
    // Si el navegador todavía no permite sonar (sin un toque previo), se calla sin romper nada.
    audio.play().catch(() => {});
  } catch {
    // Sin audio disponible.
  }
}

export function stopSound(name: SoundName) {
  const audio = players[name];
  if (!audio) return;
  try {
    audio.pause();
    audio.currentTime = 0;
  } catch {
    // Ya estaba detenido.
  }
}
