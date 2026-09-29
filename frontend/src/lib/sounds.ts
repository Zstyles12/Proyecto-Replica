/**
 * Sistema de Sonidos de Replica (1:1 con zairo-main/lib/sounds.ts y docs/DESIGN.md §8).
 * 
 * Una sola familia sonora: acompaña los momentos importantes, nunca cada toque.
 * Bajos a propósito (volumen 0.55): se oyen de cerca, no llenan la habitación.
 * Fail-safe: si el navegador restringe audio sin interacción previa, falla en silencio sin romper nada.
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

const SOUND_SOURCES: Record<SoundName, string> = {
  // Tocar "Replica" o "Guardar": la hoja se pliega al pasar el hilo
  papel: `${base}/sounds/papel.wav`,
  // La réplica terminó de escribirse (campanita serena)
  replica: `${base}/sounds/replica.wav`,
  // Marcar como favorita una frase o nota
  favorito: `${base}/sounds/favorito.wav`,
  // Quitar de favoritas (rotura del corazón)
  favoritoQuitar: `${base}/sounds/favorito_quitar.wav`,
  // Enviar mensaje en Chat
  enviado: `${base}/sounds/enviado.wav`,
  // Recibir mensaje en Chat
  recibido: `${base}/sounds/recibido.wav`,
  // Frase o imagen guardada / compartida
  guardado: `${base}/sounds/guardado.wav`,
  notificacion_psicologo: `${base}/sounds/notificacion_psicologo.wav`,
  notificacion_recordatorio: `${base}/sounds/notificacion_recordatorio.wav`,
  brote: `${base}/sounds/brote.wav`,
  flor: `${base}/sounds/flor.wav`,
};

// Bajos a propósito según zairo-main y DESIGN.md: 0.55
const VOLUME = 0.55;

let audioContext: AudioContext | null = null;
const audioBuffers: Partial<Record<SoundName, AudioBuffer>> = {};
const audioCache: Partial<Record<SoundName, HTMLAudioElement>> = {};
const activeSources: Partial<Record<SoundName, AudioBufferSourceNode>> = {};
let audioUnlocked = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      try {
        audioContext = new AudioContextClass();
      } catch (err) {
        console.debug("[Replica Sounds] No se pudo inicializar AudioContext:", err);
      }
    }
  }
  return audioContext;
}

function getAudio(name: SoundName): HTMLAudioElement {
  if (!audioCache[name]) {
    const audio = new Audio(SOUND_SOURCES[name]);
    audio.volume = VOLUME;
    audio.preload = "auto";
    audioCache[name] = audio;
  }
  return audioCache[name]!;
}

export function isSoundsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("replica_sounds_enabled") === "true";
}

export function setSoundsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("replica_sounds_enabled", enabled ? "true" : "false");
  if (enabled) {
    unlockAudio();
    preloadSounds();
  }
  window.dispatchEvent(
    new CustomEvent("replica_sounds_change", { detail: { enabled } })
  );
}

export function toggleSounds(): boolean {
  const next = !isSoundsEnabled();
  setSoundsEnabled(next);
  return next;
}

/**
 * Desbloquea y pre-carga la familia sonora en el primer gesto del usuario (pointerdown, keydown o click),
 * garantizando que llamadas asíncronas posteriores (streaming de réplica o chat) no sean
 * bloqueadas por la política de autoplay del navegador.
 */
export function unlockAudio() {
  if (typeof window === "undefined" || audioUnlocked) return;
  audioUnlocked = true;

  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch((err) => {
      console.debug("[Replica Sounds] Error al reanudar AudioContext:", err);
    });
  }

  preloadSounds();
}

export function playSound(name: SoundName) {
  if (typeof window === "undefined") return;
  if (!isSoundsEnabled()) return;

  const ctx = getAudioContext();

  // Intento 1: Reproducción polifónica de baja latencia con Web Audio API (inmune a autoplay diferido)
  if (ctx && audioBuffers[name]) {
    try {
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const source = ctx.createBufferSource();
      source.buffer = audioBuffers[name]!;
      const gainNode = ctx.createGain();
      gainNode.gain.value = VOLUME;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      activeSources[name] = source;
      source.onended = () => {
        if (activeSources[name] === source) {
          delete activeSources[name];
        }
      };
      source.start(0);
      return;
    } catch (err) {
      console.debug(`[Replica Sounds] Fallo en Web Audio para '${name}', intentando fallback HTML5:`, err);
    }
  }

  // Intento 2: Fallback con HTMLAudioElement
  try {
    const audio = getAudio(name);
    // Solo reiniciar si el archivo ya cargó metadatos (evita DOMException: InvalidStateError con HAVE_NOTHING)
    if (audio.readyState >= 1) {
      audio.currentTime = 0;
    }
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // En caso de que el navegador mantenga la política estricta de interacción
        console.debug(`[Replica Sounds] Reproducción restringida para '${name}':`, err);
      });
    }
  } catch (err) {
    console.debug(`[Replica Sounds] Error reproduciendo '${name}':`, err);
  }
}

/**
 * Detiene la reproducción activa de un sonido si está sonando.
 */
export function stopSound(name: SoundName) {
  if (typeof window === "undefined") return;
  if (activeSources[name]) {
    try {
      activeSources[name]?.stop();
    } catch {
      // Ignorar si ya se detuvo
    }
    delete activeSources[name];
  }
  if (audioCache[name]) {
    try {
      audioCache[name]!.pause();
      audioCache[name]!.currentTime = 0;
    } catch {
      // Ignorar
    }
  }
}

export function preloadSounds() {
  if (typeof window === "undefined") return;

  const ctx = getAudioContext();
  const names = Object.keys(SOUND_SOURCES) as SoundName[];

  names.forEach((name) => {
    // 1. Instanciar HTMLAudioElement para respaldo
    try {
      const audio = getAudio(name);
      if (audio.readyState === 0) {
        audio.load();
      }
    } catch (err) {
      console.debug("[Replica Sounds] Fallback preload error:", err);
    }

    // 2. Pre-decodificar en memoria mediante Web Audio API si está disponible
    if (ctx && !audioBuffers[name]) {
      fetch(SOUND_SOURCES[name])
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.arrayBuffer();
        })
        .then((buf) => ctx.decodeAudioData(buf))
        .then((decoded) => {
          audioBuffers[name] = decoded;
        })
        .catch((err) => {
          console.debug(`[Replica Sounds] Preload Web Audio de '${name}' no disponible:`, err);
        });
    }
  });
}
