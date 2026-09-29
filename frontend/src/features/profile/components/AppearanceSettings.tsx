import React, { useState, useEffect } from "react";
import { Palette, Sun, Moon, Laptop, Volume2, VolumeX } from "lucide-react";
import { SettingsCard } from "./SettingsCard";
import { useTheme } from "../../../hooks/useTheme";
import {
  isSoundsEnabled,
  setSoundsEnabled,
  playSound,
} from "../../../lib/sounds";
import { USUARIO_CONTENT } from "../../../data/usuarioContent";

export const AppearanceSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [soundsOn, setSoundsOn] = useState(() => isSoundsEnabled());
  const { appearance: copy } = USUARIO_CONTENT.settings;

  useEffect(() => {
    const handleSoundChange = (e: Event) => {
      const custom = e as CustomEvent<{ enabled: boolean }>;
      setSoundsOn(custom.detail?.enabled ?? isSoundsEnabled());
    };
    window.addEventListener("replica_sounds_change", handleSoundChange);
    return () => window.removeEventListener("replica_sounds_change", handleSoundChange);
  }, []);

  const handleToggleSounds = () => {
    const next = !soundsOn;
    setSoundsOn(next);
    setSoundsEnabled(next);
    if (next) {
      playSound("favorito");
    }
  };

  const themeLabel =
    theme === "light" ? "Claro" : theme === "dark" ? "Oscuro" : "Sistema";
  const summaryText = `${themeLabel} · sonidos ${
    soundsOn ? "activados" : "apagados"
  }`;

  return (
    <SettingsCard
      icon={Palette}
      tint="emotion"
      title={copy.title}
      subtitle={copy.subtitle}
      summary={summaryText}
    >
      {/* 1. Selector de Tema */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-subtle uppercase tracking-wider block">
          {copy.themeTitle}
        </span>

        <div className="inline-flex w-full p-1 rounded-full bg-surface-sunken border border-border/40 select-none">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              theme === "light"
                ? "bg-surface-raised text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun size={13} />
            <span>Claro</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              theme === "dark"
                ? "bg-surface-raised text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon size={13} />
            <span>Oscuro</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              theme === "system"
                ? "bg-surface-raised text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Laptop size={13} />
            <span>Sistema</span>
          </button>
        </div>
      </div>

      {/* 2. Interruptor de Sonidos de Replica */}
      <div className="p-3.5 rounded-xl bg-surface border border-border/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {soundsOn ? (
            <Volume2 size={18} className="text-voice shrink-0" />
          ) : (
            <VolumeX size={18} className="text-muted-foreground shrink-0" />
          )}
          <div>
            <h4 className="text-xs font-semibold text-foreground">
              {copy.soundsTitle}
            </h4>
            <p className="text-[11px] text-muted-foreground font-voice">
              {soundsOn ? copy.soundsSubtitleEnabled : copy.soundsSubtitleDisabled}
            </p>
          </div>
        </div>

        {/* Switch Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={soundsOn}
          onClick={handleToggleSounds}
          className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
            soundsOn ? "bg-voice" : "bg-surface-sunken border border-border/40"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full bg-surface-raised block shadow-xs transition-transform duration-200 ${
              soundsOn ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </SettingsCard>
  );
};

export default AppearanceSettings;
