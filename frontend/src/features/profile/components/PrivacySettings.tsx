import React, { useState } from "react";
import { ShieldCheck, Lock, UsersRound } from "lucide-react";
import { SettingsCard } from "./SettingsCard";
import type { Profile } from "../../../services/profile";
import { careService } from "../../../services/care";
import { USUARIO_CONTENT } from "../../../data/usuarioContent";

interface PrivacySettingsProps {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  profile,
  onUpdate,
}) => {
  const { privacy: copy } = USUARIO_CONTENT.settings;
  const activePsi = careService.getActivePsychologist();
  const [isSharingDiary, setIsSharingDiary] = useState(() =>
    careService.isSharingDiary(activePsi.id)
  );

  const handleToggleShare = () => {
    const next = careService.toggleDiaryShare(activePsi.id);
    setIsSharingDiary(next);
  };

  const summaryText = `${
    profile.biometricLock ? "Bloqueo activo" : "Sin bloqueo"
  } · ${isSharingDiary ? "Diario compartido" : "Diario solo tuyo"}`;

  return (
    <SettingsCard
      icon={ShieldCheck}
      tint="voice"
      title={copy.title}
      subtitle={copy.subtitle}
      summary={summaryText}
    >
      {/* 1. Bloqueo de Seguridad */}
      <div className="p-3.5 rounded-xl bg-surface border border-border/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Lock size={18} className="text-voice shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-foreground">
              {copy.lockTitle}
            </h4>
            <p className="text-[11px] text-muted-foreground font-voice">
              {copy.lockSubtitle}
            </p>
          </div>
        </div>

        {/* Switch Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={profile.biometricLock}
          onClick={() =>
            onUpdate({ biometricLock: !profile.biometricLock })
          }
          className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
            profile.biometricLock ? "bg-voice" : "bg-surface-sunken border border-border/40"
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full bg-surface-raised block shadow-xs transition-transform duration-200 ${
              profile.biometricLock ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* 2. Estado de Diario Compartido */}
      <div className="p-3.5 rounded-xl bg-surface border border-border/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <UsersRound size={18} className="text-voice shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-foreground">
              {copy.sharedDiaryTitle}
            </h4>
            <p className="text-[11px] text-muted-foreground font-voice">
              {isSharingDiary
                ? `${copy.sharedActivePrefix} Dra. Valeria Rondón`
                : copy.sharedInactive}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleShare}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer shrink-0 border ${
            isSharingDiary
              ? "bg-surface-sunken hover:bg-destructive/10 text-destructive border-destructive/30"
              : "bg-voice text-voice-foreground border-voice hover:bg-voice-hover"
          }`}
        >
          {isSharingDiary ? copy.revokeShareButton : "Compartir diario"}
        </button>
      </div>

      {/* Nota de privacidad al pie */}
      <p className="text-[11px] text-subtle font-voice leading-relaxed pt-1">
        {copy.footnote}
      </p>
    </SettingsCard>
  );
};

export default PrivacySettings;
