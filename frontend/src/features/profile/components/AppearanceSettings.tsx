import React, { useSyncExternalStore } from "react";
import { Palette, Volume2, VolumeX } from "lucide-react";
import { SettingRow, SettingsCard } from "./SettingsCard";
import { Segmented } from "../../../components/ui/Segmented";
import { useTheme, type ThemeMode } from "../../../hooks/useTheme";
import { isSoundsEnabled, playSound, setSoundsEnabled, subscribeSounds } from "../../../lib/sounds";

const THEMES: { value: ThemeMode; label: string }[] = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
];

// Apariencia (features/profile/components/profile-settings.tsx de la app): el tema y los sonidos.
export const AppearanceSettings = React.forwardRef<HTMLDivElement, { expanded?: boolean }>(({ expanded }, ref) => {
  const { theme, setTheme } = useTheme();
  const sounds = useSyncExternalStore(subscribeSounds, isSoundsEnabled);
  const themeLabel = THEMES.find((t) => t.value === theme)?.label ?? "Sistema";

  return (
    <SettingsCard
      ref={ref}
      expanded={expanded}
      icon={Palette}
      tint="emotion"
      title="Apariencia"
      subtitle="Tema y sonidos"
      summary={`${themeLabel} · sonidos ${sounds ? "activados" : "apagados"}`}
    >
      <Segmented label="Tema" options={THEMES} value={theme} onChange={setTheme} className="w-full" />
      <SettingRow
        icon={sounds ? Volume2 : VolumeX}
        title="Sonidos"
        subtitle={sounds ? "Suaves, y solo en los momentos importantes" : "Apagados"}
        right={
          <button
            type="button"
            role="switch"
            aria-checked={sounds}
            aria-label="Sonidos"
            onClick={() => {
              setSoundsEnabled(!sounds);
              if (!sounds) playSound("favorito");
            }}
            className={`relative h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors duration-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice focus-visible:ring-offset-2 ${
              sounds ? "bg-voice" : "bg-muted"
            }`}
          >
            <span
              aria-hidden="true"
              className={`block h-6 w-6 rounded-full bg-surface-raised shadow-xs transition-transform duration-small ease-out ${
                sounds ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        }
      />
    </SettingsCard>
  );
});
AppearanceSettings.displayName = "AppearanceSettings";
