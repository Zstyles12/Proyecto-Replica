import React, { useState, useEffect } from "react";
import { CircleUserRound, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { profileService, type Profile } from "../services/profile";
import { journalService } from "../services/journal";
import { recentSummary } from "../services/metrics";
import { ProfileHero } from "../features/profile/components/ProfileHero";
import { MetricTile } from "../features/profile/components/MetricTile";
import { ReplySettings } from "../features/profile/components/ReplySettings";
import { PrivacySettings } from "../features/profile/components/PrivacySettings";
import { AppearanceSettings } from "../features/profile/components/AppearanceSettings";
import { AccountCard } from "../features/profile/components/AccountCard";
import { EditProfileModal } from "../features/profile/components/EditProfileModal";
import { DailyChestCard } from "../features/journal/components/DailyChestCard";
import { PLAYGROUND_CONTENT } from "../data/playgroundContent";
import { USUARIO_CONTENT } from "../data/usuarioContent";
import { INICIO_CONTENT } from "../data/inicioContent";
import {
  Sprout,
  NotebookPen,
  CalendarDays,
  Heart as HeartIcon,
} from "lucide-react";

export const Usuario: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(() =>
    profileService.getProfile()
  );
  const [entries] = useState(() => journalService.getEntries());
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { header, metrics: metricsCopy, favorites: favCopy, settings: settingsCopy } =
    USUARIO_CONTENT;
  const moods = PLAYGROUND_CONTENT.moods;

  useEffect(() => {
    const unsubscribe = profileService.subscribe((updated) => {
      setProfile({ ...updated });
    });
    return () => unsubscribe();
  }, []);

  const stats = recentSummary(entries, 30);
  const topMoodObj = stats.topMood
    ? moods.find((m) => m.id === stats.topMood)
    : null;

  const defaultFavoritePhrase = INICIO_CONTENT.dailyQuotes[0];

  const handleUpdateProfile = (updates: Partial<Profile>) => {
    const updated = profileService.updateProfile(updates);
    setProfile({ ...updated });
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Modal para editar foto, nombre y frase de intención */}
      <EditProfileModal
        isOpen={isEditOpen}
        initialName={profile.name}
        initialIntention={profile.intention}
        onClose={() => setIsEditOpen(false)}
        onSave={({ name, intention }) =>
          handleUpdateProfile({ name, intention })
        }
      />

      {/* Cabecera de la sección */}
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="inline-block px-3 py-1 rounded-full bg-voice-soft text-voice text-xs font-semibold uppercase tracking-wider">
            {header.stepBadge}
          </span>
          <div className="w-10 h-10 rounded-full bg-voice-soft text-voice flex items-center justify-center shadow-xs">
            <CircleUserRound size={18} />
          </div>
        </div>
        <h1 className="font-replica text-3xl md:text-4xl font-normal tracking-tight text-foreground">
          {header.title}
        </h1>
        <p className="font-voice text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
          {header.description}
        </p>
      </header>

      {/* Cuadrícula responsiva: 2 columnas balanceadas en escritorio (>= 1024px) */}
      <div className="lg:grid lg:grid-cols-[360px_1fr] lg:gap-8 lg:items-start space-y-6 lg:space-y-0">
        {/* Columna Lateral Izquierda (360px): Ficha de Identidad y Cuenta */}
        <aside className="space-y-6">
          <ProfileHero
            name={profile.name}
            intention={profile.intention}
            memberSince={profile.memberSince}
            onEdit={() => setIsEditOpen(true)}
          />

          <AccountCard profile={profile} />
        </aside>

        {/* Columna Principal Derecha (1fr): Métricas, Favoritas y Acordeón de Ajustes */}
        <div className="space-y-6 min-w-0">
          {/* Métricas de los últimos 30 días */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {metricsCopy.title}
              </span>
              <span className="text-xs font-semibold text-voice">
                {metricsCopy.spanBadge}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricTile
                icon={Sprout}
                tint="voice"
                label={metricsCopy.streak.label}
                value={stats.streak}
                unit={
                  stats.streak === 1
                    ? metricsCopy.streak.unitSingular
                    : metricsCopy.streak.unitPlural
                }
                caption={metricsCopy.streak.caption}
                onClick={() => navigate("/evolucion")}
              />

              <MetricTile
                icon={NotebookPen}
                tint="neutral"
                label={metricsCopy.reflections.label}
                value={stats.notes}
                unit={
                  stats.notes === 1
                    ? metricsCopy.reflections.unitSingular
                    : metricsCopy.reflections.unitPlural
                }
                caption={metricsCopy.reflections.caption}
                onClick={() => navigate("/evolucion")}
              />

              <MetricTile
                icon={CalendarDays}
                tint="reply"
                label={metricsCopy.daysWritten.label}
                value={stats.daysWritten}
                unit={`de ${stats.days}`}
                caption={metricsCopy.daysWritten.caption}
                onClick={() => navigate("/evolucion")}
              />

              <MetricTile
                icon={HeartIcon}
                tint="emotion"
                label={metricsCopy.topMood.label}
                value={topMoodObj?.name || metricsCopy.topMood.emptyValue}
                dot={topMoodObj?.colorVar}
                caption={
                  topMoodObj
                    ? `${metricsCopy.topMood.captionPrefix} ${stats.topMoodCount} ${metricsCopy.topMood.captionMiddle} ${stats.moodNotes} ${metricsCopy.topMood.captionSuffix}`
                    : metricsCopy.topMood.emptyCaption
                }
                onClick={() => navigate("/evolucion")}
              />
            </div>
          </div>

          {/* Tus frases favoritas guardadas */}
          <div className="p-5 md:p-6 rounded-3xl bg-surface-raised border border-border/40 shadow-raised space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-emotion fill-emotion" />
                <h3 className="font-replica text-lg font-medium text-foreground">
                  {favCopy.title}
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emotion font-semibold">
                {favCopy.badge}
              </span>
            </div>

            <DailyChestCard
              tag={defaultFavoritePhrase.tag}
              quote={defaultFavoritePhrase.quote}
              author={defaultFavoritePhrase.author}
            />
          </div>

          {/* Acordeón de Ajustes del Sistema */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1 block">
              {settingsCopy.title}
            </span>

            <div className="space-y-3">
              {/* 1. Ajustes de Réplica */}
              <ReplySettings
                profile={profile}
                onUpdate={handleUpdateProfile}
              />

              {/* 2. Ajustes de Privacidad */}
              <PrivacySettings
                profile={profile}
                onUpdate={handleUpdateProfile}
              />

              {/* 3. Ajustes de Apariencia y Sonidos */}
              <AppearanceSettings />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Usuario;
