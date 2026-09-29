import React from "react";
import { Sparkles, MoonStar, Bell } from "lucide-react";
import { SettingsCard } from "./SettingsCard";
import type { Profile, ReplyTone, DayReplyHour, ReminderSlot } from "../../../services/profile";
import { USUARIO_CONTENT } from "../../../data/usuarioContent";

interface ReplySettingsProps {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

export const ReplySettings: React.FC<ReplySettingsProps> = ({
  profile,
  onUpdate,
}) => {
  const { reply: copy } = USUARIO_CONTENT.settings;

  const currentToneObj = copy.tones.find((t) => t.value === profile.replyTone);
  const summaryText = `${currentToneObj?.title ?? ""} · réplica a las ${profile.dayReplyHour}:00`;

  return (
    <SettingsCard
      icon={Sparkles}
      tint="reply"
      title={copy.title}
      subtitle={copy.subtitle}
      summary={summaryText}
    >
      {/* 1. Selector de Tono */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-subtle uppercase tracking-wider block">
          {copy.tonesLabel}
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {copy.tones.map((t) => {
            const isSelected = profile.replyTone === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => onUpdate({ replyTone: t.value as ReplyTone })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                  isSelected
                    ? "bg-reply-soft/20 border-reply text-foreground shadow-xs font-medium"
                    : "bg-surface hover:bg-surface-sunken border-border/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    {t.title}
                  </span>
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected ? "border-reply" : "border-border"
                    }`}
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-reply" />
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground font-voice leading-relaxed">
                  {t.description}
                </p>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-subtle font-voice pt-1">
          {copy.tonesFootnote}
        </p>
      </div>

      {/* 2. Hora de la Réplica del Día */}
      <div className="p-3.5 rounded-xl bg-surface border border-border/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MoonStar size={18} className="text-reply shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-foreground">
              {copy.dayReplyRow.title}
            </h4>
            <p className="text-[11px] text-muted-foreground font-voice">
              {copy.dayReplyRow.subtitle}
            </p>
          </div>
        </div>

        <div className="inline-flex p-0.5 rounded-full bg-surface-sunken border border-border/40 shrink-0">
          {copy.dayReplyRow.options.map((opt) => {
            const isSelected = String(profile.dayReplyHour) === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  onUpdate({ dayReplyHour: Number(opt.value) as DayReplyHour })
                }
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-surface-raised text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Recordatorio para Escribir */}
      <div className="p-3.5 rounded-xl bg-surface border border-border/30 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-voice shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-foreground">
                {copy.reminderRow.title}
              </h4>
              <p className="text-[11px] text-muted-foreground font-voice">
                {profile.reminder.enabled
                  ? `${copy.reminderRow.enabledSubtitle} · ${
                      copy.reminderRow.slots.find(
                        (s) => s.value === profile.reminder.slot
                      )?.label || ""
                    }`
                  : copy.reminderRow.disabledSubtitle}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={profile.reminder.enabled}
            onClick={() =>
              onUpdate({
                reminder: {
                  ...profile.reminder,
                  enabled: !profile.reminder.enabled,
                },
              })
            }
            className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
              profile.reminder.enabled ? "bg-voice" : "bg-surface-sunken border border-border/40"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full bg-surface-raised block shadow-xs transition-transform duration-200 ${
                profile.reminder.enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Selector de franja horaria si el recordatorio está activo */}
        {profile.reminder.enabled && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/20">
            {copy.reminderRow.slots.map((slot) => {
              const isSelected = profile.reminder.slot === slot.value;
              return (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() =>
                    onUpdate({
                      reminder: {
                        ...profile.reminder,
                        slot: slot.value as ReminderSlot,
                      },
                    })
                  }
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                    isSelected
                      ? "bg-voice-soft text-voice border-voice font-semibold shadow-xs"
                      : "bg-surface-sunken text-muted-foreground border-border/30 hover:text-foreground"
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </SettingsCard>
  );
};

export default ReplySettings;
