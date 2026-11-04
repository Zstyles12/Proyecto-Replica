import { useSyncExternalStore } from "react";
import { readJSON, writeJSON } from "./storage";

// El bloqueo del diario (RF-52, DESIGN-WEB.md §11). Protege el acceso a Replica desde ESTE navegador:
// no cifra nada y nunca se presenta así. Vive solo aquí, por cuenta: el PIN se guarda como derivación
// PBKDF2 con sal, y la llave de acceso (WebAuthn) solo comprueba que es la persona del dispositivo.

const KEY = "replica.lock.";
const ITERATIONS = 210_000;
// Tras cinco intentos fallidos, una espera.
const MAX_FAILURES = 5;
const WAIT_MS = 30_000;

export type LockMinutes = 1 | 5 | 15;
export const LOCK_MINUTES: LockMinutes[] = [1, 5, 15];

type Saved = {
  salt: string;
  hash: string;
  iterations: number;
  minutes: LockMinutes;
  // La llave de acceso de este dispositivo, si se creó.
  credentialId?: string;
  failures: number;
  waitUntil: number;
};

export type LockConfig = { minutes: LockMinutes; passkey: boolean };

function keyOf(email: string) {
  return `${KEY}${email.toLowerCase()}`;
}

function readSaved(email: string | undefined | null) {
  return email ? readJSON<Saved | null>(keyOf(email), () => null) : null;
}

function toBase64(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let text = "";
  for (const b of view) text += String.fromCharCode(b);
  return btoa(text);
}

function fromBase64(text: string) {
  return Uint8Array.from(atob(text), (c) => c.charCodeAt(0));
}

function random(length: number) {
  return crypto.getRandomValues(new Uint8Array(length));
}

async function derive(pin: string, salt: Uint8Array, iterations: number) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations }, material, 256);
  return toBase64(bits);
}

// Comparación de largo fijo, para no decir cuánto coincide.
function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function isValidPin(pin: string) {
  return /^\d{4,6}$/.test(pin);
}

// Si el dispositivo tiene su propio bloqueo (huella, rostro o el del equipo) para una llave de acceso.
export async function passkeyAvailable() {
  try {
    return (
      typeof PublicKeyCredential !== "undefined" &&
      (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable())
    );
  } catch {
    return false;
  }
}

async function createPasskey(email: string) {
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: random(32),
      rp: { name: "Replica" },
      user: { id: random(16), name: email, displayName: "Replica" },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "discouraged" },
      attestation: "none",
      timeout: 60_000,
    },
  })) as PublicKeyCredential | null;
  return credential ? toBase64(credential.rawId) : null;
}

// La llave responde solo si la persona se identificó en el dispositivo (la marca UV de la respuesta).
async function askPasskey(credentialId: string) {
  const credential = (await navigator.credentials.get({
    publicKey: {
      challenge: random(32),
      allowCredentials: [{ type: "public-key", id: fromBase64(credentialId) }],
      userVerification: "required",
      timeout: 60_000,
    },
  })) as PublicKeyCredential | null;
  const response = credential?.response as AuthenticatorAssertionResponse | undefined;
  if (!response) return false;
  const flags = new Uint8Array(response.authenticatorData)[32] ?? 0;
  return (flags & 0x04) !== 0;
}

// Bloqueada hasta que se demuestre lo contrario: al abrir la web, siempre se pide.
let locked = true;
let version = 0;
const listeners = new Set<() => void>();
const emit = () => {
  version += 1;
  listeners.forEach((l) => l());
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function save(email: string, saved: Saved | null) {
  if (saved) writeJSON(keyOf(email), saved);
  else {
    try {
      localStorage.removeItem(keyOf(email));
    } catch {
      // Sin almacenamiento, no había bloqueo.
    }
  }
  emit();
}

export const lock = {
  config(email: string | null | undefined): LockConfig | null {
    const saved = readSaved(email);
    return saved ? { minutes: saved.minutes, passkey: !!saved.credentialId } : null;
  },

  // Activa el bloqueo con su PIN. Si se pide la llave de acceso y la persona la cancela, queda solo el
  // PIN. Devuelve si quedó con llave.
  async enable(email: string, pin: string, minutes: LockMinutes, withPasskey: boolean) {
    const salt = random(16);
    const hash = await derive(pin, salt, ITERATIONS);
    let credentialId: string | undefined;
    if (withPasskey) credentialId = (await createPasskey(email).catch(() => null)) ?? undefined;
    locked = false;
    save(email, { salt: toBase64(salt), hash, iterations: ITERATIONS, minutes, credentialId, failures: 0, waitUntil: 0 });
    return !!credentialId;
  },

  setMinutes(email: string, minutes: LockMinutes) {
    const saved = readSaved(email);
    if (saved) save(email, { ...saved, minutes });
  },

  // Cuánto falta para poder intentar otra vez, en milisegundos.
  waitLeft(email: string | null | undefined) {
    const saved = readSaved(email);
    return saved ? Math.max(0, saved.waitUntil - Date.now()) : 0;
  },

  async checkPin(email: string, pin: string) {
    const saved = readSaved(email);
    if (!saved || lock.waitLeft(email) > 0) return false;
    const ok = same(await derive(pin, fromBase64(saved.salt), saved.iterations), saved.hash);
    if (ok) {
      save(email, { ...saved, failures: 0, waitUntil: 0 });
      return true;
    }
    const failures = saved.failures + 1;
    save(email, failures >= MAX_FAILURES ? { ...saved, failures: 0, waitUntil: Date.now() + WAIT_MS } : { ...saved, failures });
    return false;
  },

  async checkPasskey(email: string) {
    const saved = readSaved(email);
    if (!saved?.credentialId) return false;
    try {
      return await askPasskey(saved.credentialId);
    } catch {
      return false;
    }
  },

  disable(email: string) {
    locked = false;
    save(email, null);
  },

  lockNow() {
    if (locked) return;
    locked = true;
    emit();
  },

  unlock() {
    locked = false;
    emit();
  },

  // Al cerrar sesión o eliminar la cuenta: el bloqueo de este navegador se va con ella.
  forget(email: string | null | undefined) {
    if (email) save(email, null);
    locked = true;
  },
};

// Si hay que mostrar /bloqueado: la cuenta tiene bloqueo en este navegador y no se ha desbloqueado.
export function useLocked(email: string | null | undefined) {
  return useSyncExternalStore(subscribe, () => locked && !!readSaved(email));
}

export function useLockConfig(email: string | null | undefined) {
  // `version` cambia con cada guardado: la configuración se vuelve a leer.
  useSyncExternalStore(subscribe, () => version);
  return lock.config(email);
}
