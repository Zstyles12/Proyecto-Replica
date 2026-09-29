import type { Entry } from "./journal";

export type ReplyTone = "suave" | "profundo" | "directo";
export type ReminderSlot = "manana" | "tarde" | "noche";
export type DayReplyHour = 20 | 22;

export interface Profile {
  name: string;
  intention: string;
  photo: string | null;
  email: string;
  memberSince: string;
  reminder: {
    enabled: boolean;
    slot: ReminderSlot;
  };
  biometricLock: boolean;
  replyTone: ReplyTone;
  dayReplyHour: DayReplyHour;
}

const STORAGE_KEY = "replica.profile";

function defaultProfile(): Profile {
  const since = new Date();
  since.setDate(since.getDate() - 14); // 2 semanas tejiendo
  return {
    name: "Sebastián",
    intention: "Vivir con más calma y presencia",
    photo: null,
    email: "sebastian@replica.app",
    memberSince: since.toISOString(),
    reminder: {
      enabled: true,
      slot: "noche",
    },
    biometricLock: false,
    replyTone: "suave",
    dayReplyHour: 22,
  };
}

class ProfileService {
  private current: Profile;
  private listeners = new Set<(profile: Profile) => void>();

  constructor() {
    this.current = this.load();
  }

  private load(): Profile {
    if (typeof window === "undefined") return defaultProfile();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const def = defaultProfile();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(def));
        return def;
      }
      return { ...defaultProfile(), ...JSON.parse(raw) };
    } catch {
      return defaultProfile();
    }
  }

  private save() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.current));
      this.listeners.forEach((cb) => cb(this.current));
    } catch (e) {
      console.error("Error guardando perfil:", e);
    }
  }

  public getProfile(): Profile {
    return this.current;
  }

  public updateProfile(updates: Partial<Profile>): Profile {
    this.current = {
      ...this.current,
      ...updates,
      reminder: updates.reminder
        ? { ...this.current.reminder, ...updates.reminder }
        : this.current.reminder,
    };
    this.save();
    return this.current;
  }

  public subscribe(callback: (profile: Profile) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  public exportUserDataJSON(entries: Entry[]) {
    const backupData = {
      version: "1.0",
      exported_at: new Date().toISOString(),
      profile: this.current,
      total_entries: entries.length,
      entries: entries.map((e) => ({
        id: e.id,
        created_at: e.created_at,
        mood: e.mood,
        tag: e.tag,
        is_private: e.is_private,
        is_favorite: e.is_favorite,
        content: e.content,
      })),
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `replica_diario_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
}

export const profileService = new ProfileService();
