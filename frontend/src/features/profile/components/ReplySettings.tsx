import React from "react";
import { MoonStar, Sparkles } from "lucide-react";
import { SettingRow, SettingsCard } from "./SettingsCard";
import { Segmented } from "../../../components/ui/Segmented";
import { ChoiceCard } from "../../auth/components/Choices";
import { ReminderSettings } from "../../reminder/ReminderSettings";
import { TONES, toneTitle } from "../tones";
import { DAY_REPLY_HOURS, updateProfile, useProfile, type DayReplyHour } from "../store";

// Tu réplica (features/profile/components/profile-settings.tsx de la app): el tono y a qué hora llega la
// réplica del día, y el recordatorio diario (features/reminder).
export const ReplySettings = React.forwardRef<HTMLDivElement, { expanded?: boolean }>(({ expanded }, ref) => {
  const profile = useProfile();
  return (
    <SettingsCard
      ref={ref}
      expanded={expanded}
      icon={Sparkles}
      tint="reply"
      title="Tu réplica"
      subtitle="Elige cómo te responde Replica"
      summary={`${toneTitle(profile.replyTone)} · réplica del día a las ${profile.dayReplyHour}:00`}
    >
      <div role="radiogroup" aria-label="Tono de la réplica" className="space-y-2">
        <p className="px-1 text-[13px] text-muted-foreground">Tono de la réplica</p>
        {TONES.map((t) => (
          <ChoiceCard
            key={t.value}
            name="settings-tone"
            title={t.title}
            description={t.description}
            selected={profile.replyTone === t.value}
            onSelect={() => updateProfile({ replyTone: t.value })}
          />
        ))}
        <p className="px-1 text-xs text-muted-foreground">Se aplica a tus próximas réplicas.</p>
      </div>
      <SettingRow
        icon={MoonStar}
        title="Réplica del día"
        subtitle="Lee todo lo que escribiste hoy y te responde una vez más"
        right={
          <Segmented<DayReplyHour>
            label="Hora de la réplica del día"
            options={DAY_REPLY_HOURS.map((h) => ({ value: h, label: `${h}:00` }))}
            value={profile.dayReplyHour}
            onChange={(dayReplyHour) => updateProfile({ dayReplyHour })}
          />
        }
      />
      <ReminderSettings />
    </SettingsCard>
  );
});
ReplySettings.displayName = "ReplySettings";
