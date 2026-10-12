import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BadgeCheck, CalendarDays, Compass, Heart, NotebookPen, Palette, RotateCcw, Sprout, Stethoscope, TrendingUp } from "lucide-react";
import { CofreButton } from "../components/brand/CofreButton";
import { Enter } from "../components/motion/Motion";
import { PhraseCard } from "../features/cofre/components/PhraseCard";
import { useFavoritePhrases } from "../features/cofre/store";
import { useNotes } from "../features/journal/store";
import { MOOD_LABELS, moodColor } from "../features/journal/moods";
import { recentSummary } from "../features/profile/metrics";
import { useProfile } from "../features/profile/store";
import { ProfileHero } from "../features/profile/components/ProfileHero";
import { MetricTile } from "../features/profile/components/MetricTile";
import { ReplySettings } from "../features/profile/components/ReplySettings";
import { PrivacySettings } from "../features/profile/components/PrivacySettings";
import { AppearanceSettings } from "../features/profile/components/AppearanceSettings";
import { AccountCard } from "../features/profile/components/AccountCard";
import { EditProfileModal } from "../features/profile/components/EditProfileModal";
import { LinkRow } from "../features/profile/components/SettingsCard";
import { sessionActions, TEST_TOOLS } from "../lib/session";
import { tutorials, useActiveTour, useCancelToursOnLeave } from "../lib/tutorials";

const PSYCHOLOGIST_STATUS = {
  none: "Ofrece tus servicios en Replica",
  review: "Tu solicitud está en revisión",
  verified: "Perfil verificado",
} as const;

// Las primeras favoritas a la vista; el resto está en Mi cofre.
const FAVORITES_PREVIEW = 3;
type TourCard = "reply" | "privacy" | "appearance" | null;

/**
 * Usuario (app/(tabs)/usuario/index.tsx). Sin título grande: la ficha encabeza la pantalla. En escritorio,
 * la ficha y tu cuenta a la izquierda; lo demás a la derecha (DESIGN-WEB.md §4).
 */
export const Usuario: React.FC = () => {
  const navigate = useNavigate();
  const profile = useProfile();
  const notes = useNotes();
  const favorites = useFavoritePhrases();
  const [editing, setEditing] = useState(false);
  const stats = useMemo(() => recentSummary(notes, 30), [notes]);
  const openEvolution = () => navigate("/evolucion");

  // Recorrido de la primera visita: cada paso abre su tarjeta de ajustes y cierra la anterior. Al
  // terminar, todo vuelve a quedar plegado.
  const replyRef = useRef<HTMLDivElement>(null);
  const privacyRef = useRef<HTMLDivElement>(null);
  const appearanceRef = useRef<HTMLDivElement>(null);
  const [tourCard, setTourCard] = useState<TourCard>(null);
  const tour = useActiveTour();
  const touring = tour?.id === "usuario";
  useCancelToursOnLeave(["usuario"]);
  // Al terminar el recorrido, todo vuelve a quedar plegado.
  const openCard = touring ? tourCard : null;
  useEffect(() => {
    const t = setTimeout(
      () =>
        tutorials.start("usuario", [
          {
            target: replyRef,
            before: () => setTourCard("reply"),
            radius: 24,
            text: "Tu réplica: elige su tono y a qué hora llega la réplica del día.",
          },
          {
            target: privacyRef,
            before: () => setTourCard("privacy"),
            radius: 24,
            text: "Tu espacio privado: con qué psicólogo compartes tu diario.",
          },
          {
            target: appearanceRef,
            before: () => setTourCard("appearance"),
            radius: 24,
            text: "Apariencia: claro, oscuro o como tu dispositivo, y los sonidos de Replica.",
          },
        ]),
      900
    );
    return () => clearTimeout(t);
  }, []);

  const shown = favorites.slice(0, FAVORITES_PREVIEW);

  return (
    <div className="lg:grid lg:grid-cols-[340px_1fr] lg:items-start lg:gap-8">
      <EditProfileModal isOpen={editing} onClose={() => setEditing(false)} />

      <aside className="space-y-6 lg:sticky lg:top-8">
        <Enter>
          <ProfileHero
            name={profile.name}
            intention={profile.intention}
            photo={profile.photo}
            memberSince={profile.memberSince}
            onEdit={() => setEditing(true)}
          />
        </Enter>
        <Enter index={1} className="hidden lg:block">
          <AccountCard />
        </Enter>
      </aside>

      <div className="mt-6 min-w-0 space-y-6 lg:mt-0">
        <Enter index={1} className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.8px] text-muted-foreground">Tus métricas</h2>
            <span className="flex items-center gap-1 text-[13px] font-medium text-voice">
              <TrendingUp size={14} aria-hidden="true" />
              Últimos 30 días
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricTile
              icon={Sprout}
              label="Racha"
              value={stats.streak}
              unit={stats.streak === 1 ? "día" : "días"}
              caption="Seguidos escribiendo"
              onClick={openEvolution}
            />
            <MetricTile icon={NotebookPen} tint="neutral" label="Reflexiones" value={stats.notes} caption="Entradas escritas" onClick={openEvolution} />
            <MetricTile
              icon={CalendarDays}
              tint="reply"
              label="Días escritos"
              value={stats.daysWritten}
              unit={`de ${stats.days}`}
              caption="Con al menos una nota"
              onClick={openEvolution}
            />
            <MetricTile
              icon={Heart}
              tint="emotion"
              label="Ánimo frecuente"
              value={stats.topMood ? MOOD_LABELS[stats.topMood] : "—"}
              dot={stats.topMood ? moodColor(stats.topMood) : undefined}
              caption={stats.topMood ? `En ${stats.topMoodCount} de ${stats.moodNotes} notas` : "Elige tu ánimo al escribir"}
              onClick={openEvolution}
            />
          </div>
        </Enter>

        <Enter index={2} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Heart size={18} className="fill-emotion text-emotion" aria-hidden="true" />
            <h2 className="flex-1 font-replica text-xl font-medium leading-[26px] text-foreground">Tus favoritas</h2>
            <CofreButton />
          </div>
          {favorites.length ? (
            <div className="space-y-3">
              {shown.map((p) => (
                <PhraseCard key={p.key} phrase={p} />
              ))}
            </div>
          ) : (
            <p className="rounded-md bg-surface-sunken p-4 text-[15px] leading-[21px] text-muted-foreground">
              Marca como favorita una frase del día o de una réplica y quedará guardada aquí.
            </p>
          )}
        </Enter>

        <Enter index={3} className="space-y-3">
          <ReplySettings ref={replyRef} expanded={openCard === "reply"} />
          <PrivacySettings ref={privacyRef} expanded={openCard === "privacy"} />
          <AppearanceSettings ref={appearanceRef} expanded={openCard === "appearance"} />
        </Enter>

        <Enter index={4} className="lg:hidden">
          <AccountCard />
        </Enter>

        <Enter index={5}>
          <div className="space-y-0.5 rounded-lg border border-border/40 bg-surface-raised p-2 shadow-raised dark:shadow-none">
            <LinkRow
              icon={profile.psychologist.status === "verified" ? BadgeCheck : Stethoscope}
              tint="voice"
              title="Soy psicólogo o psicóloga"
              subtitle={PSYCHOLOGIST_STATUS[profile.psychologist.status]}
              onClick={() => navigate("/usuario/psicologo")}
            />
            <LinkRow
              icon={Compass}
              title="Ver los tutoriales otra vez"
              subtitle="Un recorrido corto por cada pantalla"
              onClick={() => {
                tutorials.reset();
                // Empieza por Inicio, como la primera vez.
                navigate("/");
              }}
            />
            {TEST_TOOLS ? (
              <>
                <LinkRow icon={Palette} title="Playground" subtitle="Solo en desarrollo" onClick={() => navigate("/playground")} />
                <LinkRow icon={RotateCcw} title="Repetir el registro" subtitle="Solo en desarrollo" onClick={sessionActions.restartOnboarding} />
              </>
            ) : null}
          </div>
        </Enter>

        <Enter index={6} className="flex flex-col items-center gap-1 pb-2">
          <p className="px-8 text-center font-replica text-[15px] italic leading-[21px] text-subtle">Replica · Un diario que te responde</p>
          <p className="flex items-center gap-1 text-[13px]">
            <Link to="/legal/terminos" className="rounded-full px-3 py-2 font-medium text-voice hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice">
              Términos
            </Link>
            <span className="text-muted-foreground" aria-hidden="true">
              ·
            </span>
            <Link to="/legal/privacidad" className="rounded-full px-3 py-2 font-medium text-voice hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-voice">
              Privacidad
            </Link>
          </p>
        </Enter>
      </div>
    </div>
  );
};

export default Usuario;
