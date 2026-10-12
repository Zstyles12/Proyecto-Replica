import React from "react";
import { ShieldCheck, UsersRound } from "lucide-react";
import { SettingRow, SettingsCard } from "./SettingsCard";
import { care, useCare } from "../../care/store";
import { findPsychologist } from "../../care/data";

// Tu espacio privado (features/profile/components/profile-settings.tsx de la app): con quién compartes
// tu diario. El bloqueo con Face ID o huella está en la app; en la web queda fuera de la v1.
export const PrivacySettings = React.forwardRef<HTMLDivElement, { expanded?: boolean }>(({ expanded }, ref) => {
  const state = useCare();
  const shares = state.shares.filter((s) => s.active);
  const sharedWith = shares.map((s) => findPsychologist(s.psychologistId)?.name.split(" ")[0]).filter(Boolean);

  return (
    <SettingsCard
      ref={ref}
      expanded={expanded}
      icon={ShieldCheck}
      tint="voice"
      title="Tu espacio privado"
      subtitle="Tu diario es solo tuyo"
      summary={sharedWith.length ? `Diario compartido con ${sharedWith.join(", ")}` : "Diario solo tuyo"}
    >
      {shares.length ? (
        shares.map((share) => {
          const p = findPsychologist(share.psychologistId);
          return (
            <SettingRow
              key={share.psychologistId}
              icon={UsersRound}
              title="Diario compartido"
              subtitle={`Lo puede leer ${p?.name ?? "tu psicólogo"}`}
              right={
                <button
                  type="button"
                  onClick={() => care.setDiaryShare(share.psychologistId, false)}
                  className="min-h-9 shrink-0 rounded-full bg-muted px-3 text-[13px] font-semibold text-destructive hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice"
                >
                  Dejar de compartir
                </button>
              }
            />
          );
        })
      ) : (
        <SettingRow icon={UsersRound} title="Diario compartido" subtitle="No lo compartes con nadie" />
      )}
      <p className="px-1 text-xs leading-4 text-muted-foreground">
        Tus notas privadas no las lee nadie más, aunque compartas tu diario. El bloqueo con Face ID o huella está en la app de Replica.
      </p>
    </SettingsCard>
  );
});
PrivacySettings.displayName = "PrivacySettings";
